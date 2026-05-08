# -*- coding: utf-8 -*-
# pip install playwright
# playwright install

import json
import re
import sys
import time
from playwright.sync_api import sync_playwright

# Fix UTF-8 output on Windows terminal
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

URL = "https://i-quran.com/tashriaat"


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


def parse_ref(ref_full: str):
    """
    أمثلة محتملة:
    البقرة Al-Baqarah 219
    النساء An-Nisa 43
    """
    ref_full = clean_text(ref_full)
    parts = re.findall(r'[\u0600-\u06FF]+|\d+', ref_full)

    surah_name = ""
    ayah_number = None

    if parts:
        surah_name = parts[0]
        if parts[-1].isdigit():
            ayah_number = int(parts[-1])

    if ayah_number is None:
        ayah_number = extract_ayah_number(ref_full)

    return surah_name, ayah_number


def safe_text(locator):
    try:
        return clean_text(locator.inner_text())
    except:
        return ""


def collect_categories(card):
    categories = []

    candidate_selectors = [
        ".da-cats .da-cat [data-l='ar']",
        ".da-cats .da-cat",
        ".da-cat [data-l='ar']",
        ".da-cat",
        "[class*='cat'] [data-l='ar']",
        "[class*='cat']",
        "[class*='tag'] [data-l='ar']",
        "[class*='tag']",
    ]

    for selector in candidate_selectors:
        try:
            loc = card.locator(selector)
            if loc.count() > 0:
                temp = []
                for i in range(loc.count()):
                    txt = safe_text(loc.nth(i))
                    if txt and txt not in temp:
                        temp.append(txt)
                if temp:
                    categories = temp
                    break
        except:
            pass

    return categories


def collect_texts(card, selectors):
    values = []
    for selector in selectors:
        try:
            loc = card.locator(selector)
            temp = []
            for i in range(loc.count()):
                txt = safe_text(loc.nth(i))
                if txt and txt not in temp:
                    temp.append(txt)
            if temp:
                values = temp
                break
        except:
            pass
    return values


def extract_card_record(card):
    ref_full = ""
    title_ar = ""
    note_ar = ""
    verse_text = ""
    categories = []

    # المرجع
    ref_selectors = [
        ".da-ref",
        ".tsh-ref",
        "[class*='ref']",
    ]
    for selector in ref_selectors:
        try:
            loc = card.locator(selector)
            if loc.count() > 0:
                ref_full = safe_text(loc.first)
                if ref_full:
                    break
        except:
            pass

    # العنوان
    title_selectors = [
        ".da-title[data-l='ar']",
        ".da-title",
        ".tsh-title[data-l='ar']",
        ".tsh-title",
        "[class*='title'][data-l='ar']",
        "[class*='title']",
        "h2[data-l='ar']",
        "h3[data-l='ar']",
        "h4[data-l='ar']",
        "h2",
        "h3",
        "h4",
    ]
    for selector in title_selectors:
        try:
            loc = card.locator(selector)
            if loc.count() > 0:
                title_ar = safe_text(loc.first)
                if title_ar:
                    break
        except:
            pass

    # نص الآية أو النص الرئيسي
    text_selectors = [
        ".da-text",
        ".tsh-text",
        "[class*='text']",
        "[class*='verse']",
        "[class*='content']",
    ]
    texts = collect_texts(card, text_selectors)
    if texts:
        verse_text = texts[0]

    # الشرح
    note_selectors = [
        ".da-note[data-l='ar']",
        ".da-note",
        ".tsh-note[data-l='ar']",
        ".tsh-note",
        "[class*='note'][data-l='ar']",
        "[class*='note']",
        "[class*='desc'][data-l='ar']",
        "[class*='desc']",
    ]
    for selector in note_selectors:
        try:
            loc = card.locator(selector)
            if loc.count() > 0:
                note_ar = safe_text(loc.first)
                if note_ar:
                    break
        except:
            pass

    categories = collect_categories(card)
    surah_name, ayah_number = parse_ref(ref_full)

    # لو فيه track أو stage داخل categories، احتفظ بها كما هي
    record = {
        "surah_name": surah_name,
        "ayah_number": ayah_number,
        "title": title_ar,
        "ayah_text": verse_text,
        "category": categories,
        "explanation": note_ar,
    }

    if not any([
        record["surah_name"],
        record["title"],
        record["ayah_text"],
        record["explanation"],
    ]):
        return None

    return record


def scrape_tashriaat():
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/123.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1440, "height": 2600}
        )

        page = context.new_page()

        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"Opening {URL} (Attempt {attempt + 1}/{max_retries})...")
                page.goto(URL, wait_until="domcontentloaded", timeout=90000)
                break
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    browser.close()
                    return []
                time.sleep((attempt + 1) * 4)

        try:
            page.wait_for_load_state("networkidle", timeout=15000)
        except:
            pass

        card_selectors = [
            ".tsh-card",
            ".grad-card",
            ".da-card",
            ".card",
            "[class*='card']",
        ]

        card_selector_found = None
        for selector in card_selectors:
            try:
                page.wait_for_selector(selector, timeout=5000)
                if page.locator(selector).count() > 0:
                    card_selector_found = selector
                    break
            except:
                continue

        if not card_selector_found:
            print("Could not find card selector on the page.")
            browser.close()
            return []

        # Scroll لتحميل كل المحتوى
        last_count = 0
        for _ in range(20):
            page.mouse.wheel(0, 5000)
            time.sleep(1)
            current_count = page.locator(card_selector_found).count()
            if current_count == last_count and current_count > 0:
                break
            last_count = current_count

        cards = page.locator(card_selector_found)
        count = cards.count()
        print(f"Found {count} cards using selector: {card_selector_found}")

        seen = set()

        for i in range(count):
            card = cards.nth(i)
            try:
                record = extract_card_record(card)
                if not record:
                    continue

                fingerprint = (
                    record["surah_name"],
                    record["ayah_number"],
                    record["title"][:80],
                    record["ayah_text"][:80],
                )

                if fingerprint in seen:
                    continue

                seen.add(fingerprint)
                results.append(record)

            except Exception as e:
                print(f"Error extracting card {i}: {e}")

        browser.close()

    return results


if __name__ == "__main__":
    data = scrape_tashriaat()

    with open("tashriaat_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(data)} records to tashriaat_data.json")