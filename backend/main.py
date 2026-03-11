from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from services.sam_gov import search_suppliers
from services.scorer import score_supplier
from services.ai_summary import generate_supplier_summary

app = FastAPI(title="Supplier Risk Scorer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
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
    # Step 1 — Get suppliers from SAM.gov
    results = await search_suppliers(
        naics_code=naics_code,
        state=state,
        business_type=business_type,
    )

    # Step 2 — Check for errors
    if "error" in results:
        return results

    # Step 3 — Score each supplier
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
    # Placeholder — will connect USASpending in Stage 6
    return {"message": f"Scoring supplier {uei} — coming in Stage 6!"}

@app.post("/api/suppliers/summary")
async def get_supplier_summary(supplier: dict):
    """
    Generate an AI summary for a supplier using Claude
    """
    summary = await generate_supplier_summary(supplier)
    return {"summary": summary}