import xml.etree.ElementTree as ET
import psycopg2
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR.parent
META_FILE = DATA_DIR / "raw" / "tanzil" / "quran-data.xml"

conn = psycopg2.connect(
    host="localhost",
    dbname="TadabburData",
    user="postgres",
    password="123456"
)
cur = conn.cursor()

tree = ET.parse(META_FILE)
root = tree.getroot()

# --------------------------------
# Helpers
# --------------------------------
def to_int(value):
    try:
        return int(value)
    except:
        return None

def normalize_revelation_type(value):
    if not value:
        return None
    value = value.strip().lower()
    if value in ("meccan", "mekkan", "makki", "makki"):
        return "Makki"
    if value in ("medinan", "madinan", "madani", "madinan"):
        return "Madani"
    return value

# --------------------------------
# 1) Update surahs
# --------------------------------
for sura in root.findall(".//sura"):
    surah_number = to_int(sura.attrib.get("index"))
    name_ar = sura.attrib.get("name")
    name_en = sura.attrib.get("ename")
    transliteration_en = sura.attrib.get("tname")
    revelation_type = normalize_revelation_type(sura.attrib.get("type"))

    # بعض نسخ الميتاداتا قد تستخدم حقولًا مختلفة لترتيب النزول
    revelation_order = (
        to_int(sura.attrib.get("order")) or
        to_int(sura.attrib.get("revelation_order"))
    )

    cur.execute("""
        UPDATE surahs
        SET
            name_ar = COALESCE(%s, name_ar),
            name_en = %s,
            transliteration_en = %s,
            revelation_type = %s,
            revelation_order = %s
        WHERE surah_number = %s
    """, (
        name_ar,
        name_en,
        transliteration_en,
        revelation_type,
        revelation_order,
        surah_number
    ))

# --------------------------------
# 2) Update partitioning info
# --------------------------------
# لأن quran-data.xml يحتوي على partitioning مثل juz/hizb/page وغيرها
# سنحاول التقاطها سواء كانت بعناصر <juz>/<hizb>/<page> أو ببنية مشابهة.

def update_verse_field(ayah_key, field_name, field_value):
    cur.execute(
        f"UPDATE verses SET {field_name} = %s WHERE ayah_key = %s",
        (field_value, ayah_key)
    )

# page
for item in root.findall(".//page"):
    page_no = to_int(item.attrib.get("index"))
    sura = to_int(item.attrib.get("sura"))
    aya = to_int(item.attrib.get("aya"))
    if sura and aya and page_no:
        update_verse_field(f"{sura}:{aya}", "page_number", page_no)

# juz
for item in root.findall(".//juz"):
    juz_no = to_int(item.attrib.get("index"))
    sura = to_int(item.attrib.get("sura"))
    aya = to_int(item.attrib.get("aya"))
    if sura and aya and juz_no:
        update_verse_field(f"{sura}:{aya}", "juz_number", juz_no)

# hizb
for item in root.findall(".//hizb"):
    hizb_no = to_int(item.attrib.get("index"))
    sura = to_int(item.attrib.get("sura"))
    aya = to_int(item.attrib.get("aya"))
    if sura and aya and hizb_no:
        update_verse_field(f"{sura}:{aya}", "hizb_number", hizb_no)

# hizb quarters => rub_number
# metadata page تذكر "hizb quarters" ضمن بيانات التقسيم
for item in root.findall(".//quarter"):
    rub_no = to_int(item.attrib.get("index"))
    sura = to_int(item.attrib.get("sura"))
    aya = to_int(item.attrib.get("aya"))
    if sura and aya and rub_no:
        update_verse_field(f"{sura}:{aya}", "rub_number", rub_no)

# manzil
for item in root.findall(".//manzil"):
    manzil_no = to_int(item.attrib.get("index"))
    sura = to_int(item.attrib.get("sura"))
    aya = to_int(item.attrib.get("aya"))
    if sura and aya and manzil_no:
        update_verse_field(f"{sura}:{aya}", "manzil_number", manzil_no)

# ruku
for item in root.findall(".//ruku"):
    ruku_no = to_int(item.attrib.get("index"))
    sura = to_int(item.attrib.get("sura"))
    aya = to_int(item.attrib.get("aya"))
    if sura and aya and ruku_no:
        update_verse_field(f"{sura}:{aya}", "ruku_number", ruku_no)

# sajda
for item in root.findall(".//sajda"):
    sura = to_int(item.attrib.get("sura"))
    aya = to_int(item.attrib.get("aya"))
    if sura and aya:
        cur.execute("""
            UPDATE verses
            SET sajdah_flag = TRUE
            WHERE ayah_key = %s
        """, (f"{sura}:{aya}",))

conn.commit()
cur.close()
conn.close()

print("Metadata update completed.")