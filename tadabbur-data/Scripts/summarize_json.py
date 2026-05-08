import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

path = r'c:\Users\ALHASSANGAMAL\Desktop\tadabbur-platform\tadabbur-data\data\Scripts'
files = [f for f in os.listdir(path) if f.endswith('.json')]

for f in files:
    try:
        with open(os.path.join(path, f), 'r', encoding='utf-8') as file:
            data = json.load(file)
            print(f"File: {f}")
            if isinstance(data, list) and len(data) > 0:
                print(f"  Type: List, Length: {len(data)}")
                print(f"  Sample Keys: {list(data[0].keys())}")
            elif isinstance(data, dict):
                print(f"  Type: Dict, Keys: {list(data.keys())[:10]}")
            print("-" * 20)
    except Exception as e:
        print(f"Error reading {f}: {e}")
