"""
سكريبت استخراج جدول الكثافة من موقع i-quran.com/endings

هيكل HTML المستهدف (من تحليل الصور):
──────────────────────────────────────
  <tbody id="dTb">
    <tr>
      <td class="nc">60</td>                          ← رقم السورة
      <td>
        <span data-l="en" style="display:none;">Al-Mumtahina</span>
        <span data-l="ar" style="display:inline;">الممتحنة</span>
      </td>                                            ← اسم السورة
      <td class="nc">13</td>                          ← عدد الآيات
      <td class="nc">7</td>                           ← عدد الفواصل
      <td>...</td>                                    ← الكثافة / density
    </tr>
    ...
  </tbody>

التثبيت:
    pip install playwright
    playwright install chromium

التشغيل:
    python quran_density_scraper.py
"""

import json
import sys
import io
from playwright.sync_api import sync_playwright

# Ensure UTF-8 output even on Windows terminals
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

URL = "https://i-quran.com/endings"
OUTPUT_JSON = "الكثافة.json"
OUTPUT_TEXT = "الكثافة.txt"


def scrape_density(page):
    """استخراج جدول الكثافة من tbody#dTb"""
    rows_data = []

    # ── استراتيجية 1: tbody#dTb مباشرة ─────────────────────────
    tbody = page.query_selector("tbody#dTb")

    if not tbody:
        print("  ⚠️  tbody#dTb لم يوجد — جاري البحث عن الجدول...")

        # ── استراتيجية 2: أي جدول يحتوي بيانات السور ───────────
        tbody = page.evaluate_handle("""
            () => {
                const tbodies = document.querySelectorAll('tbody');
                for (const tb of tbodies) {
                    const firstRow = tb.querySelector('tr');
                    if (firstRow && firstRow.querySelectorAll('td').length >= 4) {
                        return tb;
                    }
                }
                return null;
            }
        """)

    if not tbody:
        print("  ❌ لم يتم إيجاد الجدول")
        return []

    rows = tbody.query_selector_all("tr")
    print(f"  📊 {len(rows)} صف في الجدول")

    for i, row in enumerate(rows):
        cells = row.query_selector_all("td")
        if len(cells) < 4:
            continue

        try:
            # الخلية 0: رقم السورة
            surah_num = cells[0].inner_text().strip()

            # الخلية 1: اسم السورة (عربي + إنجليزي)
            ar_span = cells[1].query_selector("span[data-l='ar']")
            en_span = cells[1].query_selector("span[data-l='en']")
            surah_ar = ar_span.inner_text().strip() if ar_span else cells[1].inner_text().strip()
            surah_en = en_span.inner_text().strip() if en_span else ""

            # الخلية 2: عدد الآيات
            ayat_count = cells[2].inner_text().strip()

            # الخلية 3: عدد الفواصل
            fawasel_count = cells[3].inner_text().strip()

            # الخلية 4: الكثافة (لو موجودة)
            density = ""
            if len(cells) >= 5:
                density = cells[4].inner_text().strip()

            # حساب الكثافة لو مش موجودة
            if not density and ayat_count.isdigit() and fawasel_count.isdigit():
                pct = round(int(fawasel_count) / int(ayat_count) * 100, 1)
                density = f"{pct}%"

            row_data = {
                "رقم_السورة": surah_num,
                "السورة_عربي": surah_ar,
                "السورة_انجليزي": surah_en,
                "عدد_الآيات": ayat_count,
                "عدد_الفواصل": fawasel_count,
                "الكثافة": density,
            }
            rows_data.append(row_data)

            if i < 5 or i % 20 == 0:
                print(f"    [{surah_num}] {surah_ar} — {fawasel_count}/{ayat_count} = {density}")

        except Exception as e:
            print(f"    ⚠️  صف {i}: {e}")

    return rows_data


def format_text(rows):
    """تنسيق الجدول نصياً"""
    lines = [
        "📊 جدول الكثافة — الفواصل القرآنية",
        "=" * 65,
        "",
        f"{'#':<5} {'السورة':<20} {'الآيات':^8} {'الفواصل':^10} {'الكثافة':^10}",
        "-" * 65,
    ]
    for r in rows:
        lines.append(
            f"{r['رقم_السورة']:<5} "
            f"{r['السورة_عربي']:<20} "
            f"{r['عدد_الآيات']:^8} "
            f"{r['عدد_الفواصل']:^10} "
            f"{r['الكثافة']:^10}"
        )
    lines += [
        "-" * 65,
        f"الإجمالي: {len(rows)} سورة",
        "",
    ]
    return "\n".join(lines)


def main():
    print("=" * 60)
    print("📊 استخراج جدول الكثافة — i-quran.com/endings")
    print("=" * 60)

    with sync_playwright() as p:
        print("\n🚀 تشغيل المتصفح...")
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

        print(f"🌐 {URL}")
        page.goto(URL, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(5000)
        page.wait_for_timeout(3000)
        print(f"📄 {page.title()}")

        # قد يكون الجدول في تاب "الكثافة / Density" — انقر عليه لو موجود
        try:
            tab = page.query_selector(
                "button:has-text('كثافة'), [role='tab']:has-text('كثافة'), "
                "button:has-text('Density'), a:has-text('كثافة'), "
                "button:has-text('Densityالكثافة')"
            )
            if tab:
                print("  🖱️  نقر على تاب الكثافة...")
                tab.click()
                page.wait_for_timeout(2000)
            else:
                # جرب النقر على الكلمة في الـ nav bar
                density_link = page.query_selector("text=الكثافة")
                if density_link:
                    print("  🖱️  نقر على رابط الكثافة...")
                    density_link.click()
                    page.wait_for_timeout(2000)
        except Exception as e:
            print(f"  ℹ️  بحث التاب: {e}")

        # انتظر ظهور الجدول
        try:
            page.wait_for_selector("tbody#dTb", timeout=5000)
            print("  ✅ tbody#dTb ظهر")
        except Exception:
            print("  ⚠️  tbody#dTb لم يظهر — جاري المحاولة على أي حال...")

        rows = scrape_density(page)
        browser.close()

    print(f"\n{'='*60}")
    print(f"✅ تم استخراج {len(rows)} سورة")

    if not rows:
        print("⚠️  لا توجد بيانات. تأكد من الاتصال بالإنترنت وتوفر الموقع.")
        return

    # حفظ JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON  ← {OUTPUT_JSON}")

    # حفظ نص
    with open(OUTPUT_TEXT, "w", encoding="utf-8") as f:
        f.write(format_text(rows))
    print(f"📄 نص   ← {OUTPUT_TEXT}")

    # إحصائيات سريعة
    try:
        total_ayat    = sum(int(r["عدد_الآيات"])   for r in rows if r["عدد_الآيات"].isdigit())
        total_fawasel = sum(int(r["عدد_الفواصل"]) for r in rows if r["عدد_الفواصل"].isdigit())
        avg = round(total_fawasel / total_ayat * 100, 1) if total_ayat else 0
        print(f"\n📈 إجمالي الآيات: {total_ayat}")
        print(f"📈 إجمالي الفواصل: {total_fawasel}")
        print(f"📈 متوسط الكثافة: {avg}%")
    except Exception:
        pass


if __name__ == "__main__":
    main()