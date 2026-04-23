# -*- coding: utf-8 -*-
# pip install playwright
# playwright install

import json
import re
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

URL = "https://i-quran.com/endings"
OUT_DIR = Path("endings_output")


def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def slugify(text: str) -> str:
    text = clean_text(text).lower()
    text = text.replace("/", "_")
    text = re.sub(r"[^\w\u0600-\u06FF]+", "_", text)
    text = re.sub(r"_+", "_", text).strip("_")
    return text or "section"


def dedupe_list(items):
    out = []
    seen = set()
    for item in items:
        key = json.dumps(item, ensure_ascii=False, sort_keys=True) if isinstance(item, dict) else str(item)
        if key not in seen:
            seen.add(key)
            out.append(item)
    return out


def save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_tab_info(page):
    """
    يجمع معلومات كل tab من الصفحة نفسها.
    """
    return page.evaluate("""
    () => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      return tabs
        .map((el, idx) => ({
          index: idx,
          text: (el.innerText || el.textContent || '').trim(),
          ariaControls: el.getAttribute('aria-controls'),
          ariaSelected: el.getAttribute('aria-selected'),
          dataState: el.getAttribute('data-state'),
          id: el.id || null,
          tag: el.tagName
        }))
        .filter(t => t.text);
    }
    """)


def click_tab_and_get_panel(page, tab_text):
    """
    يضغط التبويب بالـ JS لتجنب مشاكل overlay أو scroll،
    ثم يحاول إيجاد panel المرتبط به.
    """
    script = """
    (tabText) => {
      const all = Array.from(document.querySelectorAll('[role="tab"], button'));
      const tab = all.find(el => ((el.innerText || el.textContent || '').trim() === tabText)
        || ((el.innerText || el.textContent || '').trim().includes(tabText)));
      if (!tab) return {ok:false, reason:'tab_not_found'};

      const before = document.body.innerText.slice(0, 8000);

      tab.scrollIntoView({block:'center'});
      tab.click();

      return {
        ok: true,
        ariaControls: tab.getAttribute('aria-controls'),
        id: tab.id || null,
        text: (tab.innerText || tab.textContent || '').trim(),
        before
      };
    }
    """
    result = page.evaluate(script, tab_text)
    if not result.get("ok"):
        raise RuntimeError(f"Tab not found: {tab_text}")

    time.sleep(1.5)

    panel_info = page.evaluate("""
    (info) => {
      function textOf(el) {
        return (el?.innerText || el?.textContent || '').trim();
      }

      let panel = null;

      if (info.ariaControls) {
        panel = document.getElementById(info.ariaControls);
      }

      if (!panel && info.id) {
        panel = document.querySelector(`[aria-labelledby="${info.id}"]`);
      }

      if (!panel) {
        const activePanel =
          document.querySelector('[role="tabpanel"][data-state="active"]') ||
          document.querySelector('[role="tabpanel"]:not([hidden])') ||
          document.querySelector('[data-state="active"][role="tabpanel"]') ||
          document.querySelector('[data-state="active"]');
        if (activePanel) panel = activePanel;
      }

      if (!panel) {
        const panels = Array.from(document.querySelectorAll('[role="tabpanel"], section, main > div, main section'));
        panels.sort((a, b) => textOf(b).length - textOf(a).length);
        panel = panels[0] || null;
      }

      return {
        panelId: panel?.id || null,
        panelHtml: panel?.innerHTML || '',
        panelText: textOf(panel),
        bodyText: document.body.innerText.slice(0, 12000)
      };
    }
    """, result)

    return panel_info


def extract_tables_from_html(panel_locator):
    rows_out = []

    try:
        tables = panel_locator.locator("table")
        for t in range(tables.count()):
            table = tables.nth(t)

            headers = []
            ths = table.locator("thead th")
            if ths.count() == 0:
                ths = table.locator("tr").first.locator("th, td")

            for i in range(ths.count()):
                h = clean_text(ths.nth(i).inner_text())
                if h:
                    headers.append(h)

            rows = table.locator("tbody tr")
            if rows.count() == 0:
                rows = table.locator("tr")

            for r in range(rows.count()):
                row = rows.nth(r)
                cells = row.locator("th, td")
                vals = []
                for c in range(cells.count()):
                    txt = clean_text(cells.nth(c).inner_text())
                    if txt:
                        vals.append(txt)

                if not vals:
                    continue

                if headers and vals == headers[:len(vals)]:
                    continue

                if headers and len(headers) == len(vals):
                    rows_out.append(dict(zip(headers, vals)))
                else:
                    rows_out.append({"values": vals})
    except:
        pass

    return dedupe_list(rows_out)


def extract_list_items(panel_locator):
    items = []
    try:
        loc = panel_locator.locator("li, p")
        for i in range(loc.count()):
            txt = clean_text(loc.nth(i).inner_text())
            if txt and len(txt) > 4:
                items.append(txt)
    except:
        pass
    return dedupe_list(items)


def extract_svg_labels(panel_locator):
    labels = []
    try:
        loc = panel_locator.locator("svg text")
        for i in range(loc.count()):
            txt = clean_text(loc.nth(i).inner_text())
            if txt:
                labels.append(txt)
    except:
        pass
    return dedupe_list(labels)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            viewport={"width": 1600, "height": 2400},
        )
        page = context.new_page()

        page.goto(URL, wait_until="domcontentloaded", timeout=90000)
        try:
            page.wait_for_load_state("networkidle", timeout=15000)
        except:
            pass

        time.sleep(2)

        tab_info = get_tab_info(page)
        save_json(OUT_DIR / "tabs_debug.json", tab_info)

        # فقط التبويبات المطلوبة
        target_tabs = [
            "Attribute Pairs",
            "Frequency",
            "Themes",
            "Density",
            "Makki/Madani",
            "Insights",
        ]

        filename_map = {
            "Attribute Pairs": "attribute_pairs.json",
            "Frequency": "frequency.json",
            "Themes": "themes.json",
            "Density": "density.json",
            "Makki/Madani": "makki_madani.json",
            "Insights": "insights.json",
        }

        for tab_name in target_tabs:
            print(f"Processing: {tab_name}")

            panel = click_tab_and_get_panel(page, tab_name)

            # احفظ HTML خام لكل جزء للتأكد
            html_name = slugify(tab_name) + ".html"
            (OUT_DIR / html_name).write_text(panel["panelHtml"], encoding="utf-8")

            # أنشئ locator للـ panel لو له id، وإلا fallback من main
            if panel.get("panelId"):
                panel_locator = page.locator(f"#{panel['panelId']}")
            else:
                panel_locator = page.locator("main").first

            # scroll بسيط داخل الصفحة بعد اختيار التبويب
            for _ in range(4):
                page.mouse.wheel(0, 1800)
                time.sleep(0.4)

            data = {
                "section": tab_name,
                "panel_id": panel.get("panelId"),
                "panel_text": panel.get("panelText", ""),
                "tables": extract_tables_from_html(panel_locator),
                "list_items": extract_list_items(panel_locator),
                "svg_labels": extract_svg_labels(panel_locator),
            }

            save_json(OUT_DIR / filename_map[tab_name], data)

        browser.close()

    print("Done. Files saved in endings_output/")


if __name__ == "__main__":
    main()