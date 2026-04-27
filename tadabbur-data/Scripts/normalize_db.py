import psycopg2
import os
import re
from dotenv import load_dotenv

load_dotenv()

def normalize_arabic(text):
    if not text: return ""
    # Remove tashkeel
    text = re.sub(r"[\u064B-\u0652]", "", text)
    # Normalize Alif
    text = re.sub(r"[إأآ]", "ا", text)
    # Normalize Yeh
    text = re.sub(r"ى", "ي", text)
    # Normalize Teh Marbuta
    text = re.sub(r"ة", "ه", text)
    return text

def normalize_db_text():
    conn = psycopg2.connect(os.getenv("DATABASE_URL", "postgresql://postgres:123456@localhost/TadabburData"))
    cur = conn.cursor()
    
    print("Fetching verses...")
    cur.execute("SELECT id, text_simple FROM verses")
    rows = cur.fetchall()
    
    print(f"Normalizing {len(rows)} verses...")
    for vid, text in rows:
        norm = normalize_arabic(text)
        cur.execute("UPDATE verses SET text_simple = %s WHERE id = %s", (norm, vid))
    
    conn.commit()
    print("Done.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    normalize_db_text()
