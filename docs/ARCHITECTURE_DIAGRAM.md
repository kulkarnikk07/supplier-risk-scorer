# 🏗️ Architecture Diagram
## Supplier Risk Scorer

**Version:** 1.0  
**Author:** Kedar Kulkarni  
**Last Updated:** March 2026  

---

## 1. High-Level System Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                  REACT FRONTEND (Vercel)                    │   │
│   │                                                             │   │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│   │   │  Search  │  │Supplier  │  │ Compare  │  │  About   │  │   │
│   │   │   Page   │  │  Detail  │  │  Modal   │  │  Modal   │  │   │
│   │   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│   │                                                             │   │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│   │   │SearchBar │  │Supplier  │  │  Filter  │  │  Chat    │  │   │
│   │   │(NAICS    │  │  Card    │  │  Panel   │  │  Bubble  │  │   │
│   │   │Dropdown) │  │          │  │          │  │          │  │   │
│   │   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│   │                                                             │   │
│   │              ┌─────────────────────┐                       │   │
│   │              │     api.js          │                       │   │
│   │              │  USE_MOCK = true    │                       │   │
│   │              │  ┌───────────────┐  │                       │   │
│   │              │  │  Mock Mode    │  │                       │   │
│   │              │  │  suppliers    │  │                       │   │
│   │              │  │  spending     │  │                       │   │
│   │              │  │  sba JSON     │  │                       │   │
│   │              │  └───────────────┘  │                       │   │
│   │              └─────────────────────┘                       │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                    (AI features only)                               │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                    HTTPS REST API calls
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND (Render)                         │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                       main.py                               │   │
│   │                                                             │   │
│   │   GET  /                    → Health check                  │   │
│   │   GET  /health              → Status + version              │   │
│   │   GET  /api/suppliers       → Search + score vendors        │   │
│   │   GET  /api/suppliers/score → Score single vendor           │   │
│   │   POST /api/suppliers/summary → AI summary                  │   │
│   │   POST /api/chat            → AI chat assistant             │   │
│   │                                                             │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │
│   │   │  sam_gov.py │  │ scorer.py   │  │ ai_summary.py   │   │   │
│   │   │             │  │             │  │                 │   │   │
│   │   │ search_     │  │ calculate_  │  │ generate_       │   │   │
│   │   │ suppliers() │  │ risk_score()│  │ supplier_       │   │   │
│   │   │             │  │ calculate_  │  │ summary()       │   │   │
│   │   │             │  │ diversity_  │  │                 │   │   │
│   │   │             │  │ score()     │  │                 │   │   │
│   │   └──────┬──────┘  └─────────────┘  └────────┬────────┘   │   │
│   └──────────┼──────────────────────────────────────┼──────────┘   │
│              │                                      │              │
└──────────────┼──────────────────────────────────────┼──────────────┘
               │                                      │
               ▼                                      ▼
┌──────────────────────────┐            ┌─────────────────────────┐
│   GOVERNMENT DATA APIs   │            │    ANTHROPIC CLAUDE API  │
│                          │            │                         │
│  ┌────────────────────┐  │            │  Model: claude-sonnet-  │
│  │     SAM.gov API    │  │            │         4-5             │
│  │                    │  │            │                         │
│  │ /entity-information│  │            │  Endpoints:             │
│  │ /v3/entities       │  │            │  POST /v1/messages      │
│  │                    │  │            │                         │
│  │ Returns:           │  │            │  Used for:              │
│  │ - UEI              │  │            │  - Supplier summaries   │
│  │ - CAGE code        │  │            │  - Chat assistant       │
│  │ - Certifications   │  │            │                         │
│  │ - Expiry date      │  │            │  Max tokens: 1000       │
│  │ - Registration     │  │            │  Temperature: default   │
│  └────────────────────┘  │            └─────────────────────────┘
│                          │
│  ┌────────────────────┐  │
│  │ USASpending.gov API│  │
│  │                    │  │
│  │ /api/v2/search/    │  │
│  │ spending_by_award/ │  │
│  │                    │  │
│  │ Returns:           │  │
│  │ - Contract awards  │  │
│  │ - Agencies served  │  │
│  │ - Award amounts    │  │
│  │ - Award dates      │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │    SBA DSBS API    │  │
│  │                    │  │
│  │ Returns:           │  │
│  │ - 8(a) status      │  │
│  │ - WOSB status      │  │
│  │ - HUBZone status   │  │
│  │ - SDVOSB status    │  │
│  │ - VOSB status      │  │
│  │ - SDB status       │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

## 2. Frontend Component Architecture
```
App.jsx (React Router)
│
├── Route: "/"
│   └── Search.jsx
│       │
│       ├── SearchBar.jsx
│       │   ├── NAICS Dropdown (naics.js data)
│       │   └── State Selector
│       │
│       ├── FilterPanel.jsx
│       │   ├── Risk Score Slider
│       │   └── Certification Checkboxes
│       │
│       ├── SupplierCard.jsx (×10)
│       │   ├── RiskScoreBadge.jsx
│       │   ├── RiskScoreBadge.jsx (diversity)
│       │   └── Compare Checkbox
│       │
│       ├── Compare Bar (fixed bottom)
│       │
│       ├── Compare Modal
│       │   └── Comparison Table
│       │
│       ├── About Modal
│       │   ├── Project Description
│       │   ├── Data Sources
│       │   ├── Tech Stack
│       │   ├── Developer Info
│       │   └── Disclaimer
│       │
│       └── ChatBubble.jsx
│           ├── Chat Window
│           │   ├── Message List
│           │   │   ├── User Messages
│           │   │   └── Assistant Messages (react-markdown)
│           │   └── Typing Indicator
│           └── Input Area
│
└── Route: "/supplier/:uei"
    └── SupplierDetail.jsx
        ├── Registration Info Section
        ├── Score Breakdown Section
        ├── Certifications Section
        ├── Contract History Table
        └── AI Summary Section
```

---

## 3. Data Flow Diagram

### 3.1 Mock Mode Search Flow
```
User clicks Search
        │
        ▼
SearchBar.jsx
onSearch({ naics_code, state })
        │
        ▼
api.js → searchSuppliers()
        │
        ├── Read suppliers.json
        ├── Read spending.json
        ├── Read sba.json
        │
        ▼
Merge by UEI key
        │
        ▼
Calculate risk_score
        │
        ├── active_registration? +20
        ├── expiry > 6 months?   +15
        ├── has contracts?        +25
        ├── multiple agencies?    +15
        ├── has CAGE code?        +10
        └── has UEI?             +15
        │
        ▼
Calculate diversity_score
        │
        ├── 8(a)?     +20
        ├── WOSB?     +20
        ├── EDWOSB?   +20
        ├── HUBZone?  +20
        ├── SDVOSB?   +20
        ├── VOSB?     +20
        └── SDB?      +20 (capped at 100)
        │
        ▼
Return enriched suppliers[]
        │
        ▼
Search.jsx → setSuppliers()
        │
        ▼
Render SupplierCard × N
```

### 3.2 AI Summary Flow
```
User clicks Generate AI Summary
        │
        ▼
SupplierDetail.jsx
POST /api/suppliers/summary
{ supplier: { ...all fields } }
        │
        ▼
FastAPI backend
ai_summary.py → generate_supplier_summary()
        │
        ▼
Build prompt:
"Analyze this federal supplier and provide
a plain English procurement assessment..."
+ JSON supplier data
        │
        ▼
Anthropic Claude API
POST /v1/messages
model: claude-sonnet-4-5
max_tokens: 1000
        │
        ▼
Return summary text
        │
        ▼
Display in SupplierDetail.jsx
```

### 3.3 Chat Assistant Flow
```
User types message → clicks Send
        │
        ▼
ChatBubble.jsx
        │
        ├── Add user message to messages[]
        ├── Build system prompt:
        │   "You are a federal procurement assistant.
        │    Here is the current supplier data:
        │    [JSON of all suppliers on screen]"
        │
        ▼
POST /api/chat
{
  system: systemPrompt,
  messages: [...conversationHistory]
}
        │
        ▼
FastAPI backend → /api/chat
        │
        ▼
Anthropic Claude API
POST /v1/messages
model: claude-sonnet-4-5
max_tokens: 1000
system: systemPrompt
messages: conversationHistory
        │
        ▼
Return { reply: "..." }
        │
        ▼
ChatBubble.jsx
        │
        ├── Add assistant reply to messages[]
        └── Render with react-markdown
```

### 3.4 Compare Flow
```
User checks Compare on card
        │
        ▼
SupplierCard.jsx → onCompare(supplier)
        │
        ▼
Search.jsx → toggleCompare()
        │
        ├── Already in list? → Remove
        ├── List has 3? → Alert + reject
        └── Otherwise → Add to compareList[]
        │
        ▼
Compare Bar appears (fixed bottom)
        │
        ▼
User clicks Compare Now →
        │
        ▼
setShowCompare(true)
        │
        ▼
Comparison Modal renders
        │
        ├── Table with all metrics
        ├── Math.max() finds best value per row
        └── isBest → green highlight + ⭐
```

---

## 4. Database / Storage Architecture
```
┌─────────────────────────────────────────────────┐
│              DATA STORAGE (v1.0)                │
│                                                 │
│   No database in v1.0 — all data is either:    │
│                                                 │
│   ┌─────────────────────────────────────────┐  │
│   │           MOCK DATA (JSON files)        │  │
│   │                                         │  │
│   │  suppliers.json  → 10 suppliers         │  │
│   │  spending.json   → Contract history     │  │
│   │  sba.json        → Certifications       │  │
│   │                                         │  │
│   │  Joined in memory by UEI key            │  │
│   └─────────────────────────────────────────┘  │
│                      OR                        │
│   ┌─────────────────────────────────────────┐  │
│   │        LIVE API DATA (Real Mode)        │  │
│   │                                         │  │
│   │  Fetched fresh on each search request   │  │
│   │  Not cached or persisted in v1.0        │  │
│   └─────────────────────────────────────────┘  │
│                                                 │
│   Planned for v1.1:                            │
│   ┌─────────────────────────────────────────┐  │
│   │         Supabase (PostgreSQL)           │  │
│   │                                         │  │
│   │  - User accounts + saved searches       │  │
│   │  - Cached API responses                 │  │
│   │  - Chat history persistence             │  │
│   └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 5. Deployment Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                        │
│                                                             │
│   supplier-risk-scorer/                                     │
│   ├── backend/    ──────────────────────────────────┐       │
│   ├── frontend/   ──────────────────────┐           │       │
│   └── docs/                             │           │       │
└─────────────────────────────────────────┼───────────┼───────┘
                                          │           │
                          Auto deploy     │           │ Auto deploy
                          on push         │           │ on push
                                          │           │
                                          ▼           ▼
                    ┌─────────────────────┐  ┌──────────────────────┐
                    │   VERCEL (Frontend) │  │  RENDER (Backend)    │
                    │                     │  │                      │
                    │  npm run build      │  │  pip install -r      │
                    │  → dist/            │  │  requirements.txt    │
                    │                     │  │                      │
                    │  Static hosting     │  │  uvicorn main:app    │
                    │  Global CDN         │  │  --host 0.0.0.0      │
                    │                     │  │  --port $PORT        │
                    │  URL:               │  │                      │
                    │  supplier-risk-     │  │  URL:                │
                    │  scorer.vercel.app  │  │  supplier-risk-      │
                    │                     │  │  scorer-api.         │
                    │  Free tier:         │  │  onrender.com        │
                    │  Unlimited deploys  │  │                      │
                    │  100GB bandwidth    │  │  Free tier:          │
                    │                     │  │  Sleeps after 15min  │
                    └─────────────────────┘  │  750hrs/month        │
                              │              └──────────────────────┘
                              │                        │
                              └──────────┬─────────────┘
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │    END USER BROWSER    │
                            │                        │
                            │  vercel.app            │
                            └────────────────────────┘
```

---

## 6. Security Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
│                                                             │
│   Layer 1 — API Key Protection                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  Keys stored in:                                    │  │
│   │  • .env file (local, in .gitignore)                 │  │
│   │  • Render environment variables (production)        │  │
│   │                                                     │  │
│   │  Keys NEVER in:                                     │  │
│   │  • Source code                                      │  │
│   │  • GitHub repository                                │  │
│   │  • Frontend JavaScript (browser)                    │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   Layer 2 — Server-Side API Calls                          │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  All external API calls made from backend:          │  │
│   │  • SAM.gov ← FastAPI backend only                   │  │
│   │  • Anthropic ← FastAPI backend only                 │  │
│   │  • SBA ← FastAPI backend only                       │  │
│   │                                                     │  │
│   │  Browser never sees API keys                        │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   Layer 3 — CORS Policy                                    │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  Current (demo): allow_origins=["*"]                │  │
│   │  Production recommendation:                         │  │
│   │  allow_origins=["https://your-app.vercel.app"]      │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   Layer 4 — No User Data Storage                           │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  v1.0 stores no user data:                          │  │
│   │  • No authentication                                │  │
│   │  • No session storage                               │  │
│   │  • No database writes                               │  │
│   │  • Chat history only in browser memory              │  │
│   └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. API Integration Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL API INTEGRATIONS                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    SAM.gov API                       │  │
│  │                                                      │  │
│  │  Base URL: https://api.sam.gov/entity-information    │  │
│  │            /v3/entities                              │  │
│  │  Auth:     ?api_key=YOUR_KEY (URL parameter)         │  │
│  │  Method:   GET                                       │  │
│  │  Limit:    10 req/day (non-federal)                  │  │
│  │  Rotation: Key expires every 90 days                 │  │
│  │                                                      │  │
│  │  Key params: naicsCode, physicalAddress              │  │
│  │              ProvinceOrStateCode                     │  │
│  │                                                      │  │
│  │  Returns: UEI, CAGE, legalName, registrationStatus  │  │
│  │           expirationDate, certifications             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               USASpending.gov API                    │  │
│  │                                                      │  │
│  │  Base URL: https://api.usaspending.gov               │  │
│  │            /api/v2/search/spending_by_award/         │  │
│  │  Auth:     None required                             │  │
│  │  Method:   POST                                      │  │
│  │  Limit:    Unlimited                                 │  │
│  │                                                      │  │
│  │  Key params: recipient_uei, award_type_codes         │  │
│  │                                                      │  │
│  │  Returns: award_amount, awarding_agency,             │  │
│  │           action_date, contract_count                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   SBA DSBS API                       │  │
│  │                                                      │  │
│  │  Base URL: https://api.sba.gov/                      │  │
│  │  Auth:     API key required (free)                   │  │
│  │  Method:   GET                                       │  │
│  │                                                      │  │
│  │  Returns: 8a_status, hubzone_status,                 │  │
│  │           wosb_status, sdvosb_status                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Anthropic Claude API                 │  │
│  │                                                      │  │
│  │  Base URL: https://api.anthropic.com                 │  │
│  │  Auth:     x-api-key header                          │  │
│  │  Method:   POST /v1/messages                         │  │
│  │  Model:    claude-sonnet-4-5                         │  │
│  │  Limit:    Per token pricing                         │  │
│  │                                                      │  │
│  │  Used for:                                           │  │
│  │  • /api/suppliers/summary → max_tokens: 1000         │  │
│  │  • /api/chat → max_tokens: 1000                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Mock vs Real API Mode
```
┌─────────────────────────────────────────────────────────────┐
│              MOCK MODE vs REAL API MODE                     │
│                                                             │
│   Toggle: frontend/src/services/api.js                     │
│   const USE_MOCK = true  ← change to false for real API    │
│                                                             │
│   MOCK MODE (USE_MOCK = true)                              │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                                                     │  │
│   │  Supplier Search:                                   │  │
│   │  Browser → suppliers.json (local)                   │  │
│   │         → spending.json  (local)                    │  │
│   │         → sba.json       (local)                    │  │
│   │         → Merged by UEI in api.js                   │  │
│   │         → Scores calculated in api.js               │  │
│   │                                                     │  │
│   │  AI Features:                                       │  │
│   │  Browser → FastAPI → Anthropic Claude               │  │
│   │                                                     │  │
│   │  Pros: No API keys needed, no rate limits           │  │
│   │  Cons: Fixed 10 suppliers, not real-time data       │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   REAL API MODE (USE_MOCK = false)                         │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                                                     │  │
│   │  Supplier Search:                                   │  │
│   │  Browser → FastAPI → SAM.gov API                    │  │
│   │                    → USASpending API                │  │
│   │                    → SBA DSBS API                   │  │
│   │                    → Scoring Engine                 │  │
│   │                    → Return enriched suppliers      │  │
│   │                                                     │  │
│   │  AI Features:                                       │  │
│   │  Browser → FastAPI → Anthropic Claude               │  │
│   │                                                     │  │
│   │  Pros: Live data, real vendors                      │  │
│   │  Cons: SAM.gov 10 req/day limit, keys required      │  │
│   └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Future Architecture (v2.0)
```
┌─────────────────────────────────────────────────────────────┐
│                  PLANNED v2.0 ARCHITECTURE                  │
│                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│   │   React     │     │   FastAPI   │     │  Supabase   │  │
│   │  Frontend   │────▶│   Backend   │────▶│ PostgreSQL  │  │
│   │  (Vercel)   │     │  (Render)   │     │             │  │
│   └─────────────┘     └─────────────┘     │  - Users    │  │
│                              │            │  - Searches │  │
│                              │            │  - Cache    │  │
│                    ┌─────────┼─────────┐  └─────────────┘  │
│                    │         │         │                    │
│                    ▼         ▼         ▼                    │
│              SAM.gov   Anthropic   USASpending              │
│              API       Claude      API                      │
│                                                             │
│   New features planned:                                     │
│   • User authentication (Supabase Auth)                    │
│   • Saved searches and watchlists                          │
│   • API response caching (reduce SAM.gov calls)            │
│   • Chat history persistence                               │
│   • Contract opportunity matching                          │
│   • Email alerts for vendor changes                        │
│   • FPDS integration                                       │
└─────────────────────────────────────────────────────────────┘
```