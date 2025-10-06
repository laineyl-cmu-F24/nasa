from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import requests
from dotenv import load_dotenv
from pathlib import Path
from fastapi.responses import FileResponse
from starlette.staticfiles import StaticFiles

load_dotenv()

app = FastAPI()

# CORS setup (reads from env, falls back to permissive in dev)
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
allow_all = allowed_origins == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else allowed_origins,
    allow_credentials=False if allow_all else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve built frontend (Vite) if available
REPO_ROOT = Path(__file__).resolve().parents[2]
DIST_DIR = REPO_ROOT / "dist"
INDEX_FILE = DIST_DIR / "index.html"

if INDEX_FILE.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")

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

class ResearchGapRequest(BaseModel):
    publications: list[dict]
    rule_based_gaps: list[str]

class ResearchGapResponse(BaseModel):
    semantic_analysis: str
    key_insights: list[str]
    future_directions: list[str]
    priority_areas: list[str]

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

@app.post("/api/analyze-gaps", response_model=ResearchGapResponse)
async def analyze_research_gaps(req: ResearchGapRequest):
    if not req.publications or len(req.publications) == 0:
        raise HTTPException(status_code=400, detail="No publications provided")
    
    # Prepare summary of publications for AI analysis
    pub_summary = []
    for i, pub in enumerate(req.publications[:100]):  # Limit to avoid token overflow
        title = pub.get('title', 'Untitled')
        organism = pub.get('organism', 'Unknown')
        year = pub.get('year', 'N/A')
        outcome = pub.get('outcome', 'N/A')
        pub_summary.append(f"- [{year}] {organism}: {title[:80]} → {outcome[:60]}")
    
    pub_text = "\n".join(pub_summary[:50])  # Limit to 50 publications
    gaps_text = "\n".join(req.rule_based_gaps) if req.rule_based_gaps else "No rule-based gaps detected"
    
    prompt = f"""You are an expert NASA space biology research analyst. Analyze the following research corpus and identified gaps to provide deep insights.

**Rule-Based Gaps Detected:**
{gaps_text}

**Sample Publications from Corpus (showing {len(pub_summary)} out of {len(req.publications)} total):**
{pub_text}

Your task: Provide a comprehensive research gap analysis in JSON format with these sections:

1. **semantic_analysis** — A 2-3 sentence high-level interpretation of the research landscape and what the patterns reveal about NASA's space biology research priorities and blind spots.

2. **key_insights** — 4-5 specific, actionable insights about research gaps, underexplored organisms, missing experimental conditions, or temporal patterns. Each insight should be 1-2 sentences.

3. **future_directions** — 4-5 concrete suggestions for future research directions based on the gaps identified. Include specific organisms, experimental approaches, or research questions.

4. **priority_areas** — 3-4 high-priority research areas that would have the most scientific impact if pursued, with brief justification.

Return ONLY valid JSON:
{{
  "semantic_analysis": "<string>",
  "key_insights": [<strings>],
  "future_directions": [<strings>],
  "priority_areas": [<strings>]
}}

IMPORTANT: Do NOT use markdown formatting (**, __, etc.) in your response strings. Use plain text only.
Be specific, scientific, and actionable. Focus on space biology context."""
    
    try:
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        response = requests.post(GEMINI_API_URL, json=payload, timeout=40)
        response.raise_for_status()
        
        result = response.json()
        result_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        print(f"[DEBUG] Research Gap Analysis Response:\n{result_text}\n")
        
        # Parse JSON from response
        if result_text.startswith("```"):
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
        return ResearchGapResponse(
            semantic_analysis=parsed.get("semantic_analysis", ""),
            key_insights=parsed.get("key_insights", [])[:5],
            future_directions=parsed.get("future_directions", [])[:5],
            priority_areas=parsed.get("priority_areas", [])[:4]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gap analysis failed: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

