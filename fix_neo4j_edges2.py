import csv
from neo4j import GraphDatabase

aura = GraphDatabase.driver(
    "neo4j+ssc://944adc2b.databases.neo4j.io",
    auth=("944adc2b", "5NDDvrh3QD-1_MrO7fKXmxOvsjkTW_FNKZ9arMZjIXs")
)

print("جاري رفع الـ edges...")
with open("tadabbur-data/data/raw/edges.csv", encoding="utf-8-sig") as f:
    edges = list(csv.DictReader(f))
print(f"عدد الـ edges: {len(edges)}")

ok = 0
fail = 0
with aura.session() as s:
    for edge in edges:
        result = s.run("""
            MATCH (src:Entity {entity_id: $source_id})
            MATCH (tgt:Entity {entity_id: $target_id})
            CREATE (src)-[r:RELATES]->(tgt)
            SET r.relation_id = $relation_id,
                r.relation_type = $relation_type,
                r.relation_label_ar = $relation_label_ar,
                r.source_basis = $source_basis,
                r.evidence_notes = $evidence_notes
            RETURN r
        """,
        source_id=edge['source_entity_id'],
        target_id=edge['target_entity_id'],
        relation_id=edge['relation_id'],
        relation_type=edge['relation_type'],
        relation_label_ar=edge['relation_label_ar'],
        source_basis=edge['source_basis'],
        evidence_notes=edge['evidence_notes'])
        
        if result.single():
            ok += 1
        else:
            fail += 1
            print(f"❌ فشل: {edge['source_entity_id']} -> {edge['target_entity_id']}")

print(f"✅ نجح: {ok}")
print(f"❌ فشل: {fail}")
aura.close()