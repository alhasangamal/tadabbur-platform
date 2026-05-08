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

URL = "https://i-quran.com/contrasts"


def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def safe_text(locator):
    try:
        return clean_text(locator.inner_text())
    except:
        return ""


def unique_list(items):
    result = []
    seen = set()
    for item in items:
        key = json.dumps(item, ensure_ascii=False, sort_keys=True) if isinstance(item, dict) else str(item)
        if key not in seen:
            seen.add(key)
            result.append(item)
    return result


def collect_texts(container, selectors):
    values = []
    for selector in selectors:
        try:
            loc = container.locator(selector)
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


def collect_category_types(card):
    """
    المطلوب:
    "category_type": ["نور وظلمات", "إيمان وكفر"]
    لذلك نحاول التقاط كل التصنيفات العربية من البطاقة.
    """
    categories = []

    candidate_selectors = [
        ".da-cats .da-cat [data-l='ar']",
        ".da-cats .da-cat",
        ".contrast-cats .contrast-cat [data-l='ar']",
        ".contrast-cats .contrast-cat",
        ".da-cat [data-l='ar']",
        ".da-cat",
        "[class*='cat'] [data-l='ar']",
        "[class*='cat']",
        "[class*='tag'] [data-l='ar']",
        "[class*='tag']",
        "span[data-l='ar']",
    ]

    for selector in candidate_selectors:
        try:
            loc = card.locator(selector)
            temp = []
            for i in range(loc.count()):
                txt = safe_text(loc.nth(i))
                if not txt:
                    continue

                # استبعاد النصوص العامة
                if txt in [
                    "الثنائيات القرآنية",
                    "⚖️ الثنائيات القرآنية",
                    "الفرق",
                    "🔍 الفرق",
                    "لماذا هذا مهم",
                    "💎 لماذا هذا مهم",
                ]:
                    continue

                # مرشح جيد لو كان قصير نسبيًا
                if len(txt) <= 40 and txt not in temp:
                    temp.append(txt)

            # نأخذ فقط ما يشبه تصنيفات
            filtered = []
            for txt in temp:
                if any(k in txt for k in ["و", "نور", "ظلمات", "جنة", "نار", "إيمان", "كفر", "حق", "باطل", "دنيا", "آخرة"]):
                    filtered.append(txt)

            if filtered:
                categories = filtered
                break
        except:
            pass

    return unique_list(categories)


def extract_title(card):
    title_selectors = [
        ".da-title[data-l='ar']",
        ".da-title",
        ".ct-title[data-l='ar']",
        ".ct-title",
        ".contrast-title[data-l='ar']",
        ".contrast-title",
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


def normalize_label(text: str) -> str:
    text = clean_text(text)
    text = (
        text.replace("🔍", "")
            .replace("💎", "")
            .replace("⚖️", "")
            .replace(":", "")
            .strip()
    )
    return text


def is_explanation_label(text: str) -> bool:
    t = normalize_label(text)
    return t in [
        "الشرح",
        "التوضيح",
        "الفرق",
        "فرق",
        "الاختلاف",
        "المقابلة",
        "لماذا هذا مهم",
        "الأهمية",
        "مهم",
        "أهمية",
    ]


def extract_explanation(card):
    """
    المطلوب هنا explanation واحد فقط.
    إذا وجدنا "الفرق" و "لماذا هذا مهم" ندمجهما في نص واحد.
    """
    difference = ""
    importance = ""

    try:
        spans = card.locator("span[data-l='ar']")
        values = []

        for i in range(spans.count()):
            txt = safe_text(spans.nth(i))
            if txt:
                values.append(txt)

        for i, val in enumerate(values):
            label = normalize_label(val)

            if label in ["الفرق", "فرق", "الاختلاف", "المقابلة"]:
                if i + 1 < len(values):
                    difference = clean_text(values[i + 1])

            elif label in ["لماذا هذا مهم", "الأهمية", "مهم", "أهمية"]:
                if i + 1 < len(values):
                    importance = clean_text(values[i + 1])

        if difference and importance:
            return f"{difference} {importance}".strip()
        if difference:
            return difference
        if importance:
            return importance

    except:
        pass

    # fallback
    note_selectors = [
        ".da-note[data-l='ar']",
        ".da-note",
        ".ct-note[data-l='ar']",
        ".ct-note",
        ".contrast-note[data-l='ar']",
        ".contrast-note",
        "[class*='note'][data-l='ar']",
        "[class*='note']",
        "[class*='desc'][data-l='ar']",
        "[class*='desc']",
    ]

    for selector in note_selectors:
        try:
            loc = card.locator(selector)
            if loc.count() > 0:
                txt = safe_text(loc.first)
                if txt:
                    return txt
        except:
            pass

    return ""


def parse_ref_pairs(text: str):
    """
    يستخرج:
    العنكبوت 41
    البقرة 257
    ...
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
    refs = []

    ref_selectors = [
        ".da-ref",
        ".ct-ref",
        ".contrast-ref",
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
        ".ct-text",
        ".contrast-text",
        "[class*='text']",
        "[class*='verse']",
        "[class*='content']",
    ]

    texts = collect_texts(card, text_selectors)

    cleaned = []
    for txt in texts:
        txt = clean_text(txt)
        if not txt:
            continue

        # استبعاد العناوين والإشارات
        if normalize_label(txt) in ["الفرق", "لماذا هذا مهم", "الأهمية", "الاختلاف", "المقابلة"]:
            continue

        cleaned.append(txt)

    return unique_list(cleaned)


def build_ayahs_with_refs(card):
    ayah_texts = extract_ayah_texts(card)
    ref_candidates = extract_reference_candidates(card)

    parsed_refs = []
    for ref_text in ref_candidates:
        parsed = parse_ref_pairs(ref_text)
        if parsed:
            parsed_refs.extend(parsed)

    unique_refs = []
    seen = set()
    for r in parsed_refs:
        fp = (r["surah_name"], r["ayah_number"])
        if fp not in seen:
            seen.add(fp)
            unique_refs.append(r)

    ayahs = []

    # لو العدد متساوٍ نربط مباشرة
    if unique_refs and len(unique_refs) == len(ayah_texts):
        for ref, ayah_text in zip(unique_refs, ayah_texts):
            ayahs.append({
                "surah_name": ref["surah_name"],
                "ayah_number": ref["ayah_number"],
                "ayah_text": ayah_text
            })
        return ayahs

    # fallback
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
    category_type = collect_category_types(card)
    title = extract_title(card)
    ayahs = build_ayahs_with_refs(card)
    explanation = extract_explanation(card)

    record = {
        "category_type": category_type,
        "title": title,
        "ayahs": ayahs,
        "explanation": explanation
    }

    if not any([
        record["category_type"],
        record["title"],
        record["ayahs"],
        record["explanation"]
    ]):
        return None

    return record


def scrape_contrasts():
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
            ".contrast-card",
            ".ct-card",
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

                ayah_fp = " | ".join(
                    f"{a['surah_name']}-{a['ayah_number']}-{a['ayah_text'][:40]}"
                    for a in record["ayahs"][:4]
                )

                fingerprint = (
                    " | ".join(record["category_type"])[:120],
                    record["title"][:120],
                    ayah_fp[:260],
                    record["explanation"][:160],
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
    data = scrape_contrasts()

    with open("contrasts_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(data)} records to contrasts_data.json")