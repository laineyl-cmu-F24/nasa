from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS setup for local dev (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")

# Use REST API directly to avoid SDK version issues
# Use gemini-2.5-flash (latest available model for your key)
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

class SummarizeRequest(BaseModel):
    text: str
    max_bullets: int = 3

class SummarizeResponse(BaseModel):
    tldr: str
    objectives: list[str]
    science: list[str]
    timeline: list[str]
    keywords: list[str]

@app.post("/api/summarize", response_model=SummarizeResponse)
async def summarize_text(req: SummarizeRequest):
    if not req.text or len(req.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Text too short to summarize")
    
    prompt = f"""You are a scientific policy and mission document summarizer specializing in NASA and space exploration reports.

Your task: summarize the following NASA policy or vision document text into a **clear, concise, and structured JSON summary**.

Follow this structure:

1. **TL;DR** — One-sentence summary (≤180 characters) capturing the overall vision or main goal.
2. **Mission Objectives** — {req.max_bullets} concise bullet points (≤140 characters each) describing what NASA plans to do or achieve.
3. **Scientific Focus** — 3–5 short bullets explaining the main scientific themes (e.g., lunar missions, Mars research, technology development).
4. **Timeline Highlights** — 3–4 key time milestones with short descriptions (e.g., "2008: Robotic lunar orbiter launch").
5. **Keywords** — 6 key terms relevant to space science or mission focus.

Return ONLY a valid JSON object with these keys:
{{
  "tldr": <string>,
  "objectives": [<strings>],
  "science": [<strings>],
  "timeline": [<strings>],
  "keywords": [<strings>]
}}

Do NOT include extra explanations or markdown. Focus on clarity and brevity.
Text to summarize:
{req.text[:8000]}
"""
    
    try:
        # Call Gemini REST API
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        result_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        # Log the raw AI response for debugging
        print(f"[DEBUG] Raw AI response:\n{result_text}\n")
        
        # Try to parse JSON from markdown code block or raw
        if result_text.startswith("```"):
            # Extract JSON from markdown code block
            lines = result_text.split('\n')
            json_lines = []
            in_block = False
            for line in lines:
                if line.strip().startswith("```"):
                    in_block = not in_block
                    continue
                if in_block:
                    json_lines.append(line)
            result_text = '\n'.join(json_lines)
        
        parsed = json.loads(result_text)
        return SummarizeResponse(
            tldr=parsed.get("tldr", ""),
            objectives=parsed.get("objectives", [])[:req.max_bullets],
            science=parsed.get("science", [])[:5],
            timeline=parsed.get("timeline", [])[:4],
            keywords=parsed.get("keywords", [])[:6]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

