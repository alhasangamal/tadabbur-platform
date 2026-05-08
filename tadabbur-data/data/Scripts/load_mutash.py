# -*- coding: utf-8 -*-
# pip install playwright
# playwright install

import json
import re
import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

URL = "https://i-quran.com/mutash"


def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def safe_text(locator):
    try:
        return clean_text(locator.inner_text())
    except:
        return ""


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


def detect_type(card_text: str, categories: list):
    combined = " ".join(categories) + " " + card_text

    if "روابط موضوعية" in combined:
        return "روابط موضوعية"
    if "متشابهات لفظية" in combined:
        return "متشابهات لفظية"
    if "تشابه" in combined or "لفظ" in combined:
        return "متشابهات لفظية"
    if "موضوع" in combined or "رابط" in combined:
        return "روابط موضوعية"

    return ""


def extract_title(card):
    title_selectors = [
        ".da-title[data-l='ar']",
        ".da-title",
        ".mt-title[data-l='ar']",
        ".mt-title",
        ".mut-title[data-l='ar']",
        ".mut-title",
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
                txt = safe_text(loc.first)
                if txt:
                    return txt
        except:
            pass

    return ""


def extract_topic(title: str, categories: list, card_text: str):
    filtered = [clean_text(x) for x in categories if clean_text(x)]
    filtered = [x for x in filtered if x not in ("متشابهات لفظية", "روابط موضوعية")]

    if filtered:
        return filtered[0]

    title_clean = clean_text(title)
    m = re.search(r'^\d+\s*[«"]?\s*([^\s«":]+)', title_clean)
    if m:
        first_word = clean_text(m.group(1))
        if first_word:
            return first_word

    m = re.search(r'(خلق|جنة|نار|رزق|إيمان|كفر|ماء|ريح|نور|ظلمات)', card_text)
    if m:
        return m.group(1)

    return ""


def extract_difference_importance(card):
    difference = ""
    importance = ""

    def normalize_label(text: str) -> str:
        text = clean_text(text)
        text = text.replace("🔍", "").replace("💎", "").replace(":", "").strip()
        return text

    def is_difference_label(text: str) -> bool:
        t = normalize_label(text)
        return t in ["الفرق", "فرق", "الاختلاف"]

    def is_importance_label(text: str) -> bool:
        t = normalize_label(text)
        return t in ["لماذا هذا مهم", "الأهمية", "مهم", "أهمية"]

    try:
        spans = card.locator("span[data-l='ar']")
        values = []

        for i in range(spans.count()):
            txt = safe_text(spans.nth(i))
            if txt:
                values.append(txt)

        for i, val in enumerate(values):
            if is_difference_label(val):
                if i + 1 < len(values):
                    difference = clean_text(values[i + 1])

            elif is_importance_label(val):
                if i + 1 < len(values):
                    importance = clean_text(values[i + 1])

        return difference, importance

    except:
        return "", ""


def parse_ref_pairs(text: str):
    """
    يحاول استخراج أزواج:
    اسم السورة + رقم الآية
    من نص مثل:
    العلق 2 | الإنسان 2 | السجدة 7
    أو أي صيغة مشابهة.
    """
    text = clean_text(text)
    if not text:
        return []

    pattern = re.compile(r'([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*)\s+(\d{1,3})')
    matches = pattern.findall(text)

    refs = []
    for surah_name, ayah_number in matches:
        refs.append({
            "surah_name": clean_text(surah_name),
            "ayah_number": int(ayah_number)
        })

    return refs


def extract_reference_candidates(card):
    """
    نجمع أي نصوص مرجعية محتملة من البطاقة.
    """
    refs = []

    ref_selectors = [
        ".da-ref",
        ".mt-ref",
        ".mut-ref",
        "[class*='ref']",
        "[class*='meta']",
        "[class*='ayah']",
        "[class*='surah']",
    ]

    for selector in ref_selectors:
        try:
            loc = card.locator(selector)
            for i in range(loc.count()):
                txt = safe_text(loc.nth(i))
                if txt and txt not in refs:
                    refs.append(txt)
        except:
            pass

    # fallback: اجمع spans عربية قصيرة نسبيًا قد تحتوي مراجع
    try:
        spans = card.locator("span[data-l='ar']")
        for i in range(spans.count()):
            txt = safe_text(spans.nth(i))
            if txt and len(txt) < 80 and re.search(r'[\u0600-\u06FF]+\s+\d{1,3}', txt):
                if txt not in refs:
                    refs.append(txt)
    except:
        pass

    return refs


def extract_ayah_texts(card):
    text_selectors = [
        ".da-text",
        ".mt-text",
        ".mut-text",
        "[class*='text']",
        "[class*='verse']",
        "[class*='content']",
    ]

    texts = collect_texts(card, text_selectors)

    cleaned = []
    for txt in texts:
        txt = clean_text(txt)
        if txt and txt not in cleaned:
            cleaned.append(txt)

    return cleaned


def build_ayahs_with_refs(card):
    ayah_texts = extract_ayah_texts(card)
    ref_candidates = extract_reference_candidates(card)

    parsed_refs = []
    for ref_text in ref_candidates:
        parsed = parse_ref_pairs(ref_text)
        if parsed:
            parsed_refs.extend(parsed)

    # إزالة التكرارات
    unique_refs = []
    seen = set()
    for r in parsed_refs:
        fp = (r["surah_name"], r["ayah_number"])
        if fp not in seen:
            seen.add(fp)
            unique_refs.append(r)

    ayahs = []

    if unique_refs and len(unique_refs) == len(ayah_texts):
        for ref, ayah_text in zip(unique_refs, ayah_texts):
            ayahs.append({
                "surah_name": ref["surah_name"],
                "ayah_number": ref["ayah_number"],
                "ayah_text": ayah_text
            })
    else:
        # fallback: نحفظ النصوص حتى لو لم نستطع مطابقة كل المراجع بدقة
        for i, ayah_text in enumerate(ayah_texts):
            surah_name = ""
            ayah_number = None

            if i < len(unique_refs):
                surah_name = unique_refs[i]["surah_name"]
                ayah_number = unique_refs[i]["ayah_number"]

            ayahs.append({
                "surah_name": surah_name,
                "ayah_number": ayah_number,
                "ayah_text": ayah_text
            })

    return ayahs


def extract_card_record(card):
    card_text = safe_text(card)
    categories = collect_categories(card)
    record_type = detect_type(card_text, categories)

    title = extract_title(card)
    topic = extract_topic(title, categories, card_text)
    difference, importance = extract_difference_importance(card)
    ayahs = build_ayahs_with_refs(card)

    record = {
        "type": record_type,
        "topic": topic,
        "title": title,
        "ayahs": ayahs,
        "difference": difference,
        "importance": importance
    }

    if not any([
        record["type"],
        record["topic"],
        record["title"],
        record["ayahs"],
        record["difference"],
        record["importance"]
    ]):
        return None

    return record


def scrape_mutash():
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
            ".mut-card",
            ".mt-card",
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

                ayah_fingerprint = " | ".join(
                    f"{a['surah_name']}-{a['ayah_number']}-{a['ayah_text'][:40]}"
                    for a in record["ayahs"][:3]
                )

                fingerprint = (
                    record["type"],
                    record["topic"],
                    record["title"][:120],
                    ayah_fingerprint[:240],
                    record["difference"][:120],
                    record["importance"][:120],
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
    data = scrape_mutash()

    with open("mutash_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(data)} records to mutash_data.json")