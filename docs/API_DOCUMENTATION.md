# 📡 API Documentation
## Supplier Risk Scorer — Backend API

**Base URL (Local):** `http://localhost:8000`  
**Base URL (Production):** `https://supplier-risk-scorer-api.onrender.com`  
**Version:** 1.0  
**Author:** Kedar Kulkarni  
**Last Updated:** March 2026  

---

## Authentication

The API does not require authentication for client requests. API keys for third-party services (SAM.gov, Anthropic) are stored as server-side environment variables and are never exposed to the client.

---

## Base Endpoints

### GET /
Health check — confirms the API is running.

**Request:**
```http
GET /
```

**Response:**
```json
{
  "message": "Supplier Risk Scorer API is running ✅"
}
```

---

### GET /health
Returns the current health status and version of the API.

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

---

## Supplier Endpoints

### GET /api/suppliers
Search for federal suppliers by NAICS code and state. Returns scored suppliers.

**Request:**
```http
GET /api/suppliers?naics_code=541512&state=VA
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| naics_code | string | No | NAICS industry code (e.g. 541512) |
| state | string | No | Two-letter state code (e.g. VA, TX, CA) |
| business_type | string | No | Business type filter code |

**Response:**
```json
{
  "total": 8011,
  "suppliers": [
    {
      "uei": "X3VAV4RKB3J7",
      "name": "KSGC SOLUTIONS LLC",
      "state": "VA",
      "city": "Herndon",
      "naics_code": "541512",
      "registration_status": "Active",
      "cage_code": "19NR1",
      "expiration_date": "2027-03-03",
      "risk_score": 82,
      "diversity_score": 75,
      "certifications": ["WOSB", "SDB"],
      "total_awards": 4200000,
      "contract_count": 12,
      "agencies_served": ["DoD", "HHS"]
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Failed to fetch suppliers from SAM.gov",
  "detail": "API key expired or rate limit exceeded"
}
```

---

### GET /api/suppliers/score
Score a single supplier by UEI identifier.

**Request:**
```http
GET /api/suppliers/score?uei=X3VAV4RKB3J7
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| uei | string | Yes | Unique Entity Identifier from SAM.gov |

**Response:**
```json
{
  "message": "Scoring supplier X3VAV4RKB3J7 — coming in Stage 6!"
}
```

> ⚠️ Note: This endpoint is a placeholder in v1.0 and will return full scoring data in v1.1.

---

### POST /api/suppliers/summary
Generate an AI-powered procurement summary for a supplier using Claude.

**Request:**
```http
POST /api/suppliers/summary
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "KSGC SOLUTIONS LLC",
  "uei": "X3VAV4RKB3J7",
  "state": "VA",
  "city": "Herndon",
  "naics_code": "541512",
  "registration_status": "Active",
  "cage_code": "19NR1",
  "expiration_date": "2027-03-03",
  "risk_score": 82,
  "diversity_score": 75,
  "certifications": ["WOSB", "SDB"],
  "total_awards": 4200000,
  "contract_count": 12,
  "agencies_served": ["DoD", "HHS"]
}
```

**Response:**
```json
{
  "summary": "KSGC Solutions LLC is a strong procurement candidate based in Herndon, VA. With an active SAM.gov registration valid through March 2027 and a risk score of 82/100, the vendor demonstrates solid reliability. Their WOSB and SDB certifications make them eligible for set-aside contracts, particularly valuable for agencies with small business goals. Having served DoD and HHS across 12 contracts totaling $4.2M, they show consistent federal experience. Recommended for consideration in IT services procurements under NAICS 541512."
}
```

**Error Response:**
```json
{
  "detail": "Internal Server Error"
}
```

---

## Chat Endpoint

### POST /api/chat
Send a message to the AI procurement assistant. The assistant is context-aware and can answer questions about supplier data and general federal procurement topics.

**Request:**
```http
POST /api/chat
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| messages | array | Yes | Conversation history array |
| system | string | Yes | System prompt with supplier context |
```json
{
  "system": "You are a federal procurement assistant. Here is the current supplier data: [...]",
  "messages": [
    {
      "role": "user",
      "content": "Which supplier has the highest risk score?"
    }
  ]
}
```

**Multi-turn Conversation Example:**
```json
{
  "system": "You are a federal procurement assistant...",
  "messages": [
    {
      "role": "user",
      "content": "Which supplier has the highest risk score?"
    },
    {
      "role": "assistant",
      "content": "TALOS Group Inc. has the highest risk score of 91/100..."
    },
    {
      "role": "user",
      "content": "What certifications do they have?"
    }
  ]
}
```

**Response:**
```json
{
  "reply": "TALOS Group Inc. has the highest risk score of 91/100. They are based in Charlottesville, VA and hold an SDVOSB certification, making them eligible for service-disabled veteran-owned set-aside contracts. They have served DoD, DHS, and GSA across 28 contracts totaling $12.5M."
}
```

**Error Response:**
```json
{
  "detail": "Internal Server Error"
}
```

---

## Error Codes

| HTTP Status | Meaning | Common Cause |
|---|---|---|
| 200 | Success | Request completed successfully |
| 422 | Unprocessable Entity | Missing or invalid request parameters |
| 500 | Internal Server Error | API key invalid, external API failure |

---

## Rate Limits

| Service | Limit | Notes |
|---|---|---|
| SAM.gov | 10 requests/day | Non-federal users only |
| USASpending.gov | Unlimited | No key required |
| Anthropic Claude | Per token pricing | Monitor usage at console.anthropic.com |
| Render (Free Tier) | Sleeps after 15min inactivity | First request may take 30–60 seconds |

---

## CORS Policy

The API allows requests from all origins (`*`) for development and demo purposes.

For production hardening, update `allow_origins` in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| ANTHROPIC_API_KEY | Yes | Anthropic Claude API key |
| SAM_API_KEY | Yes | SAM.gov system account API key |
| SBA_API_KEY | No | SBA DSBS API key (for v1.1) |

> ⚠️ Never commit API keys to GitHub. Store them in `.env` locally and as environment variables on Render.

---

## Swagger UI

Interactive API documentation is available at:
```
http://localhost:8000/docs        (local)
https://your-render-url/docs      (production)
```