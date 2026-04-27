"""
سكريبت جمع البيانات الكونية من موقع i-quran.com/kawniyyat

الهيكل مطابق لصفحة الحوارات (نفس الـ CSS classes):
══════════════════════════════════════════════════════════════

  div.da-ref
    span[data-l='ar']        → اسم السورة  "الأنعام"
    " 38"                    → رقم الآية (text node)

  div.da-title[data-l='ar'] → عنوان الآية الكونية
  div.da-title-en[data-l='en'] → العنوان بالإنجليزي

  div.da-text               → النص القرآني (مباشرة بدون نقر)

  div.da-cats
    span.da-cat
      span[data-l='ar']     → التخصص (عالم الحيوان...)

  div.da-note[data-l='ar'] → الغرض / الملاحظة

══════════════════════════════════════════════════════════════

الناتج:
{
  "الآية":    "وما من دابة في الأرض ولا طائر يطير بجناحيه إلا أمم أمثالكم",
  "السورة":   "الأنعام 38",
  "النص":     "وَمَا مِن دَآبَّةٍ...",
  "التخصص":  ["عالم الحيوان"],
  "الغرض":   "كل الكائنات «أمم أمثالكم»..."
}

التثبيت:
    pip install playwright
    playwright install chromium

التشغيل:
    python quran_kawniyyat_scraper.py
"""

import sys
import json
import re
from playwright.sync_api import sync_playwright

# Fix Windows console encoding issues
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

URL         = "https://i-quran.com/kawniyyat"
OUTPUT_JSON = "الكونيات.json"
OUTPUT_TEXT = "الكونيات.txt"


# ─────────────────────────────────────────────────────────────
# إيجاد كروت الآيات
# ─────────────────────────────────────────────────────────────
def find_cards(page):
    titles = page.query_selector_all("div.da-title[data-l='ar']")
    print(f"  🔎 div.da-title: {len(titles)}")

    cards = []
    seen  = set()
    for title in titles:
        card = page.evaluate_handle('''
            el => {
                let p = el.parentElement;
                while (p && p !== document.body) {
                    if (p.querySelector('div.da-ref') &&
                        p.querySelector('div.da-text'))
                        return p;
                    p = p.parentElement;
                }
                return el.parentElement;
            }
        ''', title)

        uid = page.evaluate("el => el.outerHTML.substring(0, 100)", card)
        if uid not in seen:
            seen.add(uid)
            cards.append(card)

    return cards


# ─────────────────────────────────────────────────────────────
# استخراج آية كونية واحدة
# ─────────────────────────────────────────────────────────────
def scrape_kawniyya(card, page):
    item = {}

    # ══ السورة والآية ════════════════════════════════════════
    surah_name = ""
    ayah_num   = ""

    da_ref = card.query_selector("div.da-ref")
    if da_ref:
        surah_span = da_ref.query_selector("span[data-l='ar']")
        surah_name = surah_span.inner_text().strip() if surah_span else ""

        # رقم الآية من text node: " 38"
        ayah_num = page.evaluate('''
            el => {
                let text = '';
                for (const node of el.childNodes) {
                    if (node.nodeType === 3) {
                        const t = node.textContent.trim().replace(/["'“”]/g, '');
                        if (/\\d/.test(t)) text += t;
                    }
                }
                return text.trim();
            }
        ''', da_ref)

    item["السورة"] = f"{surah_name} {ayah_num}".strip()

    # ══ العنوان ══════════════════════════════════════════════
    title_el = card.query_selector("div.da-title[data-l='ar']")
    item["الآية"] = title_el.inner_text().strip() if title_el else ""

    # ══ النص القرآني ═════════════════════════════════════════
    text_el = card.query_selector("div.da-text")
    if text_el:
        raw = text_el.inner_text().strip()
        raw = re.sub(r'^[ "“]+|[ "”]+$', '', raw).strip()
        item["النص"] = raw
    else:
        item["النص"] = ""

    # ══ التخصص ═══════════════════════════════════════════════
    cats = []
    for cat in card.query_selector_all("span.da-cat"):
        sp = cat.query_selector("span[data-l='ar']")
        if sp:
            t = sp.inner_text().strip()
            if t:
                cats.append(t)
    item["التخصص"] = cats

    # ══ الغرض ════════════════════════════════════════════════
    note_el = card.query_selector("div.da-note[data-l='ar']")
    if not note_el:
        note_el = card.query_selector("div.da-note")
    item["الغرض"] = note_el.inner_text().strip() if note_el else ""

    return item


# ─────────────────────────────────────────────────────────────
def scrape_all(page):
    results = []

    debug = page.evaluate('''() => ({
        da_ref:   document.querySelectorAll('div.da-ref').length,
        da_title: document.querySelectorAll('div.da-title[data-l="ar"]').length,
        da_text:  document.querySelectorAll('div.da-text').length,
        da_cats:  document.querySelectorAll('div.da-cats').length,
        da_note:  document.querySelectorAll('div.da-note[data-l="ar"]').length,
        da_cat:   document.querySelectorAll('span.da-cat').length,
    })''')
    print(f"  🔬 {debug}")

    cards = find_cards(page)
    print(f"  📋 {len(cards)} آية كونية\n")

    for i, card in enumerate(cards, 1):
        try:
            data  = scrape_kawniyya(card, page)
            title = data.get("الآية", "")[:55]
            surah = data.get("السورة", "")
            print(f"  [{i:>3}] {title}")
            print(f"         📖 {surah} | 🏷️ {', '.join(data.get('التخصص',[]))}")
            results.append(data)
        except Exception as e:
            print(f"  [{i:>3}] ❌ {e}")

    return results


# ─────────────────────────────────────────────────────────────
def format_text(results):
    lines = ["🌍 الآيات الكونية", "=" * 70, ""]
    for item in results:
        lines.append(f"الآية   : {item.get('الآية','')}")
        lines.append(f"السورة  : {item.get('السورة','')}")
        lines.append(f"التخصص  : {'، '.join(item.get('التخصص',[]))}")
        lines.append(f"الغرض   : {item.get('الغرض','')}")
        if item.get("النص"):
            lines.append("النص    :")
            lines.append(f"  {item['النص']}")
        lines += ["", "=" * 70, ""]
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("[Kawniyyat] Cosmic Verses — i-quran.com/kawniyyat")
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

        print(f"\n🌐 {URL}")
        page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_selector("div.da-title", timeout=30000)
        page.wait_for_timeout(2000)
        print(f"📄 {page.title()}\n")

        results = scrape_all(page)
        browser.close()

    print(f"\n{'='*60}")
    print(f"✅ تم جمع {len(results)} آية كونية")

    if not results:
        print("⚠️  لا توجد بيانات.")
        return

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON ← {OUTPUT_JSON}")

    with open(OUTPUT_TEXT, "w", encoding="utf-8") as f:
        f.write(format_text(results))
    print(f"📄 نص  ← {OUTPUT_TEXT}")

    s = results[0]
    print(f"\n📋 عينة:")
    print(f"  الآية   : {s.get('الآية','')}")
    print(f"  السورة  : {s.get('السورة','')}")
    print(f"  التخصص  : {'، '.join(s.get('التخصص',[]))}")
    print(f"  الغرض   : {s.get('الغرض','')[:80]}...")
    print(f"  النص    : {s.get('النص','')[:60]}...")


if __name__ == "__main__":
    main()