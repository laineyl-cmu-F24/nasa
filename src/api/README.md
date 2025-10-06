# API Backend Setup

## Quick Start

1. **Install Python dependencies:**
   ```bash
   cd src/api
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   # Copy template
   cp ../../.env.example ../../.env
   
   # Edit .env and add your Gemini API key
   # GEMINI_API_KEY=your_actual_key_here
   ```

3. **Run the server:**
   ```bash
   python summarize.py
   ```
   
   Server will start at `http://localhost:8000`

4. **Test the endpoint:**
   ```bash
   curl http://localhost:8000/health
   ```

## API Endpoints

### POST /api/summarize
Generates AI-powered summary of uploaded text.

**Request:**
```json
{
  "text": "Your paper text here...",
  "max_bullets": 3
}
```

**Response:**
```json
{
  "tldr": "One-sentence summary",
  "bullets": ["Point 1", "Point 2", "Point 3"],
  "keywords": ["keyword1", "keyword2", ...]
}
```

### GET /health
Health check endpoint.

## Development Notes

- CORS is configured for `localhost:5173` (Vite default)
- Text is truncated to 8000 chars before sending to Gemini
- Fallback to local summarizer if API fails

