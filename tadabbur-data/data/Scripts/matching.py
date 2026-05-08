import json
import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "dbname": "TadabburData",
    "user": "postgres",
    "password": "123456"
}

def normalize_slug(s):
    return s.lower().replace(" ", "_").replace("-", "_")

def import_relations(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    inserted = 0

    for edge in data.get("edges", []):
        source_slug = normalize_slug(edge["source"])
        target_slug = normalize_slug(edge["target"])

        relation_type = edge.get("rel_en") or "RELATED_TO"
        relation_label_ar = edge.get("rel_ar")
        evidence_notes = json.dumps(edge.get("verses", []), ensure_ascii=False) if edge.get("verses") else None

        cur.execute("SELECT id FROM entities WHERE slug = %s", (source_slug,))
        source = cur.fetchone()

        cur.execute("SELECT id FROM entities WHERE slug = %s", (target_slug,))
        target = cur.fetchone()

        if not source or not target:
            continue

        cur.execute("""
            INSERT INTO entity_relations (
                source_entity_id,
                target_entity_id,
                relation_type,
                relation_label_ar,
                source_basis,
                evidence_notes,
                directionality
            )
            VALUES (%s, %s, %s, %s, %s, %s, 'directed')
        """, (
            source[0],
            target[0],
            relation_type,
            relation_label_ar,
            'quran_graph',
            evidence_notes
        ))

        inserted += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"Inserted relations: {inserted}")