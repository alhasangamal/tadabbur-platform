import xml.etree.ElementTree as ET
import csv
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR.parent

BASE = DATA_DIR / "raw" / "tanzil"
OUT  = DATA_DIR / "curated"
OUT.mkdir(parents=True, exist_ok=True)

UTHMANI_FILE = BASE / "quran-uthmani.xml"
SIMPLE_FILE = BASE / "quran-simple.xml"

def parse_quran_xml(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()

    data = {}
    for surah in root.findall("sura"):
        surah_no = int(surah.attrib["index"])
        surah_name = surah.attrib.get("name", "")
        verses = {}

        for aya in surah.findall("aya"):
            ayah_no = int(aya.attrib["index"])
            text = aya.attrib.get("text", "")
            verses[ayah_no] = text

        data[surah_no] = {
            "surah_name": surah_name,
            "verses": verses
        }

    return data

uthmani_data = parse_quran_xml(UTHMANI_FILE)
simple_data = parse_quran_xml(SIMPLE_FILE)

# surahs.csv
with open(OUT / "surahs.csv", "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerow(["surah_number", "name_ar", "verses_count"])
    for surah_no in sorted(uthmani_data.keys()):
        surah_name = uthmani_data[surah_no]["surah_name"]
        verses_count = len(uthmani_data[surah_no]["verses"])
        writer.writerow([surah_no, surah_name, verses_count])

# verses.csv
with open(OUT / "verses.csv", "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerow([
        "surah_number",
        "ayah_number",
        "ayah_key",
        "text_uthmani",
        "text_simple"
    ])

    for surah_no in sorted(uthmani_data.keys()):
        uthmani_verses = uthmani_data[surah_no]["verses"]
        simple_verses = simple_data.get(surah_no, {}).get("verses", {})

        for ayah_no in sorted(uthmani_verses.keys()):
            writer.writerow([
                surah_no,
                ayah_no,
                f"{surah_no}:{ayah_no}",
                uthmani_verses.get(ayah_no, ""),
                simple_verses.get(ayah_no, "")
            ])

print("Done: surahs.csv and verses.csv created.")