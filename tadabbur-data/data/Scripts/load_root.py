import re
import time
import requests
import psycopg2
from bs4 import BeautifulSoup

DB_CONFIG = {
    "host": "localhost",
    "dbname": "TadabburData",
    "user": "postgres",
    "password": "123456",
}

MORPH_URL = "https://corpus.quran.com/wordmorphology.jsp?location=({location})"


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


def fetch_word_morphology_html(location_key: str) -> str:
    url = MORPH_URL.format(location=location_key)
    resp = requests.get(
        url,
        timeout=30,
        headers={"User-Agent": "Mozilla/5.0"}
    )
    resp.raise_for_status()
    resp.encoding = "utf-8"
    return resp.text


def normalize_text_from_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    text = re.sub(r"\s+", " ", text)
    return text


def extract_root_data(html: str):
    """
    يلتقط الجذر والترانسلِت من جملة مثل:
    The proper noun's triliteral root is hamza lām hā (أ ل ه).
    The verb's triliteral root is ʿayn bā dāl (ع ب د).
    """
    text = normalize_text_from_html(html)

    match = re.search(
        r"triliteral root is\s+(.+?)\s+\(([ء-ي\s]+)\)",
        text,
        flags=re.IGNORECASE
    )

    if not match:
        return None, None

    translit = match.group(1).strip()
    translit = re.sub(r"\s+", " ", translit)

    root_ar = match.group(2).strip()
    root_ar = re.sub(r"\s+", " ", root_ar)

    return root_ar, translit


def get_words_without_roots(cur, surah_id: int | None = None):
    if surah_id is None:
        cur.execute(
            """
            SELECT w.id, w.location_key
            FROM words w
            LEFT JOIN word_root_map wrm ON wrm.word_id = w.id
            WHERE wrm.id IS NULL
            ORDER BY w.location_key
            """
        )
    else:
        cur.execute(
            """
            SELECT w.id, w.location_key
            FROM words w
            JOIN verses v ON v.id = w.verse_id
            LEFT JOIN word_root_map wrm ON wrm.word_id = w.id
            WHERE wrm.id IS NULL
              AND v.surah_id = %s
            ORDER BY w.location_key
            """,
            (surah_id,)
        )

    return cur.fetchall()


def upsert_root(cur, root_ar: str, transliteration_en: str | None) -> int:
    cur.execute(
        """
        INSERT INTO roots (root_ar, transliteration_en)
        VALUES (%s, %s)
        ON CONFLICT (root_ar)
        DO UPDATE SET
            transliteration_en = COALESCE(roots.transliteration_en, EXCLUDED.transliteration_en)
        RETURNING id
        """,
        (root_ar, transliteration_en)
    )
    return cur.fetchone()[0]


def upsert_word_root_map(cur, word_id: int, root_id: int):
    cur.execute(
        """
        INSERT INTO word_root_map (word_id, root_id)
        VALUES (%s, %s)
        ON CONFLICT (word_id, root_id) DO NOTHING
        """,
        (word_id, root_id)
    )


def import_roots_for_words(surah_id: int | None = 1, debug_location: str | None = None):
    conn = get_db_connection()
    cur = conn.cursor()

    processed = 0
    mapped = 0
    failed = []

    try:
        rows = get_words_without_roots(cur, surah_id=surah_id)
        print(f"Words to process: {len(rows)}")

        for word_id, location_key in rows:
            print(f"Processing {location_key} ...")

            try:
                html = fetch_word_morphology_html(location_key)

                if debug_location and location_key == debug_location:
                    debug_text = normalize_text_from_html(html)
                    print("\n--- DEBUG PAGE TEXT START ---")
                    print(debug_text[:1500])
                    print("--- DEBUG PAGE TEXT END ---\n")

                root_ar, root_translit = extract_root_data(html)

                if not root_ar:
                    print(f"[WARN] Root not found for {location_key}")
                    failed.append(location_key)
                    continue

                root_id = upsert_root(cur, root_ar, root_translit)
                upsert_word_root_map(cur, word_id, root_id)

                conn.commit()

                processed += 1
                mapped += 1

                print(f"  -> root_ar: {root_ar} | translit: {root_translit}")

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
    # ابدأ بالفاتحة فقط
    # ولو أردت تشخيص صفحة محددة استخدم debug_location="1:1:2"
    import_roots_for_words(surah_id=1, debug_location=None)