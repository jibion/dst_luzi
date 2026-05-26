# DST Luzi

A PWA that helps Spanish-speaking parents understand their children's German homework at the Deutsche Schule Tenerife. Parents take a photo or upload a PDF of a homework sheet and receive a clear explanation in Spanish — including vocabulary, sentence translations, and step-by-step guidance for supporting their child — powered by Gemini 2.5 Flash.

## Prerequisites

- Python 3.11+
- A [Gemini API key](https://aistudio.google.com/app/apikey)

## Local setup

```bash
git clone <repo-url>
cd dst_luzi

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env and set your GEMINI_API_KEY

uvicorn main:app --reload
```

Open http://localhost:8000 in your browser.

## Deploy to Railway

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. In the Railway dashboard, go to **Variables** and add:
   ```
   GEMINI_API_KEY=your_key_here
   ```
4. Railway detects Python automatically via `requirements.txt` and uses the `Procfile` to start the server.
5. Railway provides a public HTTPS URL — share it with your test group.

## Stack

- **Backend:** FastAPI, served via Uvicorn
- **Frontend:** Vanilla React (CDN + Babel standalone, no build step)
- **AI:** Google Gemini 2.5 Flash via `google-generativeai`
- **PWA:** Web manifest + service worker for installability on mobile
