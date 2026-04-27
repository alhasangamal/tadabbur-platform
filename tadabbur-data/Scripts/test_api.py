import requests

def test_api():
    try:
        resp = requests.post("http://127.0.0.1:8000/ai/ask", json={"question": "ما هي قصة النبي يوسف؟"})
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()['answer'][:200]}...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
