"""
سكريبت استخراج قسم "الاكتشافات / صفات مختصة بسياقات محددة"
من موقع i-quran.com/endings

التثبيت:
    pip install playwright
    playwright install chromium

التشغيل:
    python quran_insights_scraper.py
"""

import json
import sys
import io
from playwright.sync_api import sync_playwright

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

URL = "https://i-quran.com/endings"
OUTPUT_JSON = "اكتشافات.json"
OUTPUT_TEXT = "اكتشافات.txt"


def scrape_insights(page):
    """استخراج جميع الاكتشافات من قسم Insights"""
    insights = []

    # ── استراتيجية 1: البحث عن div.ic-n ─────────────────────────
    ic_numbers = page.query_selector_all("div.ic-n")
    print(f"  🔎 div.ic-n: {len(ic_numbers)}")

    if ic_numbers:
        for ic in ic_numbers:
            number = ic.inner_text().strip()

            # الـ sibling التالي هو الـ div الذي يحتوي h4 + p
            content_div = page.evaluate_handle(
                "el => el.nextElementSibling", ic
            )

            title = ""
            body = ""

            try:
                h4_span = content_div.query_selector("h4 span[data-l='ar']")
                if h4_span:
                    title = h4_span.inner_text().strip()

                p_span = content_div.query_selector("p span[data-l='ar']")
                if p_span:
                    body = p_span.inner_text().strip()
            except Exception:
                # fallback: inner text مباشرة
                try:
                    full = content_div.inner_text().strip()
                    lines = [l.strip() for l in full.split("\n") if l.strip()]
                    title = lines[0] if lines else ""
                    body = " ".join(lines[1:]) if len(lines) > 1 else ""
                except Exception:
                    pass

            if title or body:
                insights.append({
                    "رقم": number,
                    "العنوان": title,
                    "النص": body,
                })
                print(f"    [{number}] {title[:50]}")

        return insights

    # ── استراتيجية 2: البحث عن قسم Insights بالعنوان ────────────
    print("  ⚠️  ic-n لم يوجد — البحث عن قسم الاكتشافات بطريقة بديلة...")

    section = page.evaluate_handle("""
        () => {
            const all = document.querySelectorAll('h2, h3, [class*="insight"], [class*="discover"], [id*="insight"]');
            for (const el of all) {
                if (el.innerText && (
                    el.innerText.includes('اكتشاف') ||
                    el.innerText.includes('Insight') ||
                    el.innerText.includes('Discover')
                )) {
                    return el.parentElement;
                }
            }
            return null;
        }
    """)

    if section:
        items = page.evaluate("""
            (sec) => {
                if (!sec) return [];
                const h4s = sec.querySelectorAll('h4');
                return Array.from(h4s).map((h4, i) => {
                    const titleEl = h4.querySelector("span[data-l='ar']") || h4;
                    const p = h4.nextElementSibling;
                    const bodyEl = p ? (p.querySelector("span[data-l='ar']") || p) : null;
                    const numEl = h4.parentElement?.previousElementSibling;
                    return {
                        رقم: numEl?.innerText?.trim() || String(i + 1).padStart(2, '0'),
                        العنوان: titleEl.innerText?.trim() || '',
                        النص: bodyEl ? bodyEl.innerText?.trim() : '',
                    };
                });
            }
        """, section)

        for item in items:
            if item.get("العنوان") or item.get("النص"):
                insights.append(item)
                print(f"    [{item['رقم']}] {item['العنوان'][:50]}")

        return insights

    # ── استراتيجية 3: جمع كل h4+p بـ data-l='ar' في الصفحة ─────
    print("  ⚠️  القسم لم يوجد — جمع كل h4 + p من الصفحة...")

    all_h4 = page.query_selector_all("h4")
    for i, h4 in enumerate(all_h4, 1):
        span_ar = h4.query_selector("span[data-l='ar']")
        title = span_ar.inner_text().strip() if span_ar else h4.inner_text().strip()

        body = ""
        try:
            p = page.evaluate_handle("el => el.nextElementSibling", h4)
            if p:
                p_span = p.query_selector("span[data-l='ar']")
                body = p_span.inner_text().strip() if p_span else p.inner_text().strip()
        except Exception:
            pass

        num = str(i).zfill(2)
        try:
            num_div = page.evaluate("""
                el => {
                    const prev = el.parentElement?.previousElementSibling;
                    return prev?.classList?.contains('ic-n') ? prev.innerText?.trim() : null;
                }
            """, h4)
            if num_div:
                num = num_div
        except Exception:
            pass

        if title:
            insights.append({
                "رقم": num,
                "العنوان": title,
                "النص": body,
            })
            print(f"    [{num}] {title[:50]}")

    return insights


def format_text(insights):
    """تنسيق الاكتشافات نصياً"""
    lines = ["🔍 الاكتشافات — الفواصل القرآنية", "=" * 60, ""]
    for item in insights:
        lines.append(f"({item['رقم']}) {item['العنوان']}")
        lines.append("")
        lines.append(item['النص'])
        lines.append("")
        lines.append("-" * 40)
        lines.append("")
    return "\n".join(lines)


def main():
    print("=" * 60)
    print("🔍 استخراج الاكتشافات — i-quran.com/endings")
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
        page.goto(URL, wait_until="domcontentloaded", timeout=120000)
        page.wait_for_timeout(8000)
        print(f"📄 {page.title()}")

        # قد يكون قسم الاكتشافات في تاب منفصل
        try:
            tab = page.query_selector(
                "button:has-text('اكتشاف'), [role='tab']:has-text('اكتشاف'), "
                "button:has-text('Insight'), a:has-text('اكتشاف')"
            )
            if tab:
                print("  🖱️  نقر على تاب الاكتشافات...")
                tab.click()
                page.wait_for_timeout(2000)
        except Exception:
            pass

        insights = scrape_insights(page)
        browser.close()

    print(f"\n{'='*60}")
    print(f"✅ تم استخراج {len(insights)} اكتشاف")

    if not insights:
        print("⚠️  لا توجد بيانات. تأكد من الاتصال بالإنترنت وتوفر الموقع.")
        return

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(insights, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON  ← {OUTPUT_JSON}")

    with open(OUTPUT_TEXT, "w", encoding="utf-8") as f:
        f.write(format_text(insights))
    print(f"📄 نص   ← {OUTPUT_TEXT}")

    if insights:
        print(f"\n📋 عينة:")
        s = insights[0]
        print(f"  ({s['رقم']}) {s['العنوان']}")
        print(f"  {s['النص'][:120]}...")


if __name__ == "__main__":
    main()
