import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_pg_conn():
    return psycopg2.connect(os.getenv("DATABASE_URL", "postgresql://postgres:123456@localhost/TadabburData"))

conn = get_pg_conn()
cur = conn.cursor()
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
""")
for row in cur.fetchall():
    print(row[0])
cur.close()
conn.close()
