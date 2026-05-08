import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_FILE = Path("i_quran_topics_final.json")


def expand_range(surah, range_text):
    try:
        if "-" in range_text:
            start, end = map(int, range_text.split("-"))
            return [f"{surah}:{i}" for i in range(start, end + 1)]
        else:
            # حالة آية واحدة
            return [f"{surah}:{int(range_text)}"]
    except:
        return []

def scrape_topics():
    data = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        for attempt in range(3):
            try:
                page.goto("https://i-quran.com/surahs", wait_until="domcontentloaded", timeout=60000)
                page.locator("#sList .scd").first.wait_for(state="visible", timeout=60000)
                break
            except Exception as e:
                print(f"Network error on attempt {attempt+1}: {e}")
                page.wait_for_timeout(3000)

        surahs = page.locator("#sList .scd")

        for i in range(surahs.count()):
            s = surahs.nth(i)

            surah_number = int(s.get_attribute("data-n"))
            name_ar = s.locator(".sna").text_content().strip()

            print(f"Processing Surah {surah_number}")

            # افتح السورة
            s.locator(".shd").click()
            page.wait_for_timeout(800)

            subtopics = []

            su_items = s.locator(".sul .su")

            for j in range(su_items.count()):
                su = su_items.nth(j)

                # نطاق الآيات
                range_text = su.locator(".sub").text_content().strip()

                # عنوان المحور
                title_ar = su.locator(".stx span[data-l='ar']").text_content().strip()
                
                # العنوان الإنجليزي (إن وجد)
                title_en = ""
                en_locator = su.locator(".stx span[data-l='en']")
                if en_locator.count() > 0:
                    title_en = en_locator.text_content().strip()

                ayah_keys = expand_range(surah_number, range_text)

                subtopics.append({
                    "subtopic_title_ar": title_ar,
                    "subtopic_title_en": title_en,
                    "range": range_text,
                    "ayah_keys": ayah_keys
                })

            data.append({
                "surah_number": surah_number,
                "surah_name_ar": name_ar,
                "subtopics": subtopics
            })

            # اقفل السورة
            s.locator(".shd").click()
            page.wait_for_timeout(200)

        browser.close()

    OUT_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print("DONE")


if __name__ == "__main__":
    scrape_topics()