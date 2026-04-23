import re
import time
from urllib.parse import urljoin

import requests
import psycopg2
from bs4 import BeautifulSoup

DB_CONFIG = {
    "host": "localhost",
    "dbname": "TadabburData",
    "user": "postgres",
    "password": "123456",
}

BASE_URL = "https://corpus.quran.com/"
MORPH_URL = "https://corpus.quran.com/wordmorphology.jsp?location=({location})"


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


def fetch_html(url: str) -> str:
    resp = requests.get(
        url,
        timeout=30,
        headers={"User-Agent": "Mozilla/5.0"},
    )
    resp.raise_for_status()
    resp.encoding = "utf-8"
    return resp.text


def html_to_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text("\n", strip=True)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n+", "\n", text)
    return text.strip()


def html_to_lines(html: str) -> list[str]:
    text = html_to_text(html)
    return [x.strip() for x in text.splitlines() if x.strip()]


def normalize_inline(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def strip_diacritics_ar(text: str) -> str:
    return re.sub(r"[\u064B-\u065F\u0670\u06D6-\u06ED]", "", text)


def parse_dictionary_link_from_morphology(html: str) -> str | None:
    soup = BeautifulSoup(html, "html.parser")

    for a in soup.find_all("a", href=True):
        href = a["href"]
        label = normalize_inline(a.get_text(" ", strip=True)).lower()

        if "qurandictionary.jsp" in href:
            return urljoin(BASE_URL, href)

        if label == "quran dictionary":
            return urljoin(BASE_URL, href)

    return None


def parse_derived_forms(text: str) -> dict[str, tuple[str, str]]:
    """
    يلتقط من النص الكامل عبارات مثل:
    147 times as the noun ilāh (إِلَٰه)
    2699 times as the proper noun allah (ٱللَّه)
    five times as the form of address allahumma (ٱللَّهُمَّ)
    """
    forms = {}

    count_words = (
        r"(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|"
        r"thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|"
        r"thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)"
    )

    pattern = re.compile(
        rf"{count_words}\s+times\s+as\s+the\s+(.+?)\s+([^\(\n]+?)\s*\(([\u0600-\u06FF\s]+)\)",
        flags=re.IGNORECASE | re.DOTALL
    )

    for m in pattern.finditer(text):
        form_type = normalize_inline(m.group(1).lower())
        lemma_en = normalize_inline(m.group(2))
        lemma_ar = normalize_inline(m.group(3))

        if form_type and lemma_ar:
            forms[form_type] = (lemma_ar, lemma_en)

    return forms


def is_heading_line(line: str) -> bool:
    line = line.strip().lstrip("#").strip()

    patterns = [
        r"^Proper noun\s*-\s*.+$",
        r"^Noun\s*-\s*.+$",
        r"^Verb\s*-\s*.+$",
        r"^Adjective\s*-\s*.+$",
        r"^Form of address\s*-\s*.+$",
        r"^Pronoun\s*-\s*.+$",
        r"^Relative pronoun\s*-\s*.+$",
    ]

    return any(re.match(p, line, flags=re.IGNORECASE) for p in patterns)


def map_heading_to_form_type(heading: str) -> str:
    h = heading.lower().strip().lstrip("#").strip()

    if h.startswith("proper noun"):
        return "proper noun"
    if h.startswith("noun"):
        return "noun"
    if h.startswith("form of address"):
        return "form of address"
    if h.startswith("verb"):
        return "verb"
    if h.startswith("adjective"):
        return "adjective"
    if h.startswith("pronoun"):
        return "pronoun"
    if h.startswith("relative pronoun"):
        return "relative pronoun"

    return h.split("-")[0].strip()


def find_heading_for_location(lines: list[str], location_key: str) -> str | None:
    target_patterns = [f"({location_key})", location_key]

    target_index = None
    for idx, line in enumerate(lines):
        if any(tp in line for tp in target_patterns):
            target_index = idx
            break

    if target_index is None:
        return None

    for i in range(target_index, -1, -1):
        if is_heading_line(lines[i]):
            return lines[i].strip().lstrip("#").strip()

    return None


def extract_lemma_from_dictionary(dictionary_html: str, heading: str | None, token_uthmani: str | None):
    text = html_to_text(dictionary_html)
    forms = parse_derived_forms(text)

    if heading:
        form_type = map_heading_to_form_type(heading)
        lemma_info = forms.get(form_type)
        if lemma_info:
            return lemma_info[0], lemma_info[1], "forms"

    # fallback 1: اشتق lemma_en من heading
    if heading and "-" in heading:
        left, right = heading.split("-", 1)
        lemma_en = right.strip()
        if token_uthmani:
            return token_uthmani, lemma_en, "fallback_heading_token"

    # fallback 2: استخدم token نفسه مؤقتًا
    if token_uthmani:
        return token_uthmani, None, "fallback_token"

    return None, None, None


def get_words_without_lemmas(cur, surah_id: int | None = None):
    if surah_id is None:
        cur.execute(
            """
            SELECT w.id, w.location_key, w.token_uthmani
            FROM words w
            LEFT JOIN word_lemma_map wlm ON wlm.word_id = w.id
            WHERE wlm.id IS NULL
            ORDER BY w.location_key
            """
        )
    else:
        cur.execute(
            """
            SELECT w.id, w.location_key, w.token_uthmani
            FROM words w
            JOIN verses v ON v.id = w.verse_id
            LEFT JOIN word_lemma_map wlm ON wlm.word_id = w.id
            WHERE wlm.id IS NULL
              AND v.surah_id = %s
            ORDER BY w.location_key
            """,
            (surah_id,)
        )

    return cur.fetchall()


def upsert_lemma(cur, lemma_ar: str, lemma_en: str | None) -> int:
    cur.execute(
        """
        INSERT INTO lemmas (lemma_ar, lemma_en)
        VALUES (%s, %s)
        ON CONFLICT (lemma_ar)
        DO UPDATE SET
            lemma_en = COALESCE(lemmas.lemma_en, EXCLUDED.lemma_en)
        RETURNING id
        """,
        (lemma_ar, lemma_en)
    )
    return cur.fetchone()[0]


def upsert_word_lemma_map(cur, word_id: int, lemma_id: int):
    cur.execute(
        """
        INSERT INTO word_lemma_map (word_id, lemma_id)
        VALUES (%s, %s)
        ON CONFLICT (word_id, lemma_id) DO NOTHING
        """,
        (word_id, lemma_id)
    )


def import_lemmas_for_words(surah_id: int | None = 1, debug_location: str | None = None):
    conn = get_db_connection()
    cur = conn.cursor()

    processed = 0
    mapped = 0
    failed = []

    try:
        rows = get_words_without_lemmas(cur, surah_id=surah_id)
        print(f"Words to process: {len(rows)}")

        for word_id, location_key, token_uthmani in rows:
            print(f"Processing {location_key} ...")

            try:
                morph_url = MORPH_URL.format(location=location_key)
                morph_html = fetch_html(morph_url)

                dictionary_url = parse_dictionary_link_from_morphology(morph_html)
                if not dictionary_url:
                    print(f"[WARN] Dictionary link not found for {location_key}")
                    failed.append(location_key)
                    continue

                dict_html = fetch_html(dictionary_url)
                dict_lines = html_to_lines(dict_html)
                heading = find_heading_for_location(dict_lines, location_key)

                if debug_location and location_key == debug_location:
                    debug_text = html_to_text(dict_html)
                    print("\n--- DEBUG DICTIONARY URL ---")
                    print(dictionary_url)
                    print("--- DEBUG DICTIONARY URL END ---\n")

                    print("\n--- DEBUG HEADING ---")
                    print(heading)
                    print("--- DEBUG HEADING END ---\n")

                    print("\n--- DEBUG DERIVED FORMS ---")
                    print(parse_derived_forms(debug_text))
                    print("--- DEBUG DERIVED FORMS END ---\n")

                lemma_ar, lemma_en, source_mode = extract_lemma_from_dictionary(
                    dict_html, heading, token_uthmani
                )

                if not lemma_ar:
                    print(f"[WARN] Lemma not found for {location_key} (heading={heading})")
                    failed.append(location_key)
                    continue

                lemma_id = upsert_lemma(cur, lemma_ar, lemma_en)
                upsert_word_lemma_map(cur, word_id, lemma_id)

                conn.commit()
                processed += 1
                mapped += 1

                print(
                    f"  -> lemma_ar: {lemma_ar} | lemma_en: {lemma_en} "
                    f"| heading: {heading} | mode: {source_mode}"
                )

                time.sleep(0.7)

            except Exception as e:
                conn.rollback()
                print(f"[ERROR] {location_key}: {e}")
                failed.append(location_key)

        print(f"\nDone. Processed successfully: {processed}, mapped: {mapped}")

        if failed:
            print("\nFailed locations:")
            for loc in failed:
                print(loc)

    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    import_lemmas_for_words(surah_id=1, debug_location=None)