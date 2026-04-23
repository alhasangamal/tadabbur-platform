# -*- coding: utf-8 -*-
# pip install playwright
# playwright install

import json
import re
import time
import sys
from playwright.sync_api import sync_playwright

# Ensure UTF-8 output even on Windows terminals
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

URL = "https://i-quran.com/ahkam"


def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def extract_ayah_number(text: str):
    if not text:
        return None

    m = re.search(r"﴿\s*(\d+)\s*﴾", text)
    if m:
        return int(m.group(1))

    m = re.search(r"\b(\d{1,3})\b", text)
    if m:
        return int(m.group(1))

    return None


def scrape_ahkam():
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 2500}
        )

        page = context.new_page()

        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"Navigating to {URL} (Attempt {attempt + 1}/{max_retries})...")
                page.goto(URL, wait_until="domcontentloaded", timeout=90000)
                break
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    print("All attempts failed. Closing browser.")
                    browser.close()
                    return []
                wait_time = (attempt + 1) * 5
                print(f"Waiting {wait_time}s before retrying...")
                time.sleep(wait_time)

        try:
            page.wait_for_load_state("networkidle", timeout=15000)
        except:
            pass

        try:
            page.wait_for_selector(".ahk-card", timeout=30000)
        except:
            print("Timed out waiting for .ahk-card. Check if the page loaded correctly.")
            browser.close()
            return []

        # Scroll to load all cards
        last_count = 0
        for _ in range(20):
            page.mouse.wheel(0, 5000)
            time.sleep(1)
            current_count = page.locator(".ahk-card").count()
            if current_count == last_count and current_count > 0:
                break
            last_count = current_count

        cards = page.locator(".ahk-card")
        count = cards.count()
        print(f"Found {count} cards. Starting extraction...")

        seen_records = set()

        for i in range(count):
            card = cards.nth(i)

            try:
                ref_full = clean_text(card.locator(".da-ref").inner_text())
                short_text = clean_text(card.locator(".da-title[data-l='ar']").first.inner_text())
                ayah_text = clean_text(card.locator(".da-text").inner_text())
                explanation = clean_text(card.locator(".da-note[data-l='ar']").first.inner_text())

                # Extract categories
                cat_locators = card.locator(".da-cats .da-cat [data-l='ar']")
                categories = []

                for j in range(cat_locators.count()):
                    cat_txt = clean_text(cat_locators.nth(j).inner_text())
                    if cat_txt:
                        categories.append(cat_txt)

                # Parse surah and ayah number from ref
                # Example: "البقرة Al-Baqarah 43"
                ref_parts = re.findall(r'[\u0600-\u06FF]+|\d+', ref_full)
                surah_name = ref_parts[0] if ref_parts else ""
                ayah_number = int(ref_parts[-1]) if ref_parts and ref_parts[-1].isdigit() else extract_ayah_number(ref_full)

                record = {
                    "surah_name": surah_name,
                    "ayah_number": ayah_number,
                    "short_text": short_text,
                    "ayah_text": ayah_text,
                    "category": categories,
                    "explanation": explanation
                }

                fingerprint = (
                    record["surah_name"],
                    record["ayah_number"],
                    record["ayah_text"][:80]
                )

                if fingerprint in seen_records:
                    continue

                seen_records.add(fingerprint)
                results.append(record)

            except Exception as e:
                print(f"Extraction error for card {i}: {e}")
                continue

        browser.close()

    return results


if __name__ == "__main__":
    data = scrape_ahkam()

    with open("ahkam_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(data)} records to ahkam_data.json")