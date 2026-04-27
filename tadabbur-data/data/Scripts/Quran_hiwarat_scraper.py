"""
سكريبت جمع بيانات الحوارات القرآنية من موقع i-quran.com/hiwarat

الهيكل الدقيق (من تحليل الصور):
══════════════════════════════════════════════════════════════

[كارت الحوار]
  div.da-ref
    span[data-l='ar']        → اسم السورة  "البقرة"
    " 30-34"                 → نطاق الآيات (text node)

  div.da-title[data-l='ar'] → عنوان الحوار بالعربي
  div.da-title-en[data-l='en'] → عنوان الحوار بالإنجليزي

  div.da-text               → النص القرآني كاملاً (مباشرة بدون نقر)

  div.da-cats
    span.da-cat
      span[data-l='ar']     → التخصص (الله والملائكة، بدء الخلق...)

  div.da-note[data-l='ar'] → الغرض / الملاحظة

══════════════════════════════════════════════════════════════

الناتج:
{
  "الحوار":  "حوار الله مع الملائكة حول خلق آدم — إني جاعل في الأرض خليفة",
  "السورة":  "البقرة 30-34",
  "النص":    "وَإِذۡ قَالَ رَبُّكَ...",
  "التخصص": ["الله والملائكة", "بدء الخلق"],
  "الغرض":  "أول حوار في القرآن..."
}

التثبيت:
    pip install playwright
    playwright install chromium

التشغيل:
    python quran_hiwarat_scraper.py
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

URL         = "https://i-quran.com/hiwarat"
OUTPUT_JSON = "الحوارات.json"
OUTPUT_TEXT = "الحوارات.txt"


# ─────────────────────────────────────────────────────────────
# إيجاد الـ parent card لكل حوار
# ─────────────────────────────────────────────────────────────
def find_cards(page):
    """
    كل حوار = div.da-card.hwr-card
    """
    cards = page.query_selector_all("div.da-card.hwr-card")
    return cards


# ─────────────────────────────────────────────────────────────
# استخراج حوار واحد
# ─────────────────────────────────────────────────────────────
def scrape_hiwar(card, page):
    hiwar = {}

    # ══ السورة والآية ════════════════════════════════════════
    # div.da-ref: span[data-l='ar'] = "البقرة" + text node = " 30-34"
    surah_name = ""
    ayah_range = ""

    da_ref = card.query_selector("div.da-ref")
    if da_ref:
        # اسم السورة
        surah_span = da_ref.query_selector("span[data-l='ar']")
        surah_name = surah_span.inner_text().strip() if surah_span else ""

        # نطاق الآيات من الـ text nodes
        ayah_range = page.evaluate('''
            el => {
                let text = '';
                for (const node of el.childNodes) {
                    if (node.nodeType === 3) {  // TEXT_NODE
                        const t = node.textContent.trim().replace(/["'“”]/g, '');
                        if (/\\d/.test(t)) text += t;
                    }
                }
                return text.trim();
            }
        ''', da_ref)

    hiwar["السورة"] = f"{surah_name} {ayah_range}".strip()

    # ══ عنوان الحوار ═════════════════════════════════════════
    title_el = card.query_selector("div.da-title[data-l='ar']")
    hiwar["الحوار"] = title_el.inner_text().strip() if title_el else ""

    # ══ النص القرآني ═════════════════════════════════════════
    text_el = card.query_selector("div.da-text")
    if text_el:
        # نظّف النص من الـ quotes الزائدة
        raw = text_el.inner_text().strip()
        raw = re.sub(r'^[ "“]+|[ "”]+$', '', raw).strip()
        hiwar["النص"] = raw
    else:
        hiwar["النص"] = ""

    # ══ التخصص ═══════════════════════════════════════════════
    cats = []
    for cat in card.query_selector_all("span.da-cat"):
        sp = cat.query_selector("span[data-l='ar']")
        if sp:
            t = sp.inner_text().strip()
            if t:
                cats.append(t)
    hiwar["التخصص"] = cats

    # ══ الغرض ════════════════════════════════════════════════
    note_el = card.query_selector("div.da-note[data-l='ar']")
    if not note_el:
        note_el = card.query_selector("div.da-note")
    hiwar["الغرض"] = note_el.inner_text().strip() if note_el else ""

    return hiwar


# ─────────────────────────────────────────────────────────────
# جمع جميع الحوارات
# ─────────────────────────────────────────────────────────────
def scrape_all(page):
    results = []

    # تشخيص سريع
    debug = page.evaluate('''() => ({
        da_ref:   document.querySelectorAll('div.da-ref').length,
        da_title: document.querySelectorAll('div.da-title').length,
        da_text:  document.querySelectorAll('div.da-text').length,
        da_cats:  document.querySelectorAll('div.da-cats').length,
        da_note:  document.querySelectorAll('div.da-note').length,
        da_cat:   document.querySelectorAll('span.da-cat').length,
    })''')
    print(f"  🔬 {debug}")

    cards = find_cards(page)
    print(f"  📋 {len(cards)} حوار\n")

    for i, card in enumerate(cards, 1):
        try:
            data   = scrape_hiwar(card, page)
            title  = data.get("الحوار", "")[:55]
            surah  = data.get("السورة", "")
            cats_n = len(data.get("التخصص", []))
            print(f"  [{i:>3}] {title}")
            print(f"         📖 {surah} | 🏷️ {cats_n} تخصص")
            results.append(data)
        except Exception as e:
            print(f"  [{i:>3}] ❌ {e}")

    return results


# ─────────────────────────────────────────────────────────────
def format_text(results):
    lines = ["💬 الحوارات القرآنية", "=" * 70, ""]
    for h in results:
        lines.append(f"الحوار  : {h.get('الحوار','')}")
        lines.append(f"السورة  : {h.get('السورة','')}")
        lines.append(f"التخصص  : {'، '.join(h.get('التخصص',[]))}")
        lines.append(f"الغرض   : {h.get('الغرض','')}")
        if h.get("النص"):
            lines.append("النص    :")
            lines.append(f"  {h['النص']}")
        lines += ["", "=" * 70, ""]
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("[Hiwarat] Quranic Dialogues — i-quran.com/hiwarat")
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
    print(f"✅ تم جمع {len(results)} حوار")

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
    print(f"  الحوار  : {s.get('الحوار','')}")
    print(f"  السورة  : {s.get('السورة','')}")
    print(f"  التخصص  : {'، '.join(s.get('التخصص',[]))}")
    print(f"  الغرض   : {s.get('الغرض','')[:80]}...")
    print(f"  النص    : {s.get('النص','')[:60]}...")


if __name__ == "__main__":
    main()