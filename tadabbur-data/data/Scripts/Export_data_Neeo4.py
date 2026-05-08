import csv
import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "dbname": "TadabburData",
    "user": "postgres",
    "password": "123456"
}

def export_graph():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # entities -> nodes.csv
    cur.execute("""
        SELECT id, slug, name_ar, name_en, entity_type
        FROM entities
        ORDER BY id
    """)
    with open("nodes.csv", "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["entity_id", "slug", "name_ar", "name_en", "entity_type"])
        writer.writerows(cur.fetchall())

    # entity relations -> edges.csv
    cur.execute("""
        SELECT
            id,
            source_entity_id,
            target_entity_id,
            relation_type,
            relation_label_ar,
            source_basis,
            evidence_notes
        FROM entity_relations
        ORDER BY id
    """)

    with open("edges.csv", "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow([
            "relation_id",
            "source_entity_id",
            "target_entity_id",
            "relation_type",
            "relation_label_ar",
            "source_basis",
            "evidence_notes"
        ])
        writer.writerows(cur.fetchall())

    # verse links -> verse_links.csv
    cur.execute("""
        SELECT ve.verse_id, v.ayah_key, ve.entity_id, ve.mention_text, ve.mention_type, ve.confidence_score
        FROM verse_entities ve
        JOIN verses v ON v.id = ve.verse_id
        WHERE COALESCE(ve.is_valid, TRUE) = TRUE
        ORDER BY ve.id
    """)
    with open("verse_links.csv", "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["verse_id", "ayah_key", "entity_id", "mention_text", "mention_type", "confidence_score"])
        writer.writerows(cur.fetchall())

    cur.close()
    conn.close()
    print("Export completed: nodes.csv, edges.csv, verse_links.csv")

if __name__ == "__main__":
    export_graph()