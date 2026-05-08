import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# Add the directory containing 'ai' to path
ai_model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "AI Model"))
sys.path.append(ai_model_path)

from ai.search_engine import search_quran_sources

def test_search():
    queries = ["الصبر", "قصة يوسف", "دعاء"]
    for q in queries:
        print(f"\nQuery: {q}")
        results = search_quran_sources(q)
        print(f"Found {len(results)} results")
        for r in results:
            title = r.get('surah_name', r.get('title', 'Unknown'))
            print(f" - [{r['type']}] {title}")

if __name__ == "__main__":
    test_search()
