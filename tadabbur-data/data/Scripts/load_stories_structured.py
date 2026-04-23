# -*- coding: utf-8 -*-
# pip install playwright
# playwright install

import json
import time
import sys
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

URL = "https://i-quran.com/stories"


def clean(text):
    return text.strip() if text else ""


def extract_story_data(card, page):
    # اسم القصة
    name = ""
    name_loc = card.locator(".st-nm span.ar")
    if name_loc.count() > 0:
        name = clean(name_loc.first.inner_text())

    # التاجز
    tags = []
    tag_elements = card.locator(".st-badge.cat span[data-l='ar']")
    for j in range(tag_elements.count()):
        txt = clean(tag_elements.nth(j).inner_text())
        if txt:
            tags.append(txt)

    # شرح مبسط
    summary = ""
    why_loc = card.locator(".st-why span[data-l='ar']")
    if why_loc.count() > 0:
        summary = clean(why_loc.first.inner_text())

    # المحاور عبر السور
    themes = []
    theme_elements = card.locator(".st-themes-list span span[data-l='ar']")
    for j in range(theme_elements.count()):
        txt = clean(theme_elements.nth(j).inner_text())
        if txt:
            themes.append(txt)

    # المواضع
    placements = []
    occs = card.locator(".st-oc")

    for j in range(occs.count()):
        oc = occs.nth(j)

        surah = ""
        ayah_range = ""
        title = ""
        context = ""

        surah_loc = oc.locator(".st-oc-surah span[data-l='ar']")
        if surah_loc.count() > 0:
            surah = clean(surah_loc.first.inner_text())

        range_loc = oc.locator(".st-oc-num span[data-l='ar']")
        if range_loc.count() > 0:
            ayah_range = clean(range_loc.first.inner_text())

        title_loc = oc.locator(".st-oc-angle span[data-l='ar']")
        if title_loc.count() > 0:
            title = clean(title_loc.first.inner_text())

        context_loc = oc.locator(".st-oc-detail span[data-l='ar']")
        if context_loc.count() > 0:
            context = clean(context_loc.first.inner_text())

        # افتح الموضع لتحميل الآيات
        try:
            oc.click(timeout=2000)
            page.wait_for_timeout(1200)
        except:
            pass

        verses = oc.locator(".ays .ayi .ayt")
        text_list = []
        for k in range(verses.count()):
            verse_txt = clean(verses.nth(k).inner_text())
            if verse_txt:
                text_list.append(verse_txt)

        placements.append({
            "title": title,
            "context": context,
            "surah_name": surah,
            "ayah_range": ayah_range,
            "text": "\n".join(text_list)
        })

    return {
        "اسم_صاحب_القصة": name,
        "التاجز": tags,
        "شرح_مبسط": summary,
        "المحاور_عبر_السور": themes,
        "المواضع": placements
    }


def scrape():
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto(URL, wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

        # Scroll لتحميل كل القصص
        for _ in range(6):
            page.mouse.wheel(0, 3000)
            time.sleep(1)

        cards_count = page.locator(".st-card").count()
        print("Stories found:", cards_count)

        seen_names = set()

        for i in range(cards_count):
            try:
                # أعد جلب الكروت كل مرة لتفادي stale locator
                cards = page.locator(".st-card")
                card = cards.nth(i)

                card.scroll_into_view_if_needed()
                page.wait_for_timeout(500)

                # افتح القصة
                card.click()
                page.wait_for_timeout(1500)

                # اقرأ من نفس الكارت
                story_data = extract_story_data(card, page)

                story_name = story_data["اسم_صاحب_القصة"]

                if story_name and story_name not in seen_names:
                    seen_names.add(story_name)
                    results.append(story_data)
                    print(f"Extracted: {story_name}")

            except Exception as e:
                print(f"Error at story {i}:", e)
                continue

        browser.close()

    return results


if __name__ == "__main__":
    data = scrape()

    with open("stories_final.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Saved:", len(data))