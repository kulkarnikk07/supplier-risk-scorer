from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from services.sam_gov import search_suppliers
from services.scorer import score_supplier
from services.ai_summary import generate_supplier_summary
from dotenv import load_dotenv
from pathlib import Path
import os
import anthropic

load_dotenv(dotenv_path=Path(__file__).parent / ".env", override=False)

app = FastAPI(title="Supplier Risk Scorer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Supplier Risk Scorer API is running ✅"}

@app.get("/health")
def health():
    return {"status": "healthy", "version": "0.1.0"}

@app.get("/api/suppliers")
async def get_suppliers(
    naics_code: str = Query(None, description="NAICS code e.g. 541512"),
    state: str = Query(None, description="State code e.g. VA, TX, CA"),
    business_type: str = Query(None, description="Business type code"),
):
    """
    Search for suppliers and return them with risk + diversity scores
    """
    results = await search_suppliers(
        naics_code=naics_code,
        state=state,
        business_type=business_type,
    )

    if "error" in results:
        return results

    scored_suppliers = []
    for supplier in results["suppliers"]:
        scored = score_supplier(supplier)
        scored_suppliers.append(scored)

    return {
        "total": results["total"],
        "suppliers": scored_suppliers
    }

@app.get("/api/suppliers/score")
async def score_single(uei: str = Query(..., description="UEI of supplier to score")):
    """
    Score a single supplier by UEI
    """
    return {"message": f"Scoring supplier {uei} — coming in Stage 6!"}

@app.post("/api/suppliers/summary")
async def get_supplier_summary(supplier: dict):
    """
    Generate an AI summary for a supplier using Claude
    """
    summary = await generate_supplier_summary(supplier)
    return {"summary": summary}

@app.post("/api/chat")
async def chat(request: Request):
    """
    Chat endpoint for the procurement assistant
    """
    body = await request.json()
    messages = body.get("messages", [])
    system_prompt = body.get("system", "")

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        system=system_prompt,
        messages=messages,
    )

    return {"reply": response.content[0].text}