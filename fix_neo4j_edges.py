import csv
from neo4j import GraphDatabase

aura = GraphDatabase.driver(
    "neo4j+ssc://944adc2b.databases.neo4j.io",
    auth=("944adc2b", "5NDDvrh3QD-1_MrO7fKXmxOvsjkTW_FNKZ9arMZjIXs")
)

# امسح الـ relationships القديمة الغلط أولاً
print("جاري مسح الـ relationships القديمة...")
with aura.session() as s:
    s.run("MATCH ()-[r]->() WHERE NOT type(r) = 'MENTIONS' DELETE r")
print("✅ اتمسحوا!")

# ارفع من جديد بـ RELATES
print("جاري رفع الـ edges...")
with open("tadabbur-data/data/raw/edges.csv", encoding="utf-8-sig") as f:
    edges = list(csv.DictReader(f))
print(f"عدد الـ edges: {len(edges)}")

with aura.session() as s:
    for edge in edges:
        s.run("""
            MATCH (src:Entity {entity_id: $source_id})
            MATCH (tgt:Entity {entity_id: $target_id})
            MERGE (src)-[r:RELATES {relation_id: $relation_id}]->(tgt)
            SET r.relation_type = $relation_type,
                r.relation_label_ar = $relation_label_ar,
                r.source_basis = $source_basis,
                r.evidence_notes = $evidence_notes
        """,
        source_id=int(edge['source_entity_id']),
        target_id=int(edge['target_entity_id']),
        relation_id=int(edge['relation_id']),
        relation_type=edge['relation_type'],
        relation_label_ar=edge['relation_label_ar'],
        source_basis=edge['source_basis'],
        evidence_notes=edge['evidence_notes'])

print("✅ Edges اتنقلوا بـ RELATES!")
aura.close()
print("🎉 خلص!")