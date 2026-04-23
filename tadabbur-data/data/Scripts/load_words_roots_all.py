import re
import time
import requests
import psycopg2
from bs4 import BeautifulSoup
from typing import Optional, List, Dict, Tuple

DB_CONFIG = {
    "host": "localhost",
    "dbname": "TadabburData",
    "user": "postgres",
    "password": "123456",
}

BASE_WORD_URL = "https://corpus.quran.com/wordbyword.jsp"
BASE_MORPH_URL = "https://corpus.quran.com/wordmorphology.jsp?location=({location})"

REQUEST_DELAY_SECONDS = 0.7
REQUEST_TIMEOUT = 30


# ---------------------------
# DB Helpers
# ---------------------------

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


def get_all_verses(cur) -> List[Tuple[int, str, str, int]]:
    """
    returns:
    [
      (verse_id, ayah_key, text_uthmani, surah_id),
      ...
    ]
    """
    cur.execute("""
        SELECT id, ayah_key, text_uthmani, surah_id
        FROM verses
        ORDER BY surah_id, ayah_number
    """)
    return cur.fetchall()


def upsert_word(cur, verse_id: int, token_uthmani: Optional[str], item: dict):
    cur.execute(
        """
        INSERT INTO words (
            verse_id,
            word_index,
            location_key,
            token_uthmani,
            transliteration_en,
            translation_en,
            pos_summary,
            pos_clean,
            pos_tags,
            grammar_summary,
            arabic_grammar_summary,
            corpus_link
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (location_key)
        DO UPDATE SET
            verse_id = EXCLUDED.verse_id,
            word_index = EXCLUDED.word_index,
            token_uthmani = COALESCE(EXCLUDED.token_uthmani, words.token_uthmani),
            transliteration_en = EXCLUDED.transliteration_en,
            translation_en = EXCLUDED.translation_en,
            pos_summary = EXCLUDED.pos_summary,
            pos_clean = EXCLUDED.pos_clean,
            pos_tags = EXCLUDED.pos_tags,
            grammar_summary = EXCLUDED.grammar_summary,
            arabic_grammar_summary = EXCLUDED.arabic_grammar_summary,
            corpus_link = EXCLUDED.corpus_link
        RETURNING id
        """,
        (
            verse_id,
            item["word_index"],
            item["location_key"],
            token_uthmani,
            item["transliteration_en"],
            item["translation_en"],
            item["pos_summary"],
            item["pos_clean"],
            item["pos_tags"],
            item["grammar_summary"],
            item["arabic_grammar_summary"],
            item["corpus_link"],
        ),
    )
    return cur.fetchone()[0]


def upsert_root(cur, root_ar: str, transliteration_en: Optional[str]) -> int:
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


# ---------------------------
# HTTP Helpers
# ---------------------------

def fetch_html(url: str) -> str:
    resp = requests.get(
        url,
        timeout=REQUEST_TIMEOUT,
        headers={"User-Agent": "Mozilla/5.0"}
    )
    resp.raise_for_status()
    resp.encoding = "utf-8"
    return resp.text


def fetch_verse_wordbyword_html(chapter: int, verse: int) -> str:
    return fetch_html(f"{BASE_WORD_URL}?chapter={chapter}&verse={verse}")


def fetch_word_morphology_html(location_key: str) -> str:
    return fetch_html(BASE_MORPH_URL.format(location=location_key))


# ---------------------------
# Word parsing
# ---------------------------

def normalize_lines(html: str) -> List[str]:
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text("\n")
    lines = [ln.strip() for ln in text.splitlines()]
    return [ln for ln in lines if ln]


def extract_pos_data(pos_lines: List[str]):
    grammar_summary = " | ".join(pos_lines) if pos_lines else None

    tags = []
    for line in pos_lines:
        parts = [p.strip() for p in line.split("|")]
        for part in parts:
            if re.fullmatch(r"[A-Z]+", part):
                tags.append(part)

    seen = set()
    pos_tags = []
    for tag in tags:
        if tag not in seen:
            seen.add(tag)
            pos_tags.append(tag)

    pos_clean = "+".join(pos_tags) if pos_tags else None
    return pos_tags, pos_clean, grammar_summary


def is_probable_arabic_token(line: str) -> bool:
    """
    يلتقط الكلمة العربية نفسها، ويتجنب السطور العربية الطويلة الخاصة بالشرح النحوي.
    """
    if not line:
        return False

    # يحتوي عربي
    if not re.search(r"[\u0600-\u06FF]", line):
        return False

    # ليس location
    if re.match(r"^\(\d+:\d+:\d+\)$", line):
        return False

    # لا يحتوي على فواصل وصفية شائعة
    blacklist = ["جار ومجرور", "اسم ", "صفة ", "فعل ", "ضمير ", "الواو ", "حرف "]
    if any(x in line for x in blacklist):
        return False

    # غالبًا الكلمة المفردة/التركيب القصير
    return True


def extract_word_blocks(lines: List[str], chapter: int, verse: int) -> List[Dict]:
    location_pattern = re.compile(rf"^\(({chapter}:{verse}:\d+)\)$")
    arabic_line_pattern = re.compile(r"[\u0600-\u06FF]")

    words = []
    i = 0

    while i < len(lines):
        match = location_pattern.match(lines[i])
        if not match:
            i += 1
            continue

        location_key = match.group(1)
        word_index = int(location_key.split(":")[2])

        token_uthmani = None
        transliteration = None
        translation = None
        pos_lines = []
        arabic_grammar_lines = []

        # نحاول أخذ الكلمة العربية من السطر السابق
        if i - 1 >= 0 and is_probable_arabic_token(lines[i - 1]):
            token_uthmani = lines[i - 1]

        # transliteration
        if i + 1 < len(lines):
            transliteration = lines[i + 1]

        # translation
        j = i + 2
        if j < len(lines):
            translation = lines[j]
            j += 1

        while j < len(lines):
            if location_pattern.match(lines[j]):
                break

            if lines[j].startswith("Verse ") or "Quran Recitation" in lines[j]:
                break

            if arabic_line_pattern.search(lines[j]):
                arabic_grammar_lines.append(lines[j])
                j += 1

                while j < len(lines):
                    if location_pattern.match(lines[j]):
                        break
                    if lines[j].startswith("Verse ") or "Quran Recitation" in lines[j]:
                        break
                    if arabic_line_pattern.search(lines[j]):
                        arabic_grammar_lines.append(lines[j])
                        j += 1
                    else:
                        break
                break
            else:
                pos_lines.append(lines[j])
                j += 1

        pos_tags, pos_clean, grammar_summary = extract_pos_data(pos_lines)

        words.append(
            {
                "location_key": location_key,
                "word_index": word_index,
                "token_uthmani": token_uthmani,
                "transliteration_en": transliteration,
                "translation_en": translation,
                "pos_tags": pos_tags if pos_tags else None,
                "pos_clean": pos_clean,
                "pos_summary": pos_clean,
                "grammar_summary": grammar_summary,
                "arabic_grammar_summary": " | ".join(arabic_grammar_lines) if arabic_grammar_lines else None,
                "corpus_link": f"{BASE_WORD_URL}?chapter={chapter}&verse={verse}",
            }
        )

        i = j

    return words


def split_tokens_from_verse_text(text_uthmani: str) -> List[str]:
    """
    fallback فقط لو لم نستطع أخذ token من Corpus.
    ننظف العلامات المصحفية والرموز التي ليست كلمات.
    """

    if not text_uthmani:
        return []

    text = text_uthmani

    # إزالة علامات الوقف والزخارف القرآنية الشائعة
    quran_marks_pattern = r"[ۖۗۘۙۚۛۜ۝۞]"
    text = re.sub(quran_marks_pattern, " ", text)

    # إزالة التطويل إن وجد
    text = re.sub(r"ـ+", "", text)

    # توحيد المسافات
    text = re.sub(r"\s+", " ", text).strip()

    tokens = text.split(" ")

    cleaned_tokens = []
    for tok in tokens:
        tok = tok.strip()

        if not tok:
            continue

        # تجاهل أي token أصبح مجرد رمز
        if re.fullmatch(r"[ۖۗۘۙۚۛۜ۝۞]+", tok):
            continue

        cleaned_tokens.append(tok)

    return cleaned_tokens


# ---------------------------
# Root parsing
# ---------------------------

def normalize_text_from_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    text = re.sub(r"\s+", " ", text)
    return text


def extract_root_data(html: str):
    """
    مثال:
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

    translit = re.sub(r"\s+", " ", match.group(1).strip())
    root_ar = re.sub(r"\s+", " ", match.group(2).strip())

    return root_ar, translit


# ---------------------------
# Main pipeline
# ---------------------------

def import_words_for_all_verses(cur, verses: List[Tuple[int, str, str, int]]) -> Dict[str, int]:
    stats = {
        "verses_processed": 0,
        "words_upserted": 0,
        "word_failures": 0,
        "token_mismatch": 0,
        "corpus_token_used": 0,
        "fallback_token_used": 0,
    }

    for verse_id, ayah_key, text_uthmani, _surah_id in verses:
        chapter, verse = map(int, ayah_key.split(":"))
        print(f"[WORDS] Fetching {ayah_key} ...")

        try:
            html = fetch_verse_wordbyword_html(chapter, verse)
            lines = normalize_lines(html)
            items = extract_word_blocks(lines, chapter, verse)
            tokens = split_tokens_from_verse_text(text_uthmani)

            if len(tokens) != len(items):
                stats["token_mismatch"] += 1
                print(
                    f"[WARN] Token mismatch for {ayah_key}: "
                    f"DB={len(tokens)} Corpus={len(items)}"
                )

            for idx, item in enumerate(items):
                token_uthmani = item.get("token_uthmani")

                # fallback فقط إذا لم نستطع أخذ token من Corpus
                if token_uthmani:
                    stats["corpus_token_used"] += 1
                else:
                    token_uthmani = tokens[idx] if idx < len(tokens) else None
                    stats["fallback_token_used"] += 1

                upsert_word(cur, verse_id, token_uthmani, item)
                stats["words_upserted"] += 1

            stats["verses_processed"] += 1
            time.sleep(REQUEST_DELAY_SECONDS)

        except Exception as e:
            stats["word_failures"] += 1
            print(f"[ERROR][WORDS] {ayah_key}: {e}")

    return stats


def import_roots_for_all_words(cur) -> Dict[str, int]:
    stats = {
        "words_processed_for_roots": 0,
        "roots_upserted": 0,
        "root_maps_upserted": 0,
        "root_failures": 0,
        "root_not_found": 0,
        "root_skipped_expected": 0,
    }

    cur.execute("""
        SELECT w.id, w.location_key, w.pos_tags
        FROM words w
        LEFT JOIN word_root_map wrm ON wrm.word_id = w.id
        WHERE wrm.id IS NULL
        ORDER BY
            split_part(w.location_key, ':', 1)::int,
            split_part(w.location_key, ':', 2)::int,
            split_part(w.location_key, ':', 3)::int
    """)
    rows = cur.fetchall()

    print(f"[ROOTS] Words to process: {len(rows)}")

    skip_tags = {"P", "PRON", "REL", "NEG", "CONJ", "INTG", "T", "LOC", "EMPH"}

    for word_id, location_key, pos_tags in rows:
        print(f"[ROOTS] Processing {location_key} ...")

        try:
            # تخطّي الكلمات التي غالبًا لا جذر ثلاثي لها
            if pos_tags and all(tag in skip_tags for tag in pos_tags):
                stats["root_skipped_expected"] += 1
                print(f"[SKIP][ROOTS] No expected root for {location_key} | pos_tags={pos_tags}")
                continue

            html = fetch_word_morphology_html(location_key)
            root_ar, root_translit = extract_root_data(html)

            if not root_ar:
                stats["root_not_found"] += 1
                print(f"[WARN][ROOTS] Root not found for {location_key} | pos_tags={pos_tags}")
                continue

            root_id = upsert_root(cur, root_ar, root_translit)
            upsert_word_root_map(cur, word_id, root_id)

            stats["words_processed_for_roots"] += 1
            stats["roots_upserted"] += 1
            stats["root_maps_upserted"] += 1

            time.sleep(REQUEST_DELAY_SECONDS)

        except Exception as e:
            stats["root_failures"] += 1
            print(f"[ERROR][ROOTS] {location_key}: {e}")

    return stats


def run_full_import(start_surah: Optional[int] = None, end_surah: Optional[int] = None):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        verses = get_all_verses(cur)

        if start_surah is not None:
            verses = [v for v in verses if v[3] >= start_surah]
        if end_surah is not None:
            verses = [v for v in verses if v[3] <= end_surah]

        print(f"Total verses selected: {len(verses)}")

        # print("\n=== STEP 1: IMPORT WORDS ===")
        # word_stats = import_words_for_all_verses(cur, verses)
        # conn.commit()

        print("\n=== STEP 2: IMPORT ROOTS ===")
        root_stats = import_roots_for_all_words(cur)
        conn.commit()

        print("\n=== DONE ===")
        print("Root stats:", root_stats)

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    # شغّل المصحف كله
    run_full_import()

    # أمثلة للتشغيل على دفعات:
    # run_full_import(start_surah=1, end_surah=2)
    # run_full_import(start_surah=3, end_surah=10)