import os
import io
import json
import re
import time
import logging
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from PIL import Image

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY no encontrada en el entorno. "
        "Crea un archivo .env con: GEMINI_API_KEY=tu_clave"
    )

genai.configure(api_key=GEMINI_API_KEY)

# ── Debug logger ──────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("luzi")

SEP  = "─" * 60
SEP2 = "═" * 60

def _kb(b: int) -> str:
    return f"{b/1024:.1f} KB" if b < 1_000_000 else f"{b/1_000_000:.2f} MB"

def _indent(text: str, prefix: str = "    ") -> str:
    return "\n".join(prefix + line for line in text.splitlines())

def dbg_request(filename, orig_bytes, comp_bytes, w, h, child_name, child_age, parent_level, prompt):
    ratio = (1 - comp_bytes / orig_bytes) * 100 if orig_bytes else 0
    log.info(
        f"\n{SEP2}\n"
        f"  ▶  ANALYZE REQUEST  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"{SEP}\n"
        f"  File      : {filename}\n"
        f"  Original  : {_kb(orig_bytes)}\n"
        f"  Compressed: {_kb(comp_bytes)}  ({w}×{h}px, -{ratio:.0f}%)\n"
        f"  Child     : {child_name or '(sin nombre)'}, {child_age} años\n"
        f"  Level     : {parent_level}\n"
        f"  Prompt    : {len(prompt):,} chars\n"
        f"{SEP}\n"
        f"  ── FULL PROMPT ──\n"
        f"{_indent(prompt)}\n"
        f"{SEP}"
    )

def dbg_response(elapsed, raw_text, result, usage):
    tok_in       = getattr(usage, "prompt_token_count", "?")
    tok_out      = getattr(usage, "candidates_token_count", "?")
    tok_tot      = getattr(usage, "total_token_count", "?")
    tok_thinking = getattr(usage, "thoughts_token_count", None)
    thinking_str = f"  thinking={tok_thinking}" if tok_thinking else ""
    title     = result.get("title", "—")
    exercises = result.get("exercises", [])
    nexercises = len(exercises)
    ex_summary = "  |  ".join(
        f"Ej.{i+1} {e.get('exercise_type','?')} "
        f"(v={len(e.get('vocabulary',[]))} s={len(e.get('sentences',[]))})"
        for i, e in enumerate(exercises)
    )
    log.info(
        f"  ◀  GEMINI RESPONSE  ({elapsed:.2f}s)\n"
        f"{SEP}\n"
        f"  Tokens    : in={tok_in}  out={tok_out}  total={tok_tot}{thinking_str}\n"
        f"  Title     : {title}\n"
        f"  Exercises : {nexercises}  →  {ex_summary}\n"
        f"{SEP}\n"
        f"  ── RAW RESPONSE ──\n"
        f"{_indent(raw_text)}\n"
        f"{SEP}\n"
        f"  ── PARSED JSON ──\n"
        f"{_indent(json.dumps(result, ensure_ascii=False, indent=2))}\n"
        f"{SEP2}\n"
    )

def dbg_error(elapsed, exc):
    log.info(
        f"  ✗  ERROR  ({elapsed:.2f}s)\n"
        f"{SEP}\n"
        f"  {type(exc).__name__}: {exc}\n"
        f"{SEP2}\n"
    )

app = FastAPI(title="DST Luzi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are an assistant for Spanish-speaking parents with children at a German school.
You receive a photo of a German homework sheet. Respond ONLY with a valid JSON object, no extra text, no markdown code blocks.

{
  "title": "title of the sheet in Spanish, maximum 60 characters",
  "exercises": [
    {
      "exercise_type": "Lectura | Gramatica | Vocabulario | Escritura | Dictado | Matematicas | Ciencias | Ingles | Otro",
      "description": "what the child has to do in this exercise; 2-3 clear sentences in Spanish",
      "help_suggestion": "how the parent can support the child WITHOUT doing the work for them, adapted to their German level; 2-3 sentences in Spanish",
      "full_text": "Lectura: verbatim transcription of the German text preserving paragraphs. Other types: \"\"",
      "sentences": [{"de": "German sentence", "es": "Spanish translation"}],
      "vocabulary": [{"german": "word", "article_de": "der|die|das|\"\"", "spanish": "translation", "article_es": "el|la|los|las|\"\"", "word_type": "Nomen|Verb|Adjektiv|Andere"}],
      "suggested_steps": ["concrete step for the parent"]
    }
  ]
}

RULES:

exercises
  Identify each numbered or clearly separated exercise on the sheet. Maximum 5.
  If the sheet has only one exercise, still return an array with one element.

exercise_type — use the value that best describes the primary skill being practised:
  Lectura     → reading a text and answering comprehension questions
  Gramatica   → articles, cases, verb conjugation, sentence structure, grammar fill-in-the-blank
  Vocabulario → learning or matching words, vocabulary lists, matching words to pictures
  Escritura   → producing original written text (sentences, paragraphs, essays, descriptions)
  Dictado     → teacher dictates and the child writes what they hear
  Matematicas → arithmetic, geometry, measurements, word problems, calculation
  Ciencias    → Sachunterricht: biology, nature, animals, plants, geography, history, the human body
  Ingles      → English language exercises (any type)
  Otro        → only if none of the above clearly applies

full_text
  Lectura: copy the complete German text exactly as it appears, without summarising or translating.
  Other types: "".

sentences
  Lectura: one entry per sentence in the text with its translation. No limit.
  Other types: include ALL sentences, questions and instructions visible in the exercise,
  each with its Spanish translation. The parent may have zero German knowledge and needs to
  understand exactly what each item asks. Do not omit anything. Maximum 12.

vocabulary
  Maximum 20 words per exercise. Skip obvious cognates (e.g. "Musik", "Telefon", "Butter").
  Prioritise words a Spanish-speaking parent would not recognise.
  article_de: "der" / "die" / "das" for nouns; "" for verbs, adjectives, adverbs and other categories.
  article_es: "el" / "la" / "los" / "las" for nouns; "" for everything else.
  word_type: grammatical category in German — exactly one of: Nomen, Verb, Adjektiv, Andere.

suggested_steps: 3-5 steps, ordered, addressed to the parent.
"""

LEVEL_DESCRIPTIONS = {
    "ninguno":      "speaks no German at all",
    "principiante": "knows a few basic German words",
    "intermedio":   "has an intermediate level of German",
    "avanzado":     "speaks German fluently",
    "nativo":       "is a native German speaker",
}


def compress_image(data: bytes, max_px: int = 1024, quality: int = 82) -> tuple[bytes, str]:
    """Resize to max_px on the longest side and re-encode as JPEG. Returns (bytes, mime_type)."""
    img = Image.open(io.BytesIO(data))
    img = img.convert("RGB")
    w, h = img.size
    if max(w, h) > max_px:
        scale = max_px / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue(), "image/jpeg"


_EXERCISE_FIELDS = ("exercise_type", "description", "help_suggestion",
                    "full_text", "sentences", "vocabulary", "suggested_steps")

def _normalise(data: dict) -> dict:
    """Ensure response always uses the exercises[] schema. Wraps old flat responses."""
    if "exercises" not in data:
        exercise = {k: data[k] for k in _EXERCISE_FIELDS if k in data}
        data = {"title": data.get("title", ""), "exercises": [exercise]}
    return data


def parse_gemini_response(text: str) -> dict:
    text = text.strip()
    text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        return _normalise(json.loads(text))
    except json.JSONDecodeError:
        pass

    m = re.search(r"\{[\s\S]*\}", text)
    if m:
        try:
            return _normalise(json.loads(m.group()))
        except json.JSONDecodeError:
            pass

    return {
        "title": "Ejercicio analizado",
        "exercises": [{
            "exercise_type": "Otro",
            "description": text[:500] if len(text) > 10 else "No se pudo analizar el ejercicio.",
            "help_suggestion": "Lee el ejercicio con tu hijo y ayúdale a entender las instrucciones.",
            "full_text": "",
            "sentences": [],
            "vocabulary": [],
            "suggested_steps": [
                "Lee el ejercicio juntos en voz alta.",
                "Pregúntale qué palabras o instrucciones entiende.",
                "Ayúdale a buscar las respuestas sin dárselas directamente.",
            ],
        }],
    }


@app.post("/api/analyze")
async def analyze(
    file: UploadFile = File(...),
    child_name: str = Form(""),
    child_age: int = Form(8),
    parent_level: str = Form("principiante"),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Archivo vacío")

    orig_size = len(content)
    mime_type = file.content_type or "image/jpeg"
    level_desc = LEVEL_DESCRIPTIONS.get(parent_level, "has a basic level of German")

    context_parts = []
    if child_name:
        context_parts.append(f"The child's name is {child_name} and they are {child_age} years old.")
    else:
        context_parts.append(f"The child is {child_age} years old.")
    context_parts.append(f"The parent {level_desc}.")
    context = " ".join(context_parts)

    full_prompt = SYSTEM_PROMPT + f"\n\nStudent context: {context}"

    img_w = img_h = 0
    try:
        image_data, mime_type = compress_image(content)
        with Image.open(io.BytesIO(image_data)) as _img:
            img_w, img_h = _img.size
    except Exception:
        image_data, mime_type = content, mime_type

    dbg_request(
        filename=file.filename or "unknown",
        orig_bytes=orig_size,
        comp_bytes=len(image_data),
        w=img_w, h=img_h,
        child_name=child_name,
        child_age=child_age,
        parent_level=parent_level,
        prompt=full_prompt,
    )

    t0 = time.perf_counter()
    try:
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        response = model.generate_content(
            [full_prompt, {"mime_type": mime_type, "data": image_data}],
        )
        result = parse_gemini_response(response.text)
        dbg_response(time.perf_counter() - t0, response.text, result, response.usage_metadata)
    except ResourceExhausted as exc:
        dbg_error(time.perf_counter() - t0, exc)
        raise HTTPException(status_code=429, detail="Límite alcanzado. Inténtalo en un momento.")
    except Exception as exc:
        dbg_error(time.perf_counter() - t0, exc)
        raise HTTPException(status_code=500, detail=f"Error al analizar la imagen: {exc}")

    return result


CORRECT_PROMPT = """You are checking a child's completed homework. You receive a photo of their completed work and a list of the exercise's questions or tasks.

For each item in the list, locate the child's answer in the photo and assess it.
Respond ONLY with a valid JSON object, no extra text, no markdown code blocks.

{
  "items": [
    {
      "question": "the question text (copy from the list)",
      "status": "ok|partial|error",
      "note": "brief comment in Spanish — empty string if status is ok"
    }
  ],
  "summary": "1 encouraging sentence in Spanish about the child's overall performance"
}

RULES:
- status "ok": answer is correct or clearly acceptable
- status "partial": partially correct, missing words, hard to read, or uncertain
- status "error": clearly wrong or left blank
- note: only when status is not "ok"; 1 short sentence in Spanish explaining the issue
- If you cannot find or read an answer for an item, use "partial"
- Keep the tone encouraging; mistakes are normal and expected
"""


@app.post("/api/correct")
async def correct(
    file: UploadFile = File(...),
    sentences: str = Form("[]"),
    child_name: str = Form(""),
    child_age: int = Form(8),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Archivo vacío")

    try:
        sentence_list = json.loads(sentences)
    except Exception:
        sentence_list = []

    items_text = "\n".join(
        f"{i+1}. {s['de']}" for i, s in enumerate(sentence_list) if s.get("de")
    )
    child_ctx = f"The child's name is {child_name} and they are {child_age} years old." if child_name else f"The child is {child_age} years old."
    full_prompt = CORRECT_PROMPT + f"\n\nStudent: {child_ctx}"
    if items_text:
        full_prompt += f"\n\nExercise items to check:\n{items_text}"

    orig_size = len(content)
    img_w = img_h = 0
    mime_type = file.content_type or "image/jpeg"
    try:
        image_data, mime_type = compress_image(content)
        with Image.open(io.BytesIO(image_data)) as _img:
            img_w, img_h = _img.size
    except Exception:
        image_data = content

    log.info(
        f"\n{SEP2}\n"
        f"  ▶  CORRECT REQUEST  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"{SEP}\n"
        f"  File      : {file.filename or 'unknown'}\n"
        f"  Original  : {_kb(orig_size)}\n"
        f"  Compressed: {_kb(len(image_data))}  ({img_w}×{img_h}px)\n"
        f"  Items     : {len(sentence_list)}\n"
        f"  Child     : {child_name or '(sin nombre)'}, {child_age} años\n"
        f"{SEP}"
    )

    t0 = time.perf_counter()
    try:
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        response = model.generate_content(
            [full_prompt, {"mime_type": mime_type, "data": image_data}],
        )
        raw = response.text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        result = json.loads(raw)
        log.info(
            f"  ◀  CORRECT RESPONSE  ({time.perf_counter() - t0:.2f}s)\n"
            f"{SEP}\n"
            f"  Items   : {len(result.get('items', []))}\n"
            f"  Summary : {result.get('summary', '')}\n"
            f"{SEP2}\n"
        )
    except ResourceExhausted as exc:
        dbg_error(time.perf_counter() - t0, exc)
        raise HTTPException(status_code=429, detail="Límite alcanzado. Inténtalo en un momento.")
    except Exception as exc:
        dbg_error(time.perf_counter() - t0, exc)
        raise HTTPException(status_code=500, detail=f"Error al analizar la imagen: {exc}")

    return result


static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
