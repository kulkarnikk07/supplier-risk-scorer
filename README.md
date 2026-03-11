# 🏛️ Supplier Risk Scorer

An AI-powered federal supplier discovery and risk scoring tool built with open US government data.

Search, evaluate, and compare federal vendors using real data from SAM.gov, USASpending.gov, and the SBA — with AI-generated procurement summaries powered by Claude.

---

## 🖼️ Features

- 🔍 **Search suppliers** by NAICS code and state
- 🛡️ **Risk scoring** based on registration status, CAGE code, UEI, and expiration
- 🌟 **Diversity scoring** for 8(a), WOSB, HUBZone, SDVOSB, and other certifications
- 📊 **Side-by-side comparison** of up to 3 suppliers with best-score highlighting
- ⬇️ **CSV export** of search results or comparisons
- 🤖 **AI summaries** powered by Claude — plain English procurement analysis
- 💀 **Skeleton loading** and responsive card UI

---

## 🗂️ Data Sources

| Source | Data | API Key Required |
|---|---|---|
| [SAM.gov](https://sam.gov) | Vendor registration, CAGE, UEI, certifications | ✅ Yes (free) |
| [USASpending.gov](https://usaspending.gov) | Contract awards, agencies, spending history | ❌ No |
| [SBA DSBS](https://sba.gov) | Small business certifications | ✅ Yes (free) |

---

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/supplier-risk-scorer.git
cd supplier-risk-scorer
```

### 2. Backend setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\Activate.ps1

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Create your `.env` file
```bash
cp .env.example .env
```

Then open `.env` and add your API keys:
```
SAM_API_KEY=your_sam_gov_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4. Start the backend
```bash
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000  
Swagger docs at: http://localhost:8000/docs

### 5. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔑 Getting API Keys

### SAM.gov
1. Go to [https://sam.gov/content/entity-registration](https://sam.gov/content/entity-registration)
2. Create a free account
3. Request a System Account with API access
4. Key rotates every 90 days — free for non-federal users (10 req/day)

### Anthropic (Claude AI)
1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Create an account and generate an API key
3. Add to your `.env` as `ANTHROPIC_API_KEY`

---

## 🧪 Running in Mock Mode (no API keys needed)

The app ships with mock data so you can explore it instantly without any API keys.

In `frontend/src/services/api.js`, `USE_MOCK` is set to `true` by default:
```js
const USE_MOCK = true; // Switch to false for real API
```

See [SWITCHING_TO_REAL_APIS.md](./SWITCHING_TO_REAL_APIS.md) for full instructions on enabling live data.

---

## 🏗️ Project Structure
```
supplier-risk-scorer/
├── backend/
│   ├── main.py               # FastAPI app + endpoints
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── sam_gov.py        # SAM.gov API integration
│       ├── scorer.py         # Risk + diversity scoring engine
│       └── ai_summary.py     # Claude AI summary generation
├── frontend/
│   └── src/
│       ├── components/       # SearchBar, SupplierCard, FilterPanel, RiskScoreBadge
│       ├── pages/            # Search, SupplierDetail
│       ├── services/api.js   # API client (mock/real toggle)
│       └── mock/             # Mock data (suppliers, spending, SBA)
├── README.md
└── SWITCHING_TO_REAL_APIS.md
```

---

## 🤖 Scoring System

### Risk Score (0–100)
| Factor | Points |
|---|---|
| Active registration | 20 |
| Expiration > 6 months | 15 |
| Contract history | 25 |
| Agency relationships | 15 |
| CAGE code present | 10 |
| UEI present | 15 |

### Diversity Score (0–100)
8(a), WOSB, EDWOSB, HUBZone, SDVOSB, VOSB, SDB — 20 points each, capped at 100.

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Tailwind CSS v4
- **Backend:** Python + FastAPI + uvicorn
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Data:** SAM.gov, USASpending.gov, SBA DSBS

---

## 📄 License

MIT — free to use, fork, and build on.