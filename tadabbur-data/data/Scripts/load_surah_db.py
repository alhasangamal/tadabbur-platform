import json
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    dbname="TadabburData",
    user="postgres",
    password="123456"
)
cur = conn.cursor()

with open("i_quran_surahs_full.json", "r", encoding="utf-8") as f:
    surahs = json.load(f)

for s in surahs:
    # Use full fields as requested by the user
    other_names = s.get("summary_ar", "")
    naming_reason = s.get("reason_of_naming", "")

    # Update extra details in the main 'surahs' table
    cur.execute("""
        UPDATE surahs 
        SET revelation_type = %s, verses_count = %s,
            other_names_ar = %s, naming_reason_ar = %s
        WHERE surah_number = %s
    """, (s["revelation_type"], s["verses_count"], other_names, naming_reason, s["surah_number"]))

    # Insert topics into the 'surah_topics' table
    cur.execute("""
        INSERT INTO surah_topics (
            surah_number,
            surah_name_ar,
            surah_name_en,
            main_theme_ar,
            main_theme_en,
            source_name
        )
        VALUES (%s,%s,%s,%s,%s,%s)
        ON CONFLICT (surah_number) DO UPDATE SET
            surah_name_ar=EXCLUDED.surah_name_ar,
            surah_name_en=EXCLUDED.surah_name_en,
            main_theme_ar=EXCLUDED.main_theme_ar,
            main_theme_en=EXCLUDED.main_theme_en
    """, (
        s["surah_number"],
        s["surah_name_ar"],
        s["surah_name_en"],
        s["summary_ar"],
        s["summary_en"],
        "i-quran"
    ))

conn.commit()
cur.close()
conn.close()

print("Surahs loaded successfully!")