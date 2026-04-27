import psycopg2
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:123456@localhost/TadabburData")

def setup_db():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    print("Creating tafsirs table...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tafsirs (
            id SERIAL PRIMARY KEY,
            verse_id INTEGER REFERENCES verses(id),
            ayah_key VARCHAR(20),
            tafsir_name VARCHAR(100),
            tafsir_text TEXT,
            UNIQUE(verse_id, tafsir_name)
        )
    """)
    
    print("Adding meaning_ar to words table...")
    try:
        cur.execute("ALTER TABLE words ADD COLUMN meaning_ar TEXT")
    except psycopg2.errors.DuplicateColumn:
        conn.rollback()
        cur = conn.cursor()
        print("Column meaning_ar already exists.")
    else:
        conn.commit()
        cur = conn.cursor()

    conn.commit()
    cur.close()
    conn.close()

def ingest_tafsir_muyassar():
    # We will fetch Tafsir Muyassar (ID 16 on Quran.com)
    # Since fetching all 6236 might take time, we'll do it surah by surah or in batches.
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    cur.execute("SELECT id, ayah_key, surah_id, ayah_number FROM verses ORDER BY id")
    verses = cur.fetchall()
    
    print(f"Ingesting Tafsir for {len(verses)} verses...")
    
    # Quran.com API for Tafsir: https://api.quran.com/api/v4/quran/tafsirs/16
    # It's better to fetch by chapter to be faster
    for surah_id in range(1, 115):
        print(f"Fetching Tafsir for Surah {surah_id}...")
        try:
            resp = requests.get(f"https://api.quran.com/api/v4/quran/tafsirs/16?chapter_number={surah_id}")
            resp.raise_for_status()
            tafsirs = resp.data.get('tafsirs', []) if hasattr(resp, 'data') else resp.json().get('tafsirs', [])
            
            for t in tafsirs:
                # verse_key format: "1:1"
                v_key = t['verse_key']
                text = t['text']
                
                cur.execute("""
                    INSERT INTO tafsirs (verse_id, ayah_key, tafsir_name, tafsir_text)
                    SELECT id, %s, 'الميسر', %s FROM verses WHERE ayah_key = %s
                    ON CONFLICT (verse_id, tafsir_name) DO UPDATE SET tafsir_text = EXCLUDED.tafsir_text
                """, (v_key, text, v_key))
            conn.commit()
        except Exception as e:
            print(f"Error fetching surah {surah_id}: {e}")
            conn.rollback()

    cur.close()
    conn.close()

if __name__ == "__main__":
    setup_db()
    # ingest_tafsir_muyassar() # Uncomment to run full ingestion
    print("Database setup complete.")
