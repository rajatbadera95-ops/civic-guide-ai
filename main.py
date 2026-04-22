import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Data Model
class ChatRequest(BaseModel):
    message: str

# Define the System Prompt
SYSTEM_PROMPT = """You are CivicBot, an objective and neutral election education assistant.
Your goal is to educate the user on the electoral process, voter registration, and civic rights.
Rules:
1. NEVER express any political bias, opinion, or endorse any candidate or party.
2. If asked a subjective or politically charged question, politely decline to answer and redirect the conversation to factual election education.
3. Be concise, simple, and encouraging. Use bullet points if necessary.
4. If asked about voting logistics, focus on standard protocols (like ID requirements).
"""

# Context variable (to be loaded from data.json in Phase 3)
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
    
    try:
        # We use gemini-pro for text generation
        model = genai.GenerativeModel('gemini-pro')
        
        # Combine the system prompt, any static data, and the user's message
        full_prompt = f"{SYSTEM_PROMPT}\n\nAdditional Static Context:\n{civic_context}\n\nUser Question: {request.message}\n\nAssistant Response:"
        
        response = model.generate_content(full_prompt)
        
        return {"reply": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Election Education Assistant API is running."}
