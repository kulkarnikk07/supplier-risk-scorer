from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from services.sam_gov import search_suppliers

app = FastAPI(title="Supplier Risk Scorer API", version="0.1.0")

# Allow React frontend to talk to this backend
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
    limit: int = Query(10, description="Number of results to return")
):
    """
    Search for suppliers by NAICS code, state, and business type
    """
    results = await search_suppliers(
        naics_code=naics_code,
        state=state,
        business_type=business_type,
        limit=limit
    )
    return results