import psycopg2

conn = psycopg2.connect(
    host="localhost",
    dbname="TadabburData",
    user="postgres",
    password="123456"
)
cur = conn.cursor()

print("--- Check Al-Fatiha Topics ---")
cur.execute("""
    SELECT ss.subtopic_title_ar, ss.verses_raw 
    FROM surah_topics st 
    JOIN surah_subtopics ss ON st.id = ss.surah_topic_id 
    WHERE st.surah_number = 1 
    ORDER BY ss.subtopic_order;
""")
for row in cur.fetchall():
    print(row)

print("\n--- Check Table Column Names ---")
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'surahs';")
print("Surahs columns:", [r[0] for r in cur.fetchall()])

cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'surah_topics';")
print("Surah_topics columns:", [r[0] for r in cur.fetchall()])

cur.close()
conn.close()
