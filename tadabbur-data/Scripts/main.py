from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Tadabbur Graph API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Neo4j
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "123456789")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# PostgreSQL
def get_pg_conn():
    return psycopg2.connect(os.getenv("DATABASE_URL", "postgresql://postgres:123456@localhost/TadabburData"))

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "Tadabbur Graph API is running"}


@app.get("/surahs/map")
def get_surahs_map():
    conn = get_pg_conn()
    cur = conn.cursor()
    cur.execute("SELECT surah_number, name_ar FROM surahs ORDER BY surah_number")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {str(r[0]): r[1] for r in rows}


@app.get("/surahs")
def get_all_surahs():
    conn = get_pg_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT s.surah_number, s.name_ar, s.revelation_type, s.verses_count,
               st.surah_name_en, st.main_theme_ar, st.main_theme_en,
               s.other_names_ar, s.naming_reason_ar
        FROM surahs s
        LEFT JOIN surah_topics st ON st.surah_number = s.surah_number
        ORDER BY s.surah_number
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    return [
        {
            "id": r[0],
            "name_ar": r[1],
            "revelation_type": r[2],
            "verses": r[3],
            "name_en": r[4] or f"Surah {r[0]}",
            "theme_ar": r[5] or "",
            "theme_en": r[6] or "",
            "other_names": r[7] or "",
            "naming_reason": r[8] or ""
        }
        for r in rows
    ]


@app.get("/surahs/{surah_number}/topics")
def get_surah_topics(surah_number: int):
    conn = get_pg_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT ss.id, ss.subtopic_order, ss.subtopic_title_ar, ss.subtopic_title_en, ss.verses_raw
        FROM surah_topics st
        JOIN surah_subtopics ss ON st.id = ss.surah_topic_id
        WHERE st.surah_number = %s
        ORDER BY ss.subtopic_order
    """, (surah_number,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    return {
        "surah_number": surah_number,
        "topics": [
            {
                "id": r[0],
                "order": r[1],
                "title_ar": r[2],
                "title_en": r[3] or "",
                "verses_range": r[4]
            }
            for r in rows
        ]
    }


@app.get("/verses/by-keys")
def get_verses_by_keys_simple(keys: str = Query(..., description="Comma-separated ayah keys like 2:30,7:142")):
    key_list = [k.strip() for k in keys.split(",") if k.strip()]
    if not key_list:
        return {"verses": []}

    conn = get_pg_conn()
    cur = conn.cursor()

    results = []
    for key in key_list:
        cur.execute("""
            SELECT v.ayah_key, v.text_uthmani, s.name_ar AS surah_name
            FROM verses v
            JOIN surahs s ON s.id = v.surah_id
            WHERE v.ayah_key = %s
        """, (key,))
        row = cur.fetchone()
        if row:
            results.append({
                "ayah_key": row[0],
                "text_uthmani": row[1],
                "surah_name": row[2]
            })

    cur.close()
    conn.close()
    return {"verses": results}


@app.get("/entities")
def list_entities(limit: int = 100, skip: int = 0):
    query = """
    MATCH (e:Entity)
    RETURN e.entity_id AS entity_id,
           e.slug AS slug,
           e.name_ar AS name_ar,
           e.name_en AS name_en,
           e.entity_type AS entity_type
    ORDER BY e.name_ar
    SKIP $skip
    LIMIT $limit
    """
    with driver.session() as session:
        records = session.run(query, skip=skip, limit=limit)
        data = [record.data() for record in records]
    return {"count": len(data), "items": data}


@app.get("/entities/search")
def search_entities(q: str):
    query = """
    MATCH (e:Entity)
    WHERE toLower(e.slug) CONTAINS toLower($q)
       OR toLower(e.name_ar) CONTAINS toLower($q)
       OR toLower(e.name_en) CONTAINS toLower($q)
    RETURN e.entity_id AS entity_id,
           e.slug AS slug,
           e.name_ar AS name_ar,
           e.name_en AS name_en,
           e.entity_type AS entity_type
    LIMIT 50
    """
    with driver.session() as session:
        records = session.run(query, q=q)
        data = [record.data() for record in records]
    return {"query": q, "items": data}


@app.get("/entities/{slug}")
def get_entity_details(slug: str):
    query = """
    MATCH (e:Entity {slug:$slug})
    RETURN e.entity_id AS entity_id,
           e.slug AS slug,
           e.name_ar AS name_ar,
           e.name_en AS name_en,
           e.entity_type AS entity_type
    """
    with driver.session() as session:
        record = session.run(query, slug=slug).single()
        if not record:
            return {"found": False, "slug": slug}
    return {"found": True, "entity": record.data()}


@app.get("/entities/{slug}/verses")
def get_entity_verses(slug: str):
    query = """
    MATCH (v:Verse)-[r:MENTIONS]->(e:Entity {slug:$slug})
    RETURN v.verse_id AS verse_id,
           v.ayah_key AS ayah_key,
           r.mention_text AS mention_text,
           r.mention_type AS mention_type,
           r.confidence_score AS confidence_score
    ORDER BY v.verse_id
    LIMIT 300
    """
    with driver.session() as session:
        records = session.run(query, slug=slug)
        data = [record.data() for record in records]
    return {"slug": slug, "count": len(data), "verses": data}


@app.get("/graph/entities")
def get_all_graph_relations():
    # FIX: removed :RELATES - now matches all relationship types
    query = """
    MATCH (s:Entity)-[r]->(t:Entity)
    RETURN
        s.slug AS source_slug,
        s.name_ar AS source_name_ar,
        s.entity_type AS source_type,
        t.slug AS target_slug,
        t.name_ar AS target_name_ar,
        t.entity_type AS target_type,
        type(r) AS relation_type,
        r.relation_label_ar AS relation_label_ar,
        r.evidence_notes AS evidence_notes
    LIMIT 2000
    """
    with driver.session() as session:
        records = session.run(query)
        data = [record.data() for record in records]
    return {"relations": data}


@app.get("/graph/entity/{slug}")
def get_entity_neighbors(slug: str):
    # FIX: removed :RELATES - now matches all relationship types
    query = """
    MATCH (e:Entity {slug:$slug})-[r]->(x:Entity)
    RETURN
        e.slug AS source_slug,
        e.name_ar AS source_name_ar,
        x.slug AS target_slug,
        x.name_ar AS target_name_ar,
        x.entity_type AS target_type,
        type(r) AS relation_type,
        r.relation_label_ar AS relation_label_ar,
        r.evidence_notes AS evidence_notes
    UNION
    MATCH (x:Entity)-[r]->(e:Entity {slug:$slug})
    RETURN
        x.slug AS source_slug,
        x.name_ar AS source_name_ar,
        e.slug AS target_slug,
        e.name_ar AS target_name_ar,
        x.entity_type AS target_type,
        type(r) AS relation_type,
        r.relation_label_ar AS relation_label_ar,
        r.evidence_notes AS evidence_notes
    LIMIT 200
    """
    with driver.session() as session:
        records = session.run(query, slug=slug)
        data = [record.data() for record in records]
    return {"slug": slug, "relations": data}


@app.get("/graph/shortest-path")
def get_shortest_path(from_slug: str = Query(...), to_slug: str = Query(...)):
    # FIX: removed :RELATED_TO - now matches all relationship types
    query = """
    MATCH (a:Entity {slug:$from_slug}), (b:Entity {slug:$to_slug})
    MATCH p = shortestPath((a)-[*]-(b))
    RETURN p
    """
    with driver.session() as session:
        record = session.run(query, from_slug=from_slug, to_slug=to_slug).single()
        if not record:
            return {"from": from_slug, "to": to_slug, "path_found": False, "nodes": [], "relationships": []}

        path = record["p"]
        nodes = [{"entity_id": n.get("entity_id"), "slug": n.get("slug"),
                  "name_ar": n.get("name_ar"), "name_en": n.get("name_en"),
                  "entity_type": n.get("entity_type")} for n in path.nodes]
        relationships = [{"type": rel.type, "relation_type": rel.get("relation_type")} for rel in path.relationships]

    return {"from": from_slug, "to": to_slug, "path_found": True, "nodes": nodes, "relationships": relationships}


@app.get("/graph/entity-verses/{slug}")
def get_entity_verses_by_slug(slug: str):
    query = """
    MATCH (v:Verse)-[r:MENTIONS]->(e:Entity {slug:$slug})
    RETURN v.verse_id AS verse_id,
           v.ayah_key AS ayah_key,
           r.mention_text AS mention_text,
           r.mention_type AS mention_type,
           r.confidence_score AS confidence_score
    ORDER BY v.verse_id
    LIMIT 200
    """
    with driver.session() as session:
        records = session.run(query, slug=slug)
        data = [record.data() for record in records]
    return {"slug": slug, "verses": data}


@app.get("/graph")
def get_graph_data():
    # FIX: removed :RELATES - now matches all relationship types
    query = """
    MATCH (s:Entity)-[r]->(t:Entity)
    RETURN 
        s.slug AS s_slug, s.name_ar AS s_name, s.name_en AS s_name_en, s.entity_type AS s_type,
        t.slug AS t_slug, t.name_ar AS t_name, t.name_en AS t_name_en, t.entity_type AS t_type,
        r.relation_label_ar AS label,
        r.evidence_notes AS evidence_notes
    LIMIT 2000
    """
    with driver.session() as session:
        records = session.run(query)
        nodes = {}
        links = []
        for rec in records:
            if rec["s_slug"] not in nodes:
                nodes[rec["s_slug"]] = {
                    "id": rec["s_slug"], "label": rec["s_name"],
                    "name_en": rec["s_name_en"], "type": rec["s_type"],
                    "x": None, "y": None
                }
            if rec["t_slug"] not in nodes:
                nodes[rec["t_slug"]] = {
                    "id": rec["t_slug"], "label": rec["t_name"],
                    "name_en": rec["t_name_en"], "type": rec["t_type"],
                    "x": None, "y": None
                }
            links.append({
                "source": rec["s_slug"],
                "target": rec["t_slug"],
                "label": rec["label"] or "",
                "evidence_notes": rec["evidence_notes"] or ""
            })
        return {"nodes": list(nodes.values()), "links": links}


@app.get("/topics/entity/{slug}")
def get_topics_for_entity(slug: str):
    conn = get_pg_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT st.surah_number, st.surah_name_ar, ss.subtopic_order,
               ss.subtopic_title_ar, se.occurrence_count
        FROM subtopic_entities se
        JOIN surah_subtopics ss ON ss.id = se.subtopic_id
        JOIN surah_topics st ON st.id = ss.surah_topic_id
        JOIN entities e ON e.id = se.entity_id
        WHERE e.slug = %s
        ORDER BY se.occurrence_count DESC, st.surah_number, ss.subtopic_order
    """, (slug,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"slug": slug, "items": [
        {"surah_number": r[0], "surah_name_ar": r[1], "subtopic_order": r[2],
         "subtopic_title_ar": r[3], "occurrence_count": r[4]} for r in rows
    ]}


@app.get("/topics/{subtopic_id}/verses")
def get_subtopic_verses(subtopic_id: int):
    conn = get_pg_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT v.ayah_key, v.text_uthmani, v.text_simple
        FROM surah_subtopic_verses ssv
        JOIN verses v ON v.id = ssv.verse_id
        WHERE ssv.subtopic_id = %s
        ORDER BY v.surah_id, v.ayah_number
    """, (subtopic_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"subtopic_id": subtopic_id, "verses": [
        {"ayah_key": r[0], "text_uthmani": r[1], "text_simple": r[2]} for r in rows
    ]}


@app.get("/verses/by-keys-full")
def get_verses_by_keys_full(keys: str = Query(...)):
    key_list = [k.strip() for k in keys.split(",") if k.strip()]
    if not key_list:
        return {"verses": []}

    conn = get_pg_conn()
    cur = conn.cursor()
    placeholders = ",".join(["%s"] * len(key_list))
    cur.execute(f"""
        SELECT v.ayah_key, v.text_uthmani, v.text_simple, s.name_ar AS surah_name
        FROM verses v
        JOIN surahs s ON s.surah_number = v.surah_id
        WHERE v.ayah_key IN ({placeholders})
        ORDER BY v.surah_id, v.ayah_number
    """, key_list)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"verses": [
        {"ayah_key": r[0], "text_uthmani": r[1], "text_simple": r[2], "surah_name": r[3]} for r in rows
    ]}
