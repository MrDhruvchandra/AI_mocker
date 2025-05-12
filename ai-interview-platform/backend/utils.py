import os
from langchain_google_genai import GoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

def get_gemini_llm():
    return GoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.9,
        max_tokens=2048
    )
