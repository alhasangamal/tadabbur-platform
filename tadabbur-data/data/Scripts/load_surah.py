import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# Ensure UTF-8 output even on Windows terminals
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

OUT_FILE = Path("i_quran_surahs_full.json")
SURAHS_URL = "https://i-quran.com/surahs"

def extract_summaries(raw_info: str):
    if not raw_info:
        return "", ""

    cleaned = re.sub(
        r'^\s*[a-z0-9\-]+\s+[\u0600-\u06FF]+\s+\d+\s*',
        '',
        raw_info,
        flags=re.IGNORECASE
    ).strip()

    ar_match = re.search(r'[\u0600-\u06FF].*', cleaned)
    summary_ar = ar_match.group(0).strip() if ar_match else ""
    summary_en = re.split(r'[\u0600-\u06FF]', cleaned, maxsplit=1)[0].strip()

    return summary_ar, summary_en

def scrape_surahs():
    data = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print(f"Opening {SURAHS_URL}...")
        try:
            page.goto(SURAHS_URL, wait_until="domcontentloaded", timeout=60000)
            page.locator("#sList .scd").first.wait_for(state="visible", timeout=60000)
        except Exception as e:
            print(f"Load failed: {e}")
            browser.close()
            return

        total_surahs = page.locator("#sList .scd").count()
        print(f"Found surahs: {total_surahs}")

        for i in range(total_surahs):
            # Refresh locator each time in case of state changes
            s = page.locator("#sList .scd").nth(i)
            s.scroll_into_view_if_needed()
            
            surah_number = i + 1
            try:
                sn_attr = s.get_attribute("data-n")
                if sn_attr and sn_attr.isdigit():
                    surah_number = int(sn_attr)
            except: pass

            name_ar = s.locator(".sna").inner_text().strip()
            name_en = s.locator(".sne").inner_text().strip()
            
            raw_info = s.get_attribute("data-s") or ""
            revelation_type = s.get_attribute("data-p") or ""
            
            vct_text = s.locator(".vct").inner_text().strip()
            verses_match = re.search(r"\d+", vct_text)
            verses_count = int(verses_match.group()) if verses_match else 0
            
            summary_ar, summary_en = extract_summaries(raw_info)
            
            reason_of_naming = ""
            print(f"[{i+1}/{total_surahs}] Surah {surah_number}...", end=" ", flush=True)

            try:
                # Open expansion in-place
                detail_selector = f"#sbd_{surah_number}"
                if not page.locator(detail_selector).is_visible():
                    s.click()
                
                # Wait for specific reason indicator
                reason_locator = page.locator(f"{detail_selector} .nb-t span[data-l='ar']").first
                reason_locator.wait_for(state="visible", timeout=10000)
                reason_of_naming = reason_locator.inner_text().strip()
                print("Success.")
            except PlaywrightTimeoutError:
                print("Timeout (Reason not found).")
            except Exception as e:
                print(f"Error: {e}")

            data.append({
                "surah_number": surah_number,
                "surah_name_ar": name_ar,
                "surah_name_en": name_en,
                "revelation_type": revelation_type,
                "verses_count": verses_count,
                "summary_ar": summary_ar,
                "summary_en": summary_en,
                "reason_of_naming": reason_of_naming
            })

            # To avoid cluttering the DOM, we could close it, but usually not needed.
            # If we wanted to: s.click() again.

        browser.close()

    OUT_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nSaved {len(data)} surahs to {OUT_FILE}")

if __name__ == "__main__":
    scrape_surahs()