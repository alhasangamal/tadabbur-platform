import csv
import psycopg2
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR.parent
CURATED_DIR = DATA_DIR / "curated"

conn = psycopg2.connect(
    host="localhost",
    dbname="TadabburData",
    user="postgres",
    password="123456"
)
cur = conn.cursor()

# Load surahs
with open(CURATED_DIR / "surahs.csv", "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        cur.execute("""
            INSERT INTO surahs (surah_number, name_ar, verses_count)
            VALUES (%s, %s, %s)
            ON CONFLICT (surah_number) DO NOTHING
        """, (row["surah_number"], row["name_ar"], row["verses_count"]))

# Load verses
with open(CURATED_DIR / "verses.csv", "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        cur.execute("SELECT id FROM surahs WHERE surah_number = %s", (row["surah_number"],))
        surah_id = cur.fetchone()[0]

        cur.execute("""
            INSERT INTO verses (surah_id, ayah_number, ayah_key, text_uthmani, text_simple)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (ayah_key) DO NOTHING
        """, (
            surah_id,
            row["ayah_number"],
            row["ayah_key"],
            row["text_uthmani"],
            row["text_simple"]
        ))

conn.commit()
cur.close()
conn.close()

print("Data loaded successfully.")