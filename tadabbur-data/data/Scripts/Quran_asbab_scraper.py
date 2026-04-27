"""
سكريبت جمع بيانات أسباب النزول من موقع i-quran.com/asbab

الهيكل الدقيق (من تحليل الصور):
══════════════════════════════════════════════════════════════

[كارت سبب النزول]
  div.ab-ref              → "البقرة 142-144" (نص مباشر)

  div.ab-info
    div.ab-title          → عنوان الحدث
    div.ab-tags
      span.ab-tag.md      → مدني / مكي
      span.ab-tag.cat     → التصنيف (عقيدة، تشريع...)
                            + آخر cat فيه اسم السورة (opacity:0.6)
    div.ab-aw             → زر التوسيع ▼

  div.ab-body  (يفتح بالنقر)
    div.ab-sabab
      div.ab-sabab-h
        span[data-l='ar'] → "📋 سبب النزول" (العنوان)
      div.ab-sabab-t
        span[data-l='ar'] → نص سبب النزول

    div.ab-maqsad
      div.ab-maqsad-h
        span[data-l='ar'] → "🎯 المقصد الأعمق"
      div.ab-maqsad-t
        span[data-l='ar'] → نص المقصد

  button.fb onclick="loadAbAyah(surahNum,'ayahRange','abay_ab_N_range')"
    span[data-l='ar']     → "📖 عرض الآيات"

  div.ayb#abay_ab_2_142_144
    div.ays → div.ayi
      span.ayt            → نص الآية
      span.ayn            → رقم الآية

══════════════════════════════════════════════════════════════

الناتج:
{
  "العنوان":      "تحويل القبلة من بيت المقدس إلى الكعبة",
  "السورة":       "البقرة 142-144",
  "النوع":        "مدني",
  "التصنيفات":   ["عقيدة", "تشريع"],
  "سبب_النزول":  "كان النبي ﷺ يصلي نحو بيت المقدس...",
  "المقصد":      "تأسيس الاستقلالية الكاملة للأمة الإسلامية...",
  "الآيات": [
    { "رقم": "142", "نص": "سَيَقُولُ ٱلسُّفَهَآءُ..." },
    ...
  ]
}

التثبيت:
    pip install playwright
    playwright install chromium

التشغيل:
    python quran_asbab_scraper.py
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

URL         = "https://i-quran.com/asbab"
OUTPUT_JSON = "أسباب_النزول.json"
OUTPUT_TEXT = "أسباب_النزول.txt"


# ─────────────────────────────────────────────────────────────
# فتح ab-body
# ─────────────────────────────────────────────────────────────
def open_body(card, page):
    body = card.query_selector("div.ab-body")
    if not body:
        return None

    def is_open():
        return page.evaluate(
            "el => getComputedStyle(el).display !== 'none' && el.offsetHeight > 0",
            body
        )

    if is_open():
        return body

    for sel in ["div.ab-aw", "div.ab-info"]:
        btn = card.query_selector(sel)
        if btn:
            try:
                btn.scroll_into_view_if_needed()
                btn.click()
                page.wait_for_timeout(700)
                if is_open():
                    return body
            except Exception:
                pass

    # JavaScript force
    try:
        page.evaluate("el => { el.style.display = 'block'; el.style.maxHeight = 'none'; }", body)
        page.wait_for_timeout(300)
    except Exception:
        pass

    return body


# ─────────────────────────────────────────────────────────────
# جلب الآيات بالنقر على زر loadAbAyah
# ─────────────────────────────────────────────────────────────
def get_verses(card, page):
    verses = []

    btn = card.query_selector("button.fb[onclick*='loadAbAyah']")
    if not btn:
        btn = card.query_selector("button.fb")
    if not btn:
        return verses

    # استخراج box_id من onclick="loadAbAyah(2,'142-144','abay_ab_2_142_144')"
    onclick   = btn.get_attribute("onclick") or ""
    box_match = re.search(r"loadAbAyah\([^,]+,[^,]+,\s*['\"]([^'\"]+)['\"]", onclick)
    box_id    = box_match.group(1).strip() if box_match else None

    try:
        btn.scroll_into_view_if_needed()
        btn.click()
        page.wait_for_timeout(900)

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
                    verses.append({
                        "رقم": ayn.inner_text().strip() if ayn else "",
                        "نص":  ayt.inner_text().strip(),
                    })
    except Exception as e:
        print(f"      ⚠️ get_verses: {e}")

    return verses


# ─────────────────────────────────────────────────────────────
# استخراج كارت واحد
# ─────────────────────────────────────────────────────────────
def scrape_card(card, page):
    item = {}

    # ══ السورة والآية (نص مباشر في ab-ref) ══════════════════
    ref_el = card.query_selector("div.ab-ref")
    item["السورة"] = ref_el.inner_text().strip() if ref_el else ""

    # ══ العنوان ══════════════════════════════════════════════
    title_el = card.query_selector("div.ab-title")
    item["العنوان"] = title_el.inner_text().strip() if title_el else ""

    # ══ التصنيفات من ab-tags ═════════════════════════════════
    naw3    = ""   # مدني / مكي
    cats    = []   # عقيدة، تشريع...

    for tag in card.query_selector_all("span.ab-tag"):
        classes = tag.get_attribute("class") or ""
        text    = tag.inner_text().strip()
        if not text:
            continue
        if "md" in classes or "mk" in classes:
            naw3 = text
        elif "cat" in classes:
            # آخر cat فيه opacity:0.6 = اسم السورة (نتجاهله)
            style = tag.get_attribute("style") or ""
            if "opacity" not in style:
                cats.append(text)

    item["النوع"]       = naw3
    item["التصنيفات"]  = cats

    # ══ فتح ab-body ══════════════════════════════════════════
    body = open_body(card, page)

    # ══ سبب النزول ═══════════════════════════════════════════
    sabab = ""
    if body:
        sabab_el = body.query_selector("div.ab-sabab-t span[data-l='ar']")
        if sabab_el:
            sabab = sabab_el.inner_text().strip()
    item["سبب_النزول"] = sabab

    # ══ المقصد الأعمق ════════════════════════════════════════
    maqsad = ""
    if body:
        maqsad_el = body.query_selector("div.ab-maqsad-t span[data-l='ar']")
        if maqsad_el:
            maqsad = maqsad_el.inner_text().strip()
    item["المقصد"] = maqsad

    # ══ الآيات ═══════════════════════════════════════════════
    item["الآيات"] = get_verses(card, page)

    return item


# ─────────────────────────────────────────────────────────────
# إيجاد كل الكروت
# ─────────────────────────────────────────────────────────────
def find_cards(page):
    # كل كارت = عنصر يحتوي ab-ref + ab-info + ab-body
    refs = page.query_selector_all("div.ab-ref")
    print(f"  🔎 div.ab-ref: {len(refs)}")

    cards, seen = [], set()
    for ref in refs:
        card = page.evaluate_handle('''
            el => {
                let p = el.parentElement;
                while (p && p !== document.body) {
                    if (p.querySelector('div.ab-ref') &&
                        p.querySelector('div.ab-info') &&
                        p.querySelector('div.ab-body'))
                        return p;
                    p = p.parentElement;
                }
                return el.parentElement;
            }
        ''', ref)
        uid = page.evaluate("el => el.outerHTML.substring(0,100)", card)
        if uid not in seen:
            seen.add(uid)
            cards.append(card)

    return cards


# ─────────────────────────────────────────────────────────────
def scrape_all(page):
    results = []

    debug = page.evaluate('''() => ({
        ab_ref:      document.querySelectorAll('div.ab-ref').length,
        ab_title:    document.querySelectorAll('div.ab-title').length,
        ab_body:     document.querySelectorAll('div.ab-body').length,
        ab_sabab_t:  document.querySelectorAll('div.ab-sabab-t').length,
        ab_maqsad_t: document.querySelectorAll('div.ab-maqsad-t').length,
        btn_fb:      document.querySelectorAll('button.fb').length,
    })''')
    print(f"  🔬 {debug}")

    cards = find_cards(page)
    print(f"  📋 {len(cards)} سبب نزول\n")

    for i, card in enumerate(cards, 1):
        try:
            data   = scrape_card(card, page)
            title  = data.get("العنوان", "")[:50]
            surah  = data.get("السورة", "")
            ayat_n = len(data.get("الآيات", []))
            print(f"  [{i:>3}] {title}")
            print(f"         📖 {surah} | ✅ {ayat_n} آية")
            results.append(data)
        except Exception as e:
            print(f"  [{i:>3}] ❌ {e}")

    return results


# ─────────────────────────────────────────────────────────────
def format_text(results):
    lines = ["📋 أسباب النزول", "=" * 70, ""]
    for item in results:
        lines.append(f"العنوان      : {item.get('العنوان','')}")
        lines.append(f"السورة       : {item.get('السورة','')}")
        lines.append(f"النوع        : {item.get('النوع','')}")
        lines.append(f"التصنيفات    : {'، '.join(item.get('التصنيفات',[]))}")
        lines.append(f"سبب النزول   : {item.get('سبب_النزول','')}")
        lines.append(f"المقصد       : {item.get('المقصد','')}")
        ayat = item.get("الآيات", [])
        if ayat:
            lines.append("الآيات       :")
            for v in ayat:
                lines.append(f"  ({v['رقم']}) {v['نص']}")
        lines += ["", "=" * 70, ""]
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("[Asbab] Causes of Revelation — i-quran.com/asbab")
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
        page.wait_for_selector("div.ab-ref", timeout=30000)
        page.wait_for_timeout(2000)
        print(f"📄 {page.title()}\n")

        results = scrape_all(page)
        browser.close()

    print(f"\n{'='*60}")
    print(f"✅ تم جمع {len(results)} سبب نزول")

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
    print(f"  العنوان    : {s.get('العنوان','')}")
    print(f"  السورة     : {s.get('السورة','')}")
    print(f"  النوع      : {s.get('النوع','')}")
    print(f"  التصنيفات  : {'، '.join(s.get('التصنيفات',[]))}")
    print(f"  سبب النزول : {s.get('سبب_النزول','')[:80]}...")
    print(f"  المقصد     : {s.get('المقصد','')[:80]}...")
    print(f"  الآيات     : {len(s.get('الآيات',[]))} آية")


if __name__ == "__main__":
    main()