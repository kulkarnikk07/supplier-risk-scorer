# Supplier Risk Scorer

An AI-powered supplier discovery and risk scoring app for government procurement.

## Features
- Search suppliers by category, location, and diversity status
- Score suppliers on past performance and risk
- Data from SAM.gov, USASpending.gov, and SBA DSBS

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI
- **AI:** Claude API (Anthropic)
- **Database:** Supabase

## Setup
### Backend
cd backend
venv\Scripts\Activate.ps1
uvicorn main:app --reload

### Frontend
cd frontend
npm run dev