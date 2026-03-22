# 🏛️ Supplier Risk Scorer

An AI-powered federal supplier discovery and risk scoring tool built with open US government data.

Search, evaluate, and compare federal vendors using real data from SAM.gov, USASpending.gov, and the SBA — with AI-generated procurement summaries and a live procurement assistant powered by Claude.

> 🎬 Watch the Demo (1080p):[Supplier-Risk-Scorer Demo](https://youtu.be/zzUjJVMPe-Y)
> Built by [Kedar Kulkarni](https://www.linkedin.com/in/kedar-kulkarni/)

---

## 🖼️ Features

- 🔍 **Searchable NAICS dropdown** — Browse and filter top 50 federal NAICS codes by code or description
- 🛡️ **Risk scoring** — Based on registration status, CAGE code, UEI, expiration, and contract history
- 🌟 **Diversity scoring** — For 8(a), WOSB, HUBZone, SDVOSB, and other certifications
- 📊 **Side-by-side comparison** — Compare up to 3 suppliers with best-score highlighting ⭐
- ⬇️ **CSV export** — Export search results or comparisons for reporting
- 🤖 **AI summaries** — Plain English procurement analysis powered by Claude
- 💬 **Procurement chat assistant** — Floating chat bubble powered by Claude, answers questions about suppliers on screen and general federal procurement topics
- 💀 **Skeleton loading** — Animated card placeholders while searching
- 🔄 **Reset filters** — Clears filters and search results in one click
- ℹ️ **About modal** — Project info, data sources, tech stack, developer info, and disclaimer

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

Then open `.env` and add your API keys (no quotes around values):
```
SAM_API_KEY=your_sam_gov_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

> ⚠️ **Important:** Do not use quotes around API key values in `.env`. Use `KEY=value` not `KEY="value"`.

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
4. Used for both AI supplier summaries and the chat assistant

---

## 🧪 Running in Mock Mode (no API keys needed)

The app ships with mock data so you can explore it instantly without any API keys.

In `frontend/src/services/api.js`, `USE_MOCK` is set to `true` by default:
```js
const USE_MOCK = true; // Switch to false for real API
```

Mock data includes 10 real SAM.gov vendors enriched with realistic scores, certifications, contract history, and agency relationships.

See [SWITCHING_TO_REAL_APIS.md](./SWITCHING_TO_REAL_APIS.md) for full instructions on enabling live data.

---

## 🏗️ Project Structure
```
supplier-risk-scorer/
├── backend/
│   ├── main.py                   # FastAPI app + all endpoints
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── sam_gov.py            # SAM.gov API integration
│       ├── scorer.py             # Risk + diversity scoring engine
│       └── ai_summary.py        # Claude AI summary generation
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── SearchBar.jsx     # Searchable NAICS dropdown + state selector
│       │   ├── SupplierCard.jsx  # Supplier card with compare checkbox
│       │   ├── FilterPanel.jsx   # Risk score + certification filters
│       │   ├── RiskScoreBadge.jsx
│       │   └── ChatBubble.jsx    # Floating AI chat assistant
│       ├── pages/
│       │   ├── Search.jsx        # Main search page with all features
│       │   └── SupplierDetail.jsx
│       ├── data/
│       │   └── naics.js          # Top 50 federal NAICS codes
│       ├── services/api.js       # API client (mock/real toggle)
│       └── mock/                 # Mock data (suppliers, spending, SBA)
├── render.yaml                   # Render.com deployment config
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

## 💬 Procurement Chat Assistant

The floating chat bubble (bottom-right) is powered by Claude and can answer:
- Questions about the suppliers currently shown on screen (e.g. "Which supplier has the highest risk score?")
- General federal procurement questions (e.g. "What is an 8(a) certification?", "How does HUBZone work?")
- Comparison questions (e.g. "Which supplier would be best for a DoD contract?")

The assistant is context-aware — it receives the current supplier data with every message.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Python + FastAPI + uvicorn |
| AI | Anthropic Claude (claude-sonnet-4-5) |
| Vendor Data | SAM.gov API |
| Contract Data | USASpending.gov API |
| Certifications | SBA DSBS API |
| Deployment | Render (backend) + Vercel (frontend) |

---

## ⚠️ Disclaimer

This project is created for educational and portfolio purposes using publicly available data from US government sources including SAM.gov, USASpending.gov, and the SBA. The information provided is for general guidance only and should not be considered official procurement advice. Risk and diversity scores are algorithmically generated estimates and do not represent official government assessments. Always verify supplier information directly through official government systems before making procurement decisions.

---

## 👨‍💻 Developer

**Kedar Kulkarni**  
🔗 [linkedin.com/in/kedar-kulkarni](https://www.linkedin.com/in/kedar-kulkarni/)
