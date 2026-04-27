"""
سكريبت جمع بيانات أسماء الله الحسنى من موقع i-quran.com/asma

الهيكل الدقيق (من تحليل الصور):
══════════════════════════════════════════════════════════════

[قائمة الأسماء - الكروت]
  div.name-card  onclick="openModal(N)"
    span.name-num         → رقم الاسم (1, 2, ...)
    div.name-ar           → الاسم بالعربي (الله)
    div.name-en           → الاسم بالإنجليزي (Allah)
    div.name-meaning
      span[data-l='ar']   → المعنى بالعربي
    div.name-card-stats
      span.ncs (×3)
        span.ncsv         → القيمة (2716 / 1830 / 87)
        span[data-l='ar'] → الوحدة (مرة / آية / سورة)

[المودال - يفتح بالنقر]
  div.asma-modal#asmaModal
    div.modal-num         → "#1"
    div.modal-name-ar     → الاسم بالعربي
    div.modal-name-en     → الاسم بالإنجليزي
    div.modal-meaning     → المعنى
    div.modal-stats       → الإحصائيات
    div.modal-section-title span[data-l='ar'] → "نماذج من الآيات (10 من 1830)"
    div.verse-ref-card    (لكل آية نموذجية)
      div.verse-ref-header onclick="toggleVerse(this)"
        span.ref-label span[data-l='ar'] → "الفاتحة — آية 1"
      div.verse-ref-body.open
        div.verse-text    → نص الآية

══════════════════════════════════════════════════════════════

الناتج:
{
  "الرقم":         "1",
  "الاسم_عربي":   "الله",
  "الاسم_انجليزي":"Allah",
  "المعنى":        "المعبود بحق الجامع لكل صفات الكمال",
  "عدد_الذكر":    "2716",
  "عدد_الآيات":   "1830",
  "عدد_السور":    "87",
  "نماذج_الآيات": [
    { "المرجع": "الفاتحة — آية 1", "النص": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" },
    ...
  ]
}

التثبيت:
    pip install playwright
    playwright install chromium

التشغيل:
    python quran_asma_scraper.py
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

URL         = "https://i-quran.com/asma"
OUTPUT_JSON = "أسماء_الله.json"
OUTPUT_TEXT = "أسماء_الله.txt"


# ─────────────────────────────────────────────────────────────
# استخراج بيانات الكارت (بدون مودال)
# ─────────────────────────────────────────────────────────────
def scrape_card_basic(card, page):
    item = {}

    # الرقم
    num_el = card.query_selector("span.name-num")
    item["الرقم"] = num_el.inner_text().strip() if num_el else ""

    # الاسم عربي / إنجليزي
    ar_el = card.query_selector("div.name-ar")
    en_el = card.query_selector("div.name-en")
    item["الاسم_عربي"]    = ar_el.inner_text().strip() if ar_el else ""
    item["الاسم_انجليزي"] = en_el.inner_text().strip() if en_el else ""

    # المعنى
    meaning_el = card.query_selector("div.name-meaning span[data-l='ar']")
    item["المعنى"] = meaning_el.inner_text().strip() if meaning_el else ""

    # الإحصائيات: مرة / آية / سورة
    item["عدد_الذكر"]  = ""
    item["عدد_الآيات"] = ""
    item["عدد_السور"]  = ""

    for ncs in card.query_selector_all("span.ncs"):
        val_el   = ncs.query_selector("span.ncsv")
        label_el = ncs.query_selector("span[data-l='ar']")
        val   = val_el.inner_text().strip()   if val_el   else ""
        label = label_el.inner_text().strip() if label_el else ""
        if "مرة" in label:
            item["عدد_الذكر"] = val
        elif "آية" in label:
            item["عدد_الآيات"] = val
        elif "سورة" in label:
            item["عدد_السور"] = val

    item["نماذج_الآيات"] = []
    return item


# ─────────────────────────────────────────────────────────────
# استخراج نماذج الآيات من المودال
# ─────────────────────────────────────────────────────────────
def scrape_modal_verses(page):
    verses = []

    modal = page.query_selector("div.asma-modal#asmaModal")
    if not modal:
        return verses

    for verse_card in modal.query_selector_all("div.verse-ref-card"):
        # المرجع: "الفاتحة — آية 1"
        ref_el = verse_card.query_selector("span.ref-label span[data-l='ar']")
        ref    = ref_el.inner_text().strip() if ref_el else ""

        # النص: قد يكون مخفياً — افتحه أولاً
        body = verse_card.query_selector("div.verse-ref-body")
        text = ""

        if body:
            # تأكد أنه مفتوح
            is_open = "open" in (body.get_attribute("class") or "")
            if not is_open:
                header = verse_card.query_selector("div.verse-ref-header")
                if header:
                    try:
                        header.click()
                        page.wait_for_timeout(300)
                    except Exception:
                        pass

            text_el = body.query_selector("div.verse-text")
            text    = text_el.inner_text().strip() if text_el else ""

        if ref or text:
            verses.append({"المرجع": ref, "النص": text})

    return verses


# ─────────────────────────────────────────────────────────────
# الدالة الرئيسية
# ─────────────────────────────────────────────────────────────
def scrape_all(page):
    results = []

    # تشخيص
    debug = page.evaluate('''() => ({
        name_card:  document.querySelectorAll('div.name-card').length,
        name_ar:    document.querySelectorAll('div.name-ar').length,
        ncs:        document.querySelectorAll('span.ncs').length,
    })''')
    print(f"  🔬 {debug}")

    cards = page.query_selector_all("div.name-card")
    print(f"  📋 {len(cards)} اسم\n")

    for i, card in enumerate(cards, 1):
        try:
            # ── البيانات الأساسية من الكارت ──────────────────
            item = scrape_card_basic(card, page)
            name = item.get("الاسم_عربي", "")
            num  = item.get("الرقم", str(i))
            print(f"  [{num:>3}] {name}", end=" ")

            # ── النقر لفتح المودال ────────────────────────────
            try:
                card.scroll_into_view_if_needed()
                card.click()
                page.wait_for_timeout(800)

                # انتظر ظهور المودال
                page.wait_for_selector(
                    "div.asma-overlay.open, div.asma-modal",
                    timeout=3000
                )

                # استخراج نماذج الآيات
                item["نماذج_الآيات"] = scrape_modal_verses(page)

                # إغلاق المودال
                close_btn = page.query_selector("button.asma-modal-close")
                if close_btn:
                    close_btn.click()
                else:
                    page.keyboard.press("Escape")
                page.wait_for_timeout(400)

            except Exception as e:
                print(f"(modal: {e})", end=" ")

            print(f"→ {len(item['نماذج_الآيات'])} آية")
            results.append(item)

        except Exception as e:
            print(f"\n  [{i}] ❌ {e}")

    return results


# ─────────────────────────────────────────────────────────────
def format_text(results):
    lines = ["✨ أسماء الله الحسنى", "=" * 70, ""]
    for item in results:
        lines.append(f"#{item.get('الرقم','')}  {item.get('الاسم_عربي','')}  ({item.get('الاسم_انجليزي','')})")
        lines.append(f"المعنى     : {item.get('المعنى','')}")
        lines.append(f"عدد الذكر  : {item.get('عدد_الذكر','')} مرة")
        lines.append(f"عدد الآيات : {item.get('عدد_الآيات','')} آية")
        lines.append(f"عدد السور  : {item.get('عدد_السور','')} سورة")
        verses = item.get("نماذج_الآيات", [])
        if verses:
            lines.append(f"نماذج الآيات ({len(verses)}):")
            for v in verses:
                lines.append(f"  📖 {v.get('المرجع','')}")
                lines.append(f"     {v.get('النص','')}")
        lines += ["", "=" * 70, ""]
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("✨ أسماء الله الحسنى — i-quran.com/asma")
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
        page.wait_for_selector("div.name-card", timeout=30000)
        page.wait_for_timeout(2000)
        print(f"📄 {page.title()}\n")

        results = scrape_all(page)
        browser.close()

    print(f"\n{'='*60}")
    print(f"✅ تم جمع {len(results)} اسم")

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
    print(f"\n📋 عينة: {s.get('الاسم_عربي','')}")
    print(f"  المعنى    : {s.get('المعنى','')}")
    print(f"  الذكر     : {s.get('عدد_الذكر','')} مرة | {s.get('عدد_الآيات','')} آية | {s.get('عدد_السور','')} سورة")
    print(f"  الآيات    : {len(s.get('نماذج_الآيات',[]))} نموذج")


if __name__ == "__main__":
    main()