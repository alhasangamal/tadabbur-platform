"""
سكريبت جمع بيانات الشخصيات القرآنية من موقع i-quran.com/characters

الهيكل الدقيق (من تحليل الصور):
══════════════════════════════════════════════════════════════

div.ch-trait
  div.ch-trait-num          → رقم الخاصية
  div.ch-trait-content
    div.ch-trait-title
      span[data-l='ar']     → عنوان الخاصية
    div.ch-trait-detail
      span[data-l='ar']     → شرح الخاصية
    div.ch-trait-ref        ← القسم الذي يحتوي أزرار السور
      button.fb
        onclick="loadChAyah(surahNum, 'ayahRange', 'chay_name_index')"
        span[data-l='ar']   → "البقرة 33-30"   ← السورة + الآيات

div.ayb#chay_adam_0         ← صندوق الآيات (يظهر بعد النقر)
  div.ays
    div.ayi
      span.ayt              → نص الآية
      span.ayn              → رقم الآية

══════════════════════════════════════════════════════════════

التثبيت:
    pip install playwright
    playwright install chromium

التشغيل:
    python quran_characters_scraper.py
"""

import json
import re
import sys
import io
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass




URL         = "https://i-quran.com/characters"
OUTPUT_JSON = r"C:\Users\ALHASSANGAMAL\Desktop\tadabbur-platform\tadabbur-ui\src\data\characters_data.json"
OUTPUT_TEXT = "الشخصيات.txt"



# ─────────────────────────────────────────────────────────────
# فتح ch-body
# ─────────────────────────────────────────────────────────────
def force_open_body(card, page):
    body = card.query_selector("div.ch-body")
    if not body:
        return None

    def is_open():
        return page.evaluate(
            "el => getComputedStyle(el).display !== 'none' && el.offsetHeight > 0",
            body
        )

    if is_open():
        return body

    # محاولة 1: div.ch-aw
    aw = card.query_selector("div.ch-aw")
    if aw:
        try:
            aw.scroll_into_view_if_needed()
            aw.click()
            page.wait_for_timeout(800)
            if is_open():
                return body
        except Exception:
            pass

    # محاولة 2: div.ch-info
    info = card.query_selector("div.ch-info")
    if info:
        try:
            info.scroll_into_view_if_needed()
            info.click()
            page.wait_for_timeout(800)
            if is_open():
                return body
        except Exception:
            pass

    # محاولة 3: الكارت نفسه
    try:
        card.scroll_into_view_if_needed()
        card.click()
        page.wait_for_timeout(800)
        if is_open():
            return body
    except Exception:
        pass

    # محاولة 4: JavaScript force
    try:
        page.evaluate("""
            el => {
                el.style.display = 'block';
                el.style.maxHeight = 'none';
                el.style.overflow = 'visible';
            }
        """, body)
        page.wait_for_timeout(400)
    except Exception:
        pass

    return body


# ─────────────────────────────────────────────────────────────
# جلب الآيات بعد النقر على زر loadChAyah
# ─────────────────────────────────────────────────────────────
def get_verses(btn, page):
    # onclick="loadChAyah(2,'30-33','chay_adam_0')"
    onclick   = btn.get_attribute("onclick") or ""
    box_match = re.search(r"loadChAyah\([^,]+,[^,]+,\s*['\"]([^'\"]+)['\"]", onclick)
    box_id    = box_match.group(1).strip() if box_match else None

    nusus = []
    try:
        btn.scroll_into_view_if_needed()
        btn.click()
        page.wait_for_timeout(800)

        box = None
        if box_id:
            box = page.query_selector(f"#{box_id}")
        if not box:
            visible = page.query_selector_all("div.ayb[style*='block']")
            box = visible[-1] if visible else None

        if box:
            for ayi in box.query_selector_all("div.ayi"):
                ayt = ayi.query_selector("span.ayt")
                ayn = ayi.query_selector("span.ayn")
                if ayt:
                    text = ayt.inner_text().strip()
                    num  = ayn.inner_text().strip() if ayn else ""
                    nusus.append(f"{text} {num}".strip())
    except Exception as e:
        pass

    return nusus


# ─────────────────────────────────────────────────────────────
# استخراج شخصية واحدة
# ─────────────────────────────────────────────────────────────
def scrape_character(card, page, char_type=""):
    char = {}
    char["نوع_الشخصية"] = char_type


    # ══ الاسم ════════════════════════════════════════════════
    ico_el = card.query_selector("div.ch-ico")
    char["أيقونة"] = ico_el.inner_text().strip() if ico_el else "👤"

    ar = card.query_selector("div.ch-nm span.ar")

    en = card.query_selector("div.ch-nm span.en")
    char["الاسم_عربي"]    = ar.inner_text().strip() if ar else ""
    char["الاسم_انجليزي"] = en.inner_text().strip() if en else ""

    # ══ عدد الذكر والخصائص ═══════════════════════════════════
    badges_data = page.evaluate("""
        (card) => {
            const badges = card.querySelectorAll('span.ch-badge.cnt');
            return Array.from(badges).map(b => {
                let num = '';
                for (const node of b.childNodes) {
                    if (node.nodeType === 3 && node.textContent.trim()) {
                        num = node.textContent.trim();
                        break;
                    }
                }
                const arSpan = b.querySelector("span[data-l='ar']");
                return { num, label: arSpan ? arSpan.innerText.trim() : '' };
            });
        }
    """, card)

    char["عدد_الذكر"]    = ""
    char["عدد_الخصائص"] = ""
    for b in badges_data:
        label = b["label"]
        if "ذكر" in label or "ذِكر" in label:
            char["عدد_الذكر"] = b["num"]
        elif "خاصية" in label or "صفة" in label:
            char["عدد_الخصائص"] = b["num"]

    # ══ التصنيفات ════════════════════════════════════════════
    cats = []
    for badge in card.query_selector_all("span.ch-badge.cat"):
        s = badge.query_selector("span[data-l='ar']")
        if s:
            cats.append(s.inner_text().strip())
    char["التصنيفات"] = cats

    # ══ السور ════════════════════════════════════════════════
    surahs_el = card.query_selector("div.ch-surahs span[data-l='ar']")
    char["السور"] = surahs_el.inner_text().strip() if surahs_el else ""

    # ══ فتح ch-body ══════════════════════════════════════════
    body = force_open_body(card, page)

    # ══ الخصائص ══════════════════════════════════════════════
    traits = []

    if body:
        trait_divs = body.query_selector_all("div.ch-trait")
        if not trait_divs:
            page.wait_for_timeout(1200)
            trait_divs = body.query_selector_all("div.ch-trait")

        print(f"    🔍 {len(trait_divs)} خاصية")

        for trait_div in trait_divs:
            # عنوان الخاصية
            title_el = trait_div.query_selector("div.ch-trait-title span[data-l='ar']")
            khasisa  = title_el.inner_text().strip() if title_el else ""

            # المعنى
            detail_el = trait_div.query_selector("div.ch-trait-detail span[data-l='ar']")
            maana     = detail_el.inner_text().strip() if detail_el else ""

            # ── الأزرار في div.ch-trait-ref ──────────────────
            # كل زر = button.fb داخل div.ch-trait-ref
            maraje3 = []
            ref_divs = trait_div.query_selector_all("div.ch-trait-ref")

            for ref_div in ref_divs:
                for btn in ref_div.query_selector_all("button.fb"):
                    # السورة والآية: آخر span[data-l='ar'] في الزر
                    # "البقرة 33-30"
                    ar_spans = btn.query_selector_all("span[data-l='ar']")
                    ref_text = ""
                    for sp in ar_spans:
                        t = sp.inner_text().strip()
                        # نأخذ الـ span الذي يحتوي اسم سورة وأرقام
                        if re.search(r'\d', t):
                            ref_text = t
                            break

                    # فصل "البقرة 33-30" → سورة + آية
                    m = re.match(r'^(.+?)\s+([\d\-–]+)$', ref_text)
                    if m:
                        surah_name = m.group(1).strip()
                        ayah_range = m.group(2).strip()
                    else:
                        surah_name = ref_text
                        ayah_range = ""

                    # جلب الآيات
                    nusus = get_verses(btn, page)

                    maraje3.append({
                        "السورة": surah_name,
                        "الآية":  ayah_range,
                        "النص":   "\n".join(nusus),
                    })

            traits.append({
                "الخاصية": khasisa,
                "المعنى":  maana,
                "المراجع": maraje3,
            })

    char["الخصائص"] = traits
    return char


# ─────────────────────────────────────────────────────────────
def scrape_all(page):
    results = []
    current_type = ""

    # جلب جميع العناصر في القائمة (عناوين وبطاقات)
    elements = page.query_selector_all("#chList > div")
    total_cards = page.query_selector_all("div.ch-card").__len__()
    
    print(f"  [Info] Processing {len(elements)} list elements\n")

    char_index = 0
    for el in elements:
        cls = el.get_attribute("class") or ""
        
        # إذا كان عنوان قسم (نوع الشخصية)
        if "da-gh" in cls:
            type_el = el.query_selector("span.sn-ar")
            if type_el:
                current_type = type_el.inner_text().strip()
                print(f"\n  --- {current_type} ---")
            continue
        
        # إذا كانت بطاقة شخصية
        if "ch-card" in cls:
            char_index += 1
            card = el
            name_el = card.query_selector("div.ch-nm span.ar")
            name    = name_el.inner_text().strip() if name_el else f"Character {char_index}"
            print(f"  [{char_index}/{total_cards}] {name}")

            try:
                data = scrape_character(card, page, current_type)
                if data.get("الاسم_عربي"):
                    results.append(data)
                    ok = "[OK]" if data["الخصائص"] else "[Empty]"
                    print(f"    {ok} — mentions:{data['عدد_الذكر']} | traits:{len(data['الخصائص'])}\n")
            except Exception as e:
                print(f"    [Error] {e}\n")

    return results



# ─────────────────────────────────────────────────────────────
def format_text(results):
    lines = ["Quranic Characters", "=" * 60, ""]
    for char in results:
        lines.append(f"الاسم: {char['الاسم_عربي']}  ({char['الاسم_انجليزي']})")
        lines.append(f"النوع: {char['نوع_الشخصية']}")
        lines.append(f"عدد الذكر: {char['عدد_الذكر']}  |  الخصائص: {char['عدد_الخصائص']}")
        lines.append(f"التصنيفات: {' · '.join(char['التصنيفات'])}")
        lines.append(f"السور: {char['السور']}")
        if char["الخصائص"]:
            lines.append(f"\nالخصائص ({len(char['الخصائص'])}):")
            for t in char["الخصائص"]:
                lines.append(f"\n  الخاصية : {t['الخاصية']}")
                lines.append(f"  المعنى  : {t['المعنى']}")
                for ref in t["المراجع"]:
                    lines.append(f"  السورة  : {ref['السورة']}")
                    lines.append(f"  الآية   : {ref['الآية']}")
                    if ref["النص"]:
                        lines.append("  النص    :")
                        for line in ref["النص"].split("\n"):
                            lines.append(f"    {line}")
        lines += ["", "=" * 60, ""]
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("Quranic Characters - i-quran.com/characters")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="ar",
            viewport={"width": 1280, "height": 900},
        )
        page = ctx.new_page()

        print(f"[URL] {URL}")
        try:
            page.goto(URL, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_selector("div.ch-info", timeout=30000)
            page.wait_for_timeout(2000)
        except Exception as e:
            print(f"[Warning] Page load: {e}")
        
        print(f"[Title] {page.title()}")

        results = scrape_all(page)
        browser.close()

    print(f"\n{'='*60}")
    total   = len(results)
    empty   = sum(1 for r in results if not r["الخصائص"])
    print(f"[Success] {total} characters | [Empty] {empty} with empty traits")

    if not results:
        print("[Warning] No data found.")
        return

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"[Save] JSON -> {OUTPUT_JSON}")

    with open(OUTPUT_TEXT, "w", encoding="utf-8") as f:
        f.write(format_text(results))
    print(f"[Save] Text -> {OUTPUT_TEXT}")


if __name__ == "__main__":
    main()