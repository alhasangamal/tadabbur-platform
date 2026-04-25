import psycopg2
import os
import json
import re
from neo4j import GraphDatabase
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

class QuranSearchEngine:
    def __init__(self):
        self.pg_url = os.getenv("DATABASE_URL", "postgresql://postgres:123456@localhost/TadabburData")
        self.neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        self.neo4j_password = os.getenv("NEO4J_PASSWORD", "123456789")
        
        try:
            self.driver = GraphDatabase.driver(self.neo4j_uri, auth=(self.neo4j_user, self.neo4j_password))
        except Exception as e:
            print(f"Neo4j connection error: {e}")
            self.driver = None

        self.stories_path = r"c:\Users\ALHASSANGAMAL\Desktop\tadabbur-platform\tadabbur-ui\src\data\stories_data.json"
        self.endings_path = r"c:\Users\ALHASSANGAMAL\Desktop\tadabbur-platform\tadabbur-data\data\Scripts\quran_endings.json"
        
        self.stories = self._load_json(self.stories_path)
        self.endings = self._load_json(self.endings_path)

    def _load_json(self, path):
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []

    def get_pg_conn(self):
        return psycopg2.connect(self.pg_url)

    def search_verses(self, query, limit=5):
        norm_query = normalize_arabic(query)
        conn = self.get_pg_conn()
        cur = conn.cursor()
        
        # Check if query matches a Surah name or number
        surah_id = None
        if query.isdigit():
            surah_id = int(query)
        
        if surah_id:
            cur.execute("""
                SELECT v.ayah_key, v.text_uthmani, s.name_ar, t.tafsir_text
                FROM verses v
                JOIN surahs s ON s.surah_number = v.surah_id
                LEFT JOIN tafsirs t ON t.verse_id = v.id
                WHERE s.surah_number = %s
                ORDER BY v.ayah_number ASC
                LIMIT %s
            """, (surah_id, limit))
        else:
            # Search using ILIKE on text_simple and check surah names
            cur.execute("""
                SELECT v.ayah_key, v.text_uthmani, s.name_ar, t.tafsir_text
                FROM verses v
                JOIN surahs s ON s.surah_number = v.surah_id
                LEFT JOIN tafsirs t ON t.verse_id = v.id
                WHERE v.text_simple LIKE %s OR v.text_simple LIKE %s OR s.name_ar LIKE %s OR s.name_en ILIKE %s
                ORDER BY (CASE WHEN s.name_ar LIKE %s THEN 0 ELSE 1 END), v.ayah_number ASC
                LIMIT %s
            """, (f"%{query}%", f"%{norm_query}%", f"%{norm_query}%", f"%{query}%", f"%{norm_query}%", limit))
        
        results = cur.fetchall()
        cur.close()
        conn.close()
        return [
            {
                "ayah_key": r[0],
                "ayah_text": r[1],
                "surah_name": r[2],
                "tafsir_text": r[3] or "لا يوجد تفسير متاح حالياً لهذا الموضع.",
                "tafsir_source": "الميسر"
            } for r in results
        ]

    def search_stories(self, query):
        norm_query = normalize_arabic(query)
        relevant = []
        for story in self.stories:
            name = normalize_arabic(story.get("اسم_صاحب_القصة", ""))
            tags = [normalize_arabic(tag) for tag in story.get("التاجز", [])]
            if norm_query in name or any(norm_query in tag for tag in tags) or any(word in name for word in norm_query.split() if len(word) > 2):
                relevant.append(story)
        return relevant[:3]

    def search_endings(self, query):
        norm_query = normalize_arabic(query)
        relevant = []
        for ending in self.endings:
            pair = normalize_arabic(ending.get("pair", ""))
            meaning = normalize_arabic(ending.get("meaning", ""))
            if norm_query in pair or norm_query in meaning:
                relevant.append(ending)
        return relevant[:2]

    def search_quran_sources(self, question):
        # Clean question from common search terms to extract the core topic
        clean_q = re.sub(r"(ابحث عن|اين وردت|ما هي|قصة|سورة|ايه|اية|معنى|ما هو|تفسير)", "", question).strip()
        search_term = clean_q if len(clean_q) > 2 else question
        
        verses = self.search_verses(search_term)
        stories = self.search_stories(search_term)
        endings = self.search_endings(search_term)
        
        combined = []
        # Add verses
        for v in verses:
            combined.append({
                "type": "verse",
                "surah_name": v["surah_name"],
                "ayah_number": v["ayah_key"].split(":")[1],
                "surah_number": v["ayah_key"].split(":")[0],
                "ayah_text": v["ayah_text"],
                "tafsir_text": v["tafsir_text"],
                "tafsir_source": v["tafsir_source"]
            })
            
        # Add stories
        for s in stories:
            combined.append({
                "type": "story",
                "title": s["اسم_صاحب_القصة"],
                "summary": s["شرح_مبسط"],
                "details": s["المواضع"][0]["text"] if s["المواضع"] else ""
            })

        # Add endings (Fواصل)
        for e in endings:
            combined.append({
                "type": "story", # Reuse story type for simplicity in frontend or add new
                "title": f"فاصلة: {e['pair']}",
                "summary": e["meaning"],
                "details": f"المواضع: {e['placements']}"
            })
            
        return combined

def search_quran_sources(question):
    engine = QuranSearchEngine()
    return engine.search_quran_sources(question)
