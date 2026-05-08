"""
سكريبت جمع بيانات الفواصل القرآنية من موقع i-quran.com/endings
مبني على الهيكل الحقيقي للـ HTML

CSS Classes المستخدمة في الموقع:
  .pc-ar        → اسم الزوج بالعربي
  .pc-m         → المعنى  (span[data-l="ar"])
  .pc-ctx       → السياقات (span[data-l="ar"])
  .pc-r         → الموضعات (span[data-l="ar"])
  .pc-refs      → قسم المراجع
  .end-ref-btn  → زر كل آية  onclick="loadEndAyah(surahId, ayahNum, 'boxId')"
  #eayBox_N     → صندوق الآية بعد النقر  data-active="surah:ayah"
  .ayt          → نص الآية
  .ayn          → رقم الآية

التثبيت:
    pip install playwright
    playwright install chromium

التشغيل:
    python quran_endings_scraper.py
"""

import json
import re
import sys
import io
import time
from playwright.sync_api import sync_playwright

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

URL = "https://i-quran.com/endings"
OUTPUT_JSON = "quran_endings.json"
OUTPUT_TEXT = "quran_endings.txt"

SURAH_NAMES = {
    "1": "الفاتحة", "2": "البقرة", "3": "آل عمران", "4": "النساء",
    "5": "المائدة", "6": "الأنعام", "7": "الأعراف", "8": "الأنفال",
    "9": "التوبة", "10": "يونس", "11": "هود", "12": "يوسف",
    "13": "الرعد", "14": "إبراهيم", "15": "الحجر", "16": "النحل",
    "17": "الإسراء", "18": "الكهف", "19": "مريم", "20": "طه",
    "21": "الأنبياء", "22": "الحج", "23": "المؤمنون", "24": "النور",
    "25": "الفرقان", "26": "الشعراء", "27": "النمل", "28": "القصص",
    "29": "العنكبوت", "30": "الروم", "31": "لقمان", "32": "السجدة",
    "33": "الأحزاب", "34": "سبأ", "35": "فاطر", "36": "يس",
    "37": "الصافات", "38": "ص", "39": "الزمر", "40": "غافر",
    "41": "فصلت", "42": "الشورى", "43": "الزخرف", "44": "الدخان",
    "45": "الجاثية", "46": "الأحقاف", "47": "محمد", "48": "الفتح",
    "49": "الحجرات", "50": "ق", "51": "الذاريات", "52": "الطور",
    "53": "النجم", "54": "القمر", "55": "الرحمن", "56": "الواقعة",
    "57": "الحديد", "58": "المجادلة", "59": "الحشر", "60": "الممتحنة",
    "61": "الصف", "62": "الجمعة", "63": "المنافقون", "64": "التغابن",
    "65": "الطلاق", "66": "التحريم", "67": "الملك", "68": "القلم",
    "69": "الحاقة", "70": "المعارج", "71": "نوح", "72": "الجن",
    "73": "المزمل", "74": "المدثر", "75": "القيامة", "76": "الإنسان",
    "77": "المرسلات", "78": "النبأ", "79": "النازعات", "80": "عبس",
    "81": "التكوير", "82": "الانفطار", "83": "المطففين", "84": "الانشقاق",
    "85": "البروج", "86": "الطارق", "87": "الأعلى", "88": "الغاشية",
    "89": "الفجر", "90": "البلد", "91": "الشمس", "92": "الليل",
    "93": "الضحى", "94": "الشرح", "95": "التين", "96": "العلق",
    "97": "القدر", "98": "البينة", "99": "الزلزلة", "100": "العاديات",
    "101": "القارعة", "102": "التكاثر", "103": "العصر", "104": "الهمزة",
    "105": "الفيل", "106": "قريش", "107": "الماعون", "108": "الكوثر",
    "109": "الكافرون", "110": "النصر", "111": "المسد", "112": "الإخلاص",
    "113": "الفلق", "114": "الناس",
}


# ─────────────────────────────────────────────────────────────
# استخراج بيانات زوج واحد
# ─────────────────────────────────────────────────────────────
def scrape_pair_card(card, page):
    data = {}

    # الزوج
    el = card.query_selector("span.pc-ar")
    data["pair"] = el.inner_text().strip() if el else ""

    # المعنى
    el = card.query_selector("div.pc-m span[data-l='ar']")
    data["meaning"] = el.inner_text().strip() if el else ""

    # السياقات  (مفصولة بـ · أو •)
    el = card.query_selector("div.pc-ctx span[data-l='ar']")
    if el:
        raw = el.inner_text().strip()
        data["contexts"] = [c.strip() for c in re.split(r"[·•]", raw) if c.strip()]
    else:
        data["contexts"] = []

    # الموضعات
    el = card.query_selector("div.pc-r span[data-l='ar']")
    data["placements"] = el.inner_text().strip() if el else ""

    # ── الآيات ──────────────────────────────────────────────
    references = []
    buttons = card.query_selector_all("button.end-ref-btn")
    print(f"    📖 {len(buttons)} آية")

    for btn in buttons:
        onclick = btn.get_attribute("onclick") or ""
        btn_label = btn.inner_text().strip()  # "البقرة 173"

        # loadEndAyah(2,'173','eayBox 0')
        m = re.search(
            r"loadEndAyah\(\s*(\d+)\s*,\s*['\"]?(\d+)['\"]?\s*,\s*['\"]([^'\"]+)['\"]",
            onclick,
        )
        surah_num = m.group(1) if m else None
        ayah_num  = m.group(2) if m else None
        box_id    = m.group(3).replace(" ", "_") if m else None  # "eayBox 0" → "eayBox_0"

        ayah_text = ""
        surah_name = SURAH_NAMES.get(surah_num, "") if surah_num else ""
        actual_ayah = ayah_num

        try:
            btn.scroll_into_view_if_needed()
            btn.click()
            page.wait_for_timeout(700)

            # البحث عن صندوق الآية
            box = None
            if box_id:
                box = page.query_selector(f"#{box_id}")
            if not box:
                # fallback: أي صندوق ظاهر
                visible = page.query_selector_all(
                    "div.end-ayah-box[style*='display: block']"
                )
                if visible:
                    box = visible[-1]

            if box:
                # data-active="2:173"
                da = box.get_attribute("data-active") or ""
                if ":" in da:
                    sn, an = da.split(":", 1)
                    surah_name = SURAH_NAMES.get(sn, surah_name)
                    actual_ayah = an

                ayt = box.query_selector("span.ayt")
                if ayt:
                    ayah_text = ayt.inner_text().strip()

                ayn = box.query_selector("span.ayn")
                if ayn:
                    actual_ayah = ayn.inner_text().strip()

        except Exception as e:
            print(f"      ⚠️  {btn_label}: {e}")

        # fallback: استخرج اسم السورة من نص الزر
        if not surah_name:
            parts = btn_label.rsplit(maxsplit=1)
            if len(parts) == 2:
                surah_name = parts[0]
                actual_ayah = actual_ayah or parts[1]

        references.append({
            "surah": surah_name,
            "ayah": actual_ayah or "",
            "text": ayah_text,
        })

    data["references"] = references
    return data


# ─────────────────────────────────────────────────────────────
# الدالة الرئيسية للاستخراج
# ─────────────────────────────────────────────────────────────
def scrape_all(page):
    results = []

    # كل قسم مراجع = زوج واحد
    # نصل للـ parent card عبر JavaScript
    refs_divs = page.query_selector_all("div.pc-refs")
    print(f"\n  🔎 {len(refs_divs)} زوج فاصلة")

    for i, refs_div in enumerate(refs_divs, 1):
        # الـ parent الذي يحتوي span.pc-ar
        card = page.evaluate_handle("""
            el => {
                let p = el.parentElement;
                while (p) {
                    if (p.querySelector('span.pc-ar') && p.querySelector('div.pc-m'))
                        return p;
                    p = p.parentElement;
                }
                return el.parentElement;
            }
        """, refs_div)

        name_el = card.query_selector("span.pc-ar")
        name = name_el.inner_text().strip() if name_el else f"زوج {i}"
        print(f"\n  [{i}/{len(refs_divs)}] {name}")

        try:
            data = scrape_pair_card(card, page)
            if data.get("pair"):
                results.append(data)
        except Exception as e:
            print(f"    ❌ {e}")

    return results


# ─────────────────────────────────────────────────────────────
# التنسيق النصي المطلوب
# ─────────────────────────────────────────────────────────────
def format_text(results):
    out = []
    for item in results:
        out.append(f"الزوج:  {item['pair']}")
        out.append(f"معناه: {item['meaning']}")
        out.append(f"السياقات: {' · '.join(item['contexts'])}")
        out.append(f"موضعاته: {item['placements']}")
        refs = item.get("references", [])
        if refs:
            out.append("المراجع:")
            out.append("{")
            for ref in refs:
                out.append("  {")
                out.append(f"  السورة : {ref['surah']}")
                out.append(f"  الاية: {ref['ayah']}")
                out.append(f"  النص: {ref['text']}")
                out.append("  }")
            out.append("}")
        out.append("")
        out.append("=" * 60)
        out.append("")
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────
# main
# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("🕌  الفواصل القرآنية — i-quran.com/endings")
    print("=" * 60)

    with sync_playwright() as p:
        print("\n🚀 تشغيل المتصفح...")
        browser = p.chromium.launch(
            headless=True,          # غيّر لـ False لرؤية المتصفح
        )
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="ar",
            viewport={"width": 1280, "height": 900},
        )
        page = ctx.new_page()

        print(f"🌐 {URL}")
        page.goto(URL, wait_until="domcontentloaded", timeout=120000)
        page.wait_for_timeout(8000)  # wait for dynamic content to load
        print(f"📄 {page.title()}")

        results = scrape_all(page)
        browser.close()

    print(f"\n{'='*60}")
    print(f"✅ تم جمع {len(results)} زوج")

    if not results:
        print("⚠️  لا توجد بيانات. تأكد من اتصال الإنترنت وتوفر الموقع.")
        return

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON  ← {OUTPUT_JSON}")

    with open(OUTPUT_TEXT, "w", encoding="utf-8") as f:
        f.write(format_text(results))
    print(f"📄 نص   ← {OUTPUT_TEXT}")

    # عينة
    s = results[0]
    print(f"\n📋 عينة: {s['pair']}")
    print(f"   المعنى : {s['meaning']}")
    print(f"   السياقات: {' · '.join(s['contexts'])}")
    print(f"   الآيات : {len(s['references'])}")


if __name__ == "__main__":
    main()
