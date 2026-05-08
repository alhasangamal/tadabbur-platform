import json
import psycopg2
from pathlib import Path

DB_CONFIG = {
    "host": "localhost",
    "dbname": "TadabburData",
    "user": "postgres",
    "password": "123456"
}

ENTITY_TYPE_MAP = {
    "GOD": "concept",
    "PROPHET": "prophet",
    "PERSON": "person",
    "ANGEL": "angel",
    "JINN": "jinn",
    "NATION": "nation",
    "GROUP": "group",
    "BOOK": "book",
    "PLACE": "place",
    "EVENT": "event",
    "OBJECT": "object",
    "CONCEPT": "concept",
    "CREATURE": "creature",
    "ELEMENT": "element",
    "STRUCTURE": "structure",
    "DURATION": "duration",
    "ALIAS": "alias"
}

def normalize_slug(s):
    return s.lower().replace(" ", "_")

def import_entities(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    inserted = 0

    for node in data["nodes"]:
        slug = normalize_slug(node["id"])
        name_ar = node.get("name_ar")
        name_en = node.get("name_en")
        entity_type_raw = node.get("type")

        entity_type = ENTITY_TYPE_MAP.get(entity_type_raw, "other")

        cur.execute("""
            INSERT INTO entities (entity_type, slug, name_ar, name_en, source_name, review_status)
            VALUES (%s, %s, %s, %s, 'quran_graph', 'approved')
            ON CONFLICT (slug) DO NOTHING
        """, (entity_type, slug, name_ar, name_en))

        inserted += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"Entities inserted: {inserted}")
def import_relations(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    inserted = 0

    for edge in data.get("links", []):
        source_slug = normalize_slug(edge["source"])
        target_slug = normalize_slug(edge["target"])

        # الأهم هنا
        relation_type = edge.get("rel_en") or "RELATED_TO"
        source_basis = edge.get("rel_ar")
        evidence_notes = edge.get("verses")

        cur.execute("SELECT id FROM entities WHERE slug=%s", (source_slug,))
        source = cur.fetchone()

        cur.execute("SELECT id FROM entities WHERE slug=%s", (target_slug,))
        target = cur.fetchone()

        if not source or not target:
            continue

        cur.execute("""
            INSERT INTO entity_relations (
                source_entity_id,
                target_entity_id,
                relation_type,
                source_basis,
                evidence_notes
            )
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            source[0],
            target[0],
            relation_type,
            source_basis,
            evidence_notes
        ))

        inserted += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"Relations inserted: {inserted}")
if __name__ == "__main__":
    SCRIPT_DIR = Path(__file__).resolve().parent
    DATA_DIR = SCRIPT_DIR.parent
    JSON_PATH = DATA_DIR / "raw" / "quran_graph_data.json"
    # import_entities(JSON_PATH)
    import_relations(JSON_PATH)