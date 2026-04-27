import csv
# الجديد - مع تجاهل SSL
from neo4j import GraphDatabase, TrustAll

aura = GraphDatabase.driver(
    "neo4j+ssc://944adc2b.databases.neo4j.io",
    auth=("944adc2b", "5NDDvrh3QD-1_MrO7fKXmxOvsjkTW_FNKZ9arMZjIXs")
)
# 1. رفع الـ Nodes
print("جاري رفع الـ nodes...")
with open("tadabbur-data/data/raw/nodes.csv", encoding="utf-8-sig") as f:
    nodes = list(csv.DictReader(f))
print(f"عدد الـ nodes: {len(nodes)}")

with aura.session() as s:
    for node in nodes:
        s.run("""
            CREATE (n:Entity {
                entity_id: $entity_id,
                slug: $slug,
                name_ar: $name_ar,
                name_en: $name_en,
                entity_type: $entity_type
            })
        """, **node)
print("✅ Nodes اتنقلوا!")

# 2. رفع الـ Edges
print("جاري رفع الـ edges...")
with open("tadabbur-data/data/raw/edges.csv", encoding="utf-8-sig") as f:
    edges = list(csv.DictReader(f))
print(f"عدد الـ edges: {len(edges)}")

with aura.session() as s:
    for edge in edges:
        s.run(f"""
            MATCH (a:Entity {{entity_id: $source}}), (b:Entity {{entity_id: $target}})
            CREATE (a)-[r:{edge['relation_type']} {{
                relation_id: $relation_id,
                relation_label_ar: $relation_label_ar,
                source_basis: $source_basis,
                evidence_notes: $evidence_notes
            }}]->(b)
        """,
        source=edge['source_entity_id'],
        target=edge['target_entity_id'],
        relation_id=edge['relation_id'],
        relation_label_ar=edge['relation_label_ar'],
        source_basis=edge['source_basis'],
        evidence_notes=edge['evidence_notes'])
print("✅ Edges اتنقلوا!")

# 3. رفع الـ Verse Links
print("جاري رفع الـ verse_links...")
with open("tadabbur-data/data/raw/verse_links.csv", encoding="utf-8-sig") as f:
    links = list(csv.DictReader(f))
print(f"عدد الـ verse_links: {len(links)}")

with aura.session() as s:
    for link in links:
        s.run("""
            MATCH (e:Entity {entity_id: $entity_id})
            MERGE (v:Verse {ayah_key: $ayah_key})
            CREATE (v)-[r:MENTIONS {
                verse_id: $verse_id,
                mention_text: $mention_text,
                mention_type: $mention_type,
                confidence_score: $confidence_score
            }]->(e)
        """,
        entity_id=link['entity_id'],
        ayah_key=link['ayah_key'],
        verse_id=link['verse_id'],
        mention_text=link['mention_text'],
        mention_type=link['mention_type'],
        confidence_score=link['confidence_score'])
print("✅ Verse Links اتنقلوا!")

# Index عشان الـ queries تكون سريعة
with aura.session() as s:
    s.run("CREATE INDEX entity_id IF NOT EXISTS FOR (n:Entity) ON (n.entity_id)")
    s.run("CREATE INDEX ayah_key IF NOT EXISTS FOR (v:Verse) ON (v.ayah_key)")
print("✅ Indexes اتعملوا!")

aura.close()
print("🎉 النقل اكتمل!")