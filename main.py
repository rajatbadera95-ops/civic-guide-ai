import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Google Gemini
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("WARNING: GEMINI_API_KEY is not set in environment variables.")
else:
    genai.configure(api_key=gemini_api_key)

app = FastAPI(title="Election Education Assistant API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Data Model (now accepts an optional language field)
class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "English"

# Base System Prompt (language injected dynamically per request)
BASE_SYSTEM_PROMPT = """You are CivicBot, an objective and neutral election education assistant.
Your goal is to educate the user on the electoral process, voter registration, and civic rights.

Rules:
1. NEVER express any political bias, opinion, or endorse any candidate or party.
2. If asked a subjective or politically charged question, politely decline to answer and redirect the conversation to factual election education.
3. Be concise, simple, and encouraging. Use bullet points if necessary.
4. If asked about voting logistics, focus on standard protocols (like ID requirements).
5. If the user asks about their eligibility, ask them follow-up questions: Are you 18+? Are you an Indian citizen? Are you listed on the electoral rolls? Based on answers, tell them if they are eligible.
6. CRITICAL: You MUST respond entirely in the language specified below. Translate your entire reply into that language. Do NOT mix languages.

Response Language: {language}
"""

# Civic context loaded from data.json
civic_context = "{}"

def load_context():
    global civic_context
    try:
        with open("data.json", "r") as f:
            civic_context = f.read()
    except FileNotFoundError:
        pass

load_context()

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured on server.")

    language = request.language or "English"

    try:
        # Build the language-aware system prompt
        system_prompt = BASE_SYSTEM_PROMPT.format(language=language)

        # Using gemini-2.0-flash for high free-tier quota (1500 req/day)
        model = genai.GenerativeModel('gemini-2.0-flash')

        # Combine the system prompt, static data, and user's message
        full_prompt = (
            f"{system_prompt}\n\n"
            f"Additional Static Civic Context:\n{civic_context}\n\n"
            f"User Question: {request.message}\n\n"
            f"Assistant Response (in {language}):"
        )

        response = model.generate_content(full_prompt)

        return {"reply": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Election Education Assistant API is running."}
