import json
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    dbname="TadabburData",
    user="postgres",
    password="123456"
)
cur = conn.cursor()

with open("i_quran_topics_final.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for surah in data:

    # نجيب ID السورة
    cur.execute("""
        SELECT id FROM surah_topics
        WHERE surah_number = %s
    """, (surah["surah_number"],))

    row = cur.fetchone()
    if not row:
        continue

    surah_topic_id = row[0]

    # حذف المحاور القديمة لتجنب التكرار
    cur.execute("DELETE FROM surah_subtopic_verses WHERE subtopic_id IN (SELECT id FROM surah_subtopics WHERE surah_topic_id = %s)", (surah_topic_id,))
    cur.execute("DELETE FROM surah_subtopics WHERE surah_topic_id = %s", (surah_topic_id,))

    for i, sub in enumerate(surah["subtopics"], start=1):

        cur.execute("""
            INSERT INTO surah_subtopics (
                surah_topic_id,
                subtopic_order,
                subtopic_title_ar,
                subtopic_title_en,
                verses_raw
            )
            VALUES (%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            surah_topic_id,
            i,
            sub["subtopic_title_ar"],
            sub.get("subtopic_title_en", ""),
            sub["range"]
        ))

        subtopic_id = cur.fetchone()[0]

        # ربط الآيات
        for ayah_key in sub["ayah_keys"]:

            cur.execute("""
                SELECT id FROM verses
                WHERE ayah_key = %s
            """, (ayah_key,))

            verse = cur.fetchone()
            if not verse:
                continue

            cur.execute("""
                INSERT INTO surah_subtopic_verses (
                    subtopic_id,
                    verse_id,
                    ayah_key
                )
                VALUES (%s,%s,%s)
                ON CONFLICT DO NOTHING
            """, (
                subtopic_id,
                verse[0],
                ayah_key
            ))

conn.commit()
cur.close()
conn.close()

print("Topics loaded successfully!")