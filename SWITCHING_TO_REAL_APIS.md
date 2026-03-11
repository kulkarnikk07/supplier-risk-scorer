# 🔌 Switching to Real APIs

By default, the app runs in **mock mode** using local JSON files. This guide walks you through enabling live data from all three sources.

---

## Step 1 — SAM.gov (Vendor Search)

### Get your API key
1. Register at [https://sam.gov](https://sam.gov)
2. Request a System Account with API access
3. Your key will be emailed — it rotates every 90 days

### Add to .env
```
SAM_API_KEY=your_key_here
```

### Rate limits
- **10 requests/day** for non-federal users
- Plan searches carefully — mock mode is better for development

---

## Step 2 — USASpending.gov (Contract History)

No API key needed. The API is fully public.

The backend endpoint to integrate is:
```
POST https://api.usaspending.gov/api/v2/search/spending_by_award/
```

Filter by `recipient_uei` to get contract history per vendor.

---

## Step 3 — SBA DSBS (Certifications)

### Get your API key
1. Go to [https://sba.gov](https://sba.gov) and request DSBS API access
2. Add to `.env`:
```
SBA_API_KEY=your_key_here
```

---

## Step 4 — Enable Real API in Frontend

Open `frontend/src/services/api.js` and change:
```js
const USE_MOCK = true;
```
to:
```js
const USE_MOCK = false;
```

Save and restart the frontend with `npm run dev`.

---

## Step 5 — Enable Real API in Backend

The backend `main.py` already calls `sam_gov.py` when `USE_MOCK = false`.

Make sure your `.env` file has all keys filled in and restart:
```bash
uvicorn main:app --reload
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| SAM.gov returns empty results | Check your API key hasn't expired (90 day rotation) |
| 403 from SAM.gov | Key not yet activated — wait 24hrs after registration |
| No contract data | USASpending join by UEI — verify UEI is valid |
| AI summary fails | Check `ANTHROPIC_API_KEY` in `.env` |