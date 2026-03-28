# 🛠️ Technical Documentation
## Supplier Risk Scorer

**Version:** 1.0  
**Author:** Kedar Kulkarni  
**Last Updated:** March 2026  

---

## 1. System Overview

Supplier Risk Scorer is a full-stack web application consisting of:

- **Frontend:** React + Vite single-page application
- **Backend:** Python FastAPI REST API
- **AI Layer:** Anthropic Claude API for summaries and chat
- **Data Sources:** SAM.gov, USASpending.gov, SBA DSBS
- **Hosting:** Render (backend) + Vercel (frontend)

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend Framework | React | 18+ | UI component library |
| Frontend Build Tool | Vite | 5+ | Fast dev server and bundler |
| Frontend Styling | Tailwind CSS | v4 | Utility-first CSS framework |
| Frontend Routing | React Router DOM | v6 | Client-side routing |
| Frontend HTTP | Axios | Latest | API requests |
| Frontend State | TanStack Query | v5 | Server state management |
| Frontend Markdown | react-markdown | Latest | Chat response rendering |
| Backend Framework | FastAPI | Latest | REST API framework |
| Backend Server | Uvicorn | Latest | ASGI web server |
| Backend HTTP | HTTPX | Latest | Async HTTP client |
| Backend AI | Anthropic SDK | Latest | Claude API integration |
| Backend Config | python-dotenv | Latest | Environment variable loading |
| AI Model | Claude Sonnet 4.5 | claude-sonnet-4-5 | Summaries and chat |
| Backend Hosting | Render.com | Free Tier | Cloud hosting |
| Frontend Hosting | Vercel | Free Tier | Static site hosting |

---

## 3. Project Structure
```
supplier-risk-scorer/
├── backend/
│   ├── main.py                   # FastAPI app, routes, middleware
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Local environment variables (not in git)
│   ├── .env.example              # Template for environment variables
│   └── services/
│       ├── sam_gov.py            # SAM.gov API integration
│       ├── scorer.py             # Risk and diversity scoring engine
│       └── ai_summary.py        # Claude AI summary generation
├── frontend/
│   ├── index.html                # HTML entry point
│   ├── vite.config.js            # Vite configuration
│   ├── package.json              # Node dependencies
│   ├── vercel.json               # Vercel deployment config
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Root component + routing
│       ├── index.css             # Global styles + Tailwind import
│       ├── components/
│       │   ├── SearchBar.jsx     # NAICS dropdown + state selector
│       │   ├── SupplierCard.jsx  # Supplier card with compare checkbox
│       │   ├── FilterPanel.jsx   # Risk score + certification filters
│       │   ├── RiskScoreBadge.jsx # Score badge component
│       │   └── ChatBubble.jsx    # Floating AI chat assistant
│       ├── pages/
│       │   ├── Search.jsx        # Main search page
│       │   └── SupplierDetail.jsx # Supplier full profile page
│       ├── data/
│       │   └── naics.js          # Top 50 federal NAICS codes
│       ├── services/
│       │   └── api.js            # API client with mock/real toggle
│       └── mock/
│           ├── suppliers.json    # Mock supplier data
│           ├── spending.json     # Mock USASpending data
│           └── sba.json          # Mock SBA certification data
├── docs/
│   ├── PRD.md
│   ├── API_DOCUMENTATION.md
│   ├── TECHNICAL_DOCUMENTATION.md
│   ├── USER_DOCUMENTATION.md
│   ├── ARCHITECTURE_DIAGRAM.md
│   └── SCORING_ALGORITHM.md
├── render.yaml                   # Render deployment config
├── README.md
└── SWITCHING_TO_REAL_APIS.md
```

---

## 4. Architecture

### 4.1 Request Flow (Mock Mode)
```
User Browser
    │
    ▼
React Frontend (Vercel)
    │
    ├── Reads mock JSON files locally
    ├── Calculates scores client-side
    │
    ▼
FastAPI Backend (Render) ← only called for AI features
    │
    ├── /api/suppliers/summary → Anthropic Claude API
    └── /api/chat             → Anthropic Claude API
```

### 4.2 Request Flow (Real API Mode)
```
User Browser
    │
    ▼
React Frontend (Vercel)
    │
    ▼
FastAPI Backend (Render)
    │
    ├── /api/suppliers → SAM.gov API
    │                 → USASpending.gov API
    │                 → SBA DSBS API
    │                 → Scoring Engine
    │
    ├── /api/suppliers/summary → Anthropic Claude API
    └── /api/chat             → Anthropic Claude API
```

### 4.3 Data Enrichment Flow
```
SAM.gov (registration, CAGE, UEI, certifications)
    +
USASpending.gov (contract awards, agencies, spending)
    +
SBA DSBS (certifications — 8(a), WOSB, HUBZone etc.)
    │
    ▼
Scoring Engine (risk_score + diversity_score)
    │
    ▼
Enriched Supplier Object → Frontend → User
```

---

## 5. Backend Technical Details

### 5.1 main.py
Entry point for the FastAPI application. Responsibilities:
- CORS middleware configuration
- Route definitions
- Environment variable loading
- Anthropic client initialization

### 5.2 services/sam_gov.py
Handles all communication with the SAM.gov API.

**Key function:**
```python
async def search_suppliers(naics_code, state, business_type)
```
- Makes async HTTP request to SAM.gov
- Parses and normalizes vendor data
- Returns list of supplier dictionaries

**SAM.gov API Details:**
- Base URL: `https://api.sam.gov/entity-information/v3/entities`
- Auth: API key as URL parameter
- Rate limit: 10 requests/day (non-federal)
- Key rotation: Every 90 days

### 5.3 services/scorer.py
Algorithmic scoring engine for risk and diversity.

**Key functions:**
```python
def calculate_risk_score(supplier) → int (0-100)
def calculate_diversity_score(supplier) → int (0-100)
def score_supplier(supplier) → dict
```

See [SCORING_ALGORITHM.md](./SCORING_ALGORITHM.md) for full details.

### 5.4 services/ai_summary.py
Generates AI procurement summaries using Claude.

**Key function:**
```python
async def generate_supplier_summary(supplier) → str
```
- Builds structured prompt from supplier data
- Calls Claude API with supplier context
- Returns plain English summary string

---

## 6. Frontend Technical Details

### 6.1 Mock/Real API Toggle
Controlled by a single flag in `frontend/src/services/api.js`:
```javascript
const USE_MOCK = true; // Set to false for real API
```

When `USE_MOCK = true`:
- Reads from local JSON files in `/mock/`
- Calculates scores client-side
- No backend calls except for AI features

When `USE_MOCK = false`:
- All requests go to FastAPI backend
- Backend calls SAM.gov, USASpending, SBA APIs

### 6.2 Data Enrichment (Mock Mode)
In mock mode, `api.js` merges three data sources by UEI:
```javascript
// Join suppliers + spending + SBA data by UEI
const enriched = suppliers.map(supplier => {
  const spending = spendingData[supplier.uei] || {}
  const sba = sbaData[supplier.uei] || {}
  return { ...supplier, ...spending, ...sba }
})
```

### 6.3 State Management
The app uses React `useState` for local state. Key state in `Search.jsx`:

| State | Type | Purpose |
|---|---|---|
| suppliers | array | Raw search results |
| filteredSuppliers | array | After filters applied |
| compareList | array | Suppliers selected for comparison |
| filters | object | Current filter values |
| loading | boolean | Search in progress |
| showCompare | boolean | Comparison modal visibility |
| showAbout | boolean | About modal visibility |

### 6.4 Routing
Defined in `App.jsx` using React Router v6:
```jsx
/ → Search page (main)
/supplier/:uei → SupplierDetail page
```

Navigation state is passed via React Router's `location.state` to preserve search results when navigating back from detail page.

### 6.5 Chat Bubble Architecture
`ChatBubble.jsx` receives `suppliers` as a prop from `Search.jsx`. On every message send:

1. Builds system prompt with current supplier data as JSON context
2. Sends full conversation history + system prompt to `/api/chat`
3. Renders response with `react-markdown` for formatted output
4. Appends response to local message state

---

## 7. Environment Variables

### Backend (.env)
```
ANTHROPIC_API_KEY=sk-ant-...     # Anthropic Claude API key
SAM_API_KEY=your-key-here        # SAM.gov system account key
SBA_API_KEY=your-key-here        # SBA DSBS API key (v1.1)
```

> ⚠️ No quotes around values. Use `KEY=value` not `KEY="value"`

### Frontend (.env.production)
```
VITE_API_URL=https://your-render-url.onrender.com
```

---

## 8. Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend Setup
```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1        # Windows
source venv/bin/activate          # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
uvicorn main:app --reload
```

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

### Verify
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Swagger: http://localhost:8000/docs

---

## 9. Deployment

### Backend — Render.com
| Setting | Value |
|---|---|
| Runtime | Python 3 |
| Root Directory | backend |
| Build Command | pip install -r requirements.txt |
| Start Command | uvicorn main:app --host 0.0.0.0 --port $PORT |

Add environment variables in Render dashboard:
- `ANTHROPIC_API_KEY`
- `SAM_API_KEY`

### Frontend — Vercel
| Setting | Value |
|---|---|
| Framework | Vite |
| Root Directory | frontend |
| Build Command | npm run build |
| Output Directory | dist |

> ⚠️ Free tier Render instances sleep after 15 minutes of inactivity. First request after sleep may take 30–60 seconds.

---

## 10. Known Issues and Limitations

| Issue | Impact | Workaround |
|---|---|---|
| Render free tier sleeps | First chat/summary request is slow | Upgrade to paid tier or use keep-alive ping |
| SAM.gov 10 req/day limit | Can't do heavy testing with real API | Use mock mode for development |
| Chat history not persisted | Refreshing clears conversation | Planned for v1.1 with localStorage |
| CORS set to wildcard | Security risk in production | Restrict to Vercel URL before launch |

---

## 11. Security Considerations

- API keys are stored as environment variables, never in code
- `.env` is in `.gitignore` and never committed to GitHub
- CORS is currently open (`*`) — restrict to frontend URL for production
- No user authentication in v1.0 — planned for v1.1
- All external API calls are server-side — keys never exposed to browser

---

## 12. Testing

### Manual Testing Checklist
```
✅ Search returns suppliers for NAICS 541512 + VA
✅ Risk and diversity scores display correctly
✅ Supplier detail page loads on card click
✅ AI summary generates on button click
✅ Compare checkbox selects suppliers
✅ Compare modal shows side-by-side table
✅ Best scores highlighted in green
✅ CSV export downloads correctly
✅ Chat bubble opens and responds
✅ Reset filters clears all results
✅ About modal opens and closes
✅ Back navigation preserves search results
```

---

## 13. Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 14. Contact

**Kedar Kulkarni**  
🔗 [linkedin.com/in/kedar-kulkarni](https://www.linkedin.com/in/kedar-kulkarni/)  
💻 [GitHub Repository](https://github.com/kulkarnikk07/supplier-risk-scorer)