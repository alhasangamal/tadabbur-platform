import requests
import os
from ai.prompts import SYSTEM_PROMPT
from ai.search_engine import search_quran_sources
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def ask_quran_ai(question: str):
    sources = search_quran_sources(question)

    if not sources:
        return {
            "answer": "عذراً، لم أجد نتائج مباشرة في الداتا الحالية حول هذا السؤال. حاول البحث بكلمات مختلفة أو اسأل عن سورة أو قصة محددة لضمان الدقة.",
            "sources": []
        }

    context = ""
    for item in sources:
        if item["type"] == "verse":
            context += f"""
[آية]
السورة: {item['surah_name']} ({item['surah_number']})
رقم الآية: {item['ayah_number']}
النص: {item['ayah_text']}
التفسير: {item['tafsir_text']}
---
"""
        elif item["type"] == "story":
            context += f"""
[قصة]
العنوان: {item['title']}
ملخص: {item['summary']}
تفاصيل: {item['details']}
---
"""

    full_prompt = f"{SYSTEM_PROMPT}\n\nالسؤال:\n{question}\n\nالمصادر المتاحة:\n{context}\n\nأجب بدقة بالغة بناءً على المصادر السابقة فقط:"

    # Try Gemini first for online deployment and high accuracy
    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(full_prompt)
            answer = response.text
            return {
                "answer": answer,
                "sources": sources
            }
        except Exception as e:
            print(f"Gemini error: {e}")
            # Fallback to Ollama if Gemini fails
    
    # Fallback/Local Engine (Ollama)
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen2.5",
                "prompt": full_prompt,
                "stream": False
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        answer = data.get("response", "")
    except Exception as e:
        print(f"Ollama error: {e}")
        answer = "عذراً، حدث خطأ أثناء التواصل مع محرك الذكاء الاصطناعي. تأكد من إعداد مفتاح API الخاص بـ Gemini أو تشغيل Ollama محلياً."

    return {
        "answer": answer,
        "sources": sources
    }