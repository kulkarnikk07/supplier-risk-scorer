# 🔄 Data Flow Diagram
## Supplier Risk Scorer

**Version:** 1.0  
**Author:** Kedar Kulkarni  
**Last Updated:** March 2026  

---

## 1. System-Level Data Flow
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL DATA SOURCES                             │
│                                                                             │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐         │
│   │    SAM.gov      │   │ USASpending.gov │   │   SBA DSBS      │         │
│   │                 │   │                 │   │                 │         │
│   │ • UEI           │   │ • Contract $    │   │ • 8(a)          │         │
│   │ • CAGE Code     │   │ • Award Count   │   │ • WOSB          │         │
│   │ • Reg Status    │   │ • Agencies      │   │ • HUBZone       │         │
│   │ • Expiry Date   │   │ • Last Award    │   │ • SDVOSB        │         │
│   │ • Certifications│   │ • Award Dates   │   │ • VOSB          │         │
│   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘         │
└────────────┼────────────────────┼────────────────────┼────────────────────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                        Joined by UEI key
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND (Render)                            │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                        main.py                                      │  │
│   │                                                                     │  │
│   │   Incoming Request                                                  │  │
│   │   GET /api/suppliers?naics_code=541512&state=VA                     │  │
│   │              │                                                      │  │
│   │              ▼                                                      │  │
│   │   sam_gov.py → search_suppliers()                                   │  │
│   │              │                                                      │  │
│   │              ▼                                                      │  │
│   │   Raw Supplier Data []                                              │  │
│   │              │                                                      │  │
│   │              ▼                                                      │  │
│   │   scorer.py → score_supplier()                                      │  │
│   │   ┌──────────────────────────────┐                                 │  │
│   │   │  calculate_risk_score()      │                                 │  │
│   │   │  + calculate_diversity_score()│                                 │  │
│   │   └──────────────────────────────┘                                 │  │
│   │              │                                                      │  │
│   │              ▼                                                      │  │
│   │   Enriched Supplier Data []                                         │  │
│   │   { ...supplier, risk_score, diversity_score }                      │  │
│   │              │                                                      │  │
│   │              ▼                                                      │  │
│   │   Return JSON Response                                              │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND (Vercel)                                │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                        api.js                                       │  │
│   │                                                                     │  │
│   │   USE_MOCK = true                                                   │  │
│   │   ┌─────────────────────────────────────────────────────────────┐  │  │
│   │   │  Read local JSON files                                      │  │  │
│   │   │  suppliers.json + spending.json + sba.json                  │  │  │
│   │   │  Merge by UEI → Calculate scores → Return enriched data     │  │  │
│   │   └─────────────────────────────────────────────────────────────┘  │  │
│   │                                                                     │  │
│   │   USE_MOCK = false                                                  │  │
│   │   ┌─────────────────────────────────────────────────────────────┐  │  │
│   │   │  Call FastAPI backend                                       │  │  │
│   │   │  GET /api/suppliers?naics_code=X&state=Y                    │  │  │
│   │   │  Receive enriched suppliers []                              │  │  │
│   │   └─────────────────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│                                  ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                      Search.jsx                                     │  │
│   │                                                                     │  │
│   │   setSuppliers(data.suppliers)                                      │  │
│   │   setTotal(data.total)                                              │  │
│   │   setSearched(true)                                                 │  │
│   │              │                                                      │  │
│   │              ▼                                                      │  │
│   │   Apply Filters                                                     │  │
│   │   filteredSuppliers = suppliers.filter(                             │  │
│   │     risk_score >= minRiskScore AND                                  │  │
│   │     certifications includes selected                                │  │
│   │   )                                                                 │  │
│   │              │                                                      │  │
│   │              ▼                                                      │  │
│   │   Render SupplierCard × N                                           │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                         END USER BROWSER
```

---

## 2. Search Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH DATA FLOW                         │
└─────────────────────────────────────────────────────────────┘

USER ACTION
    │
    │  1. Selects NAICS code from dropdown
    │  2. Selects state from dropdown
    │  3. Clicks "Search Suppliers"
    │
    ▼
SearchBar.jsx
    │
    │  onSearch({
    │    naics_code: "541512",
    │    state: "VA"
    │  })
    │
    ▼
Search.jsx → handleSearch(params)
    │
    │  setLoading(true)
    │  setError(null)
    │
    ▼
api.js → searchSuppliers(params)
    │
    ├── [MOCK MODE] ──────────────────────────────────────────┐
    │                                                         │
    │   Read suppliers.json                                   │
    │        +                                                │
    │   Read spending.json                                    │
    │        +                                                │
    │   Read sba.json                                         │
    │        │                                                │
    │        ▼                                                │
    │   Merge by UEI:                                         │
    │   suppliers.map(s => ({                                 │
    │     ...s,                                               │
    │     ...spending[s.uei],                                 │
    │     ...sba[s.uei]                                       │
    │   }))                                                   │
    │        │                                                │
    │        ▼                                                │
    │   Calculate Scores (client-side)                        │
    │   risk_score = calculateRiskScore(supplier)             │
    │   diversity_score = calculateDiversityScore(supplier)   │
    │        │                                                │
    │        └──────────────────────────────────────────────▶│
    │                                                         │
    └── [REAL MODE] ──────────────────────────────────────────┤
                                                              │
        axios.get("/api/suppliers", { params })               │
             │                                                │
             ▼                                                │
        FastAPI Backend                                       │
             │                                                │
             ├── SAM.gov API call                             │
             ├── USASpending.gov API call                     │
             ├── SBA DSBS API call                            │
             ├── score_supplier() for each vendor             │
             └── Return enriched suppliers []                 │
                  │                                           │
                  └──────────────────────────────────────────▶│
                                                              │
                                          ┌───────────────────┘
                                          │
                                          ▼
                              Return {
                                total: 8011,
                                suppliers: [
                                  {
                                    uei, name, state, city,
                                    naics_code, cage_code,
                                    registration_status,
                                    expiration_date,
                                    risk_score,
                                    diversity_score,
                                    certifications[],
                                    total_awards,
                                    contract_count,
                                    agencies_served[],
                                    last_award_date
                                  },
                                  ...
                                ]
                              }
                                          │
                                          ▼
                              Search.jsx
                              setSuppliers(data.suppliers)
                              setTotal(data.total)
                              setSearched(true)
                              setLoading(false)
                                          │
                                          ▼
                              Render SupplierCard × N
```

---

## 3. AI Summary Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                  AI SUMMARY DATA FLOW                       │
└─────────────────────────────────────────────────────────────┘

USER ACTION
    │
    │  Clicks "🤖 Generate AI Summary" on detail page
    │
    ▼
SupplierDetail.jsx
    │
    │  POST /api/suppliers/summary
    │  Body: { ...supplier object }
    │
    ▼
FastAPI Backend → /api/suppliers/summary
    │
    ▼
ai_summary.py → generate_supplier_summary(supplier)
    │
    │  Build prompt:
    │  ┌────────────────────────────────────────────────────┐
    │  │ "You are a federal procurement expert. Analyze    │
    │  │  this supplier and provide a plain English        │
    │  │  procurement assessment:                          │
    │  │                                                   │
    │  │  Name: {name}                                     │
    │  │  Location: {city}, {state}                        │
    │  │  NAICS: {naics_code}                              │
    │  │  Risk Score: {risk_score}/100                     │
    │  │  Diversity Score: {diversity_score}/100           │
    │  │  Certifications: {certifications}                 │
    │  │  Total Awards: ${total_awards}                    │
    │  │  Contract Count: {contract_count}                 │
    │  │  Agencies: {agencies_served}                      │
    │  │  Expiration: {expiration_date}                    │
    │  │                                                   │
    │  │  Provide assessment in 3-4 sentences..."          │
    │  └────────────────────────────────────────────────────┘
    │
    ▼
Anthropic Claude API
    │
    │  POST https://api.anthropic.com/v1/messages
    │  Headers: { x-api-key: ANTHROPIC_API_KEY }
    │  Body: {
    │    model: "claude-sonnet-4-5",
    │    max_tokens: 1000,
    │    messages: [{ role: "user", content: prompt }]
    │  }
    │
    ▼
Claude Response
    │
    │  {
    │    content: [{
    │      type: "text",
    │      text: "KSGC Solutions LLC is a strong procurement
    │             candidate based in Herndon, VA..."
    │    }]
    │  }
    │
    ▼
FastAPI Backend
    │
    │  return { "summary": response.content[0].text }
    │
    ▼
SupplierDetail.jsx
    │
    │  setSummary(data.summary)
    │
    ▼
Render summary text in UI
```

---

## 4. Chat Assistant Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│               CHAT ASSISTANT DATA FLOW                      │
└─────────────────────────────────────────────────────────────┘

USER ACTION
    │
    │  Types message in chat bubble
    │  Clicks Send (or presses Enter)
    │
    ▼
ChatBubble.jsx
    │
    │  1. Add user message to messages[]
    │  2. setLoading(true)
    │
    ▼
Build System Prompt
    │
    │  ┌────────────────────────────────────────────────────┐
    │  │ systemPrompt = `                                  │
    │  │   You are a federal procurement assistant         │
    │  │   embedded in a Supplier Risk Scorer application. │
    │  │   You help users understand supplier data and     │
    │  │   answer general questions about US federal       │
    │  │   procurement, SAM.gov, certifications like       │
    │  │   8(a), WOSB, HUBZone, SDVOSB, and contracting   │
    │  │   best practices.                                 │
    │  │                                                   │
    │  │   Here is the current supplier data on screen:   │
    │  │   ${JSON.stringify(suppliers)}                    │
    │  │ `                                                 │
    │  └────────────────────────────────────────────────────┘
    │
    ▼
POST http://localhost:8000/api/chat
    │
    │  Body: {
    │    system: systemPrompt,
    │    messages: [
    │      { role: "user", content: "first message" },
    │      { role: "assistant", content: "first reply" },
    │      { role: "user", content: "current message" }
    │    ]
    │  }
    │
    ▼
FastAPI Backend → /api/chat
    │
    ▼
Anthropic Claude API
    │
    │  POST /v1/messages
    │  {
    │    model: "claude-sonnet-4-5",
    │    max_tokens: 1000,
    │    system: systemPrompt,
    │    messages: conversationHistory
    │  }
    │
    ▼
Claude Response
    │
    │  {
    │    content: [{
    │      type: "text",
    │      text: "TALOS Group Inc. has the highest
    │             risk score of 91/100..."
    │    }]
    │  }
    │
    ▼
FastAPI Backend
    │
    │  return { "reply": response.content[0].text }
    │
    ▼
ChatBubble.jsx
    │
    │  1. Add assistant reply to messages[]
    │  2. setLoading(false)
    │  3. Render with react-markdown
    │     (bullet points, bold text, headers)
    │
    ▼
User sees formatted response in chat window
```

---

## 5. Compare Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                  COMPARE DATA FLOW                          │
└─────────────────────────────────────────────────────────────┘

USER ACTION
    │
    │  Checks "Compare" checkbox on supplier card
    │
    ▼
SupplierCard.jsx
    │
    │  onChange={() => onCompare(supplier)}
    │
    ▼
Search.jsx → toggleCompare(supplier)
    │
    │  setCompareList(prev => {
    │    exists? → remove from list
    │    list.length >= 3? → alert + reject
    │    else → add to list
    │  })
    │
    ▼
compareList state updates
    │
    ├── Card highlights blue (isComparing = true)
    └── Compare bar appears at bottom
             │
             │  USER CLICKS "Compare Now →"
             │
             ▼
    setShowCompare(true)
             │
             ▼
    Compare Modal renders
             │
             │  For each row in comparison table:
             │  ┌──────────────────────────────────────┐
             │  │  best = Math.max(                    │
             │  │    ...compareList.map(s => s.value)  │
             │  │  )                                   │
             │  │                                      │
             │  │  isBest = value === best && best > 0 │
             │  │                                      │
             │  │  isBest → green + ⭐                 │
             │  └──────────────────────────────────────┘
             │
             ▼
    User sees side-by-side comparison
    with best scores highlighted
```

---

## 6. CSV Export Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                  CSV EXPORT DATA FLOW                       │
└─────────────────────────────────────────────────────────────┘

USER ACTION
    │
    ├── Clicks "⬇️ Export CSV" (search results)
    │   exportToCSV(filteredSuppliers)
    │
    └── Clicks "⬇️ Export Comparison" (compare modal)
        exportToCSV(compareList)
                    │
                    ▼
        exportToCSV(suppliers[])
                    │
                    │  1. Define headers[]
                    │  2. Map suppliers to rows[]
                    │  3. Wrap values in quotes
                    │  4. Join with commas
                    │  5. Join rows with newlines
                    │
                    ▼
        Build CSV string
                    │
                    ▼
        new Blob([csvContent], {
          type: "text/csv;charset=utf-8;"
        })
                    │
                    ▼
        URL.createObjectURL(blob)
                    │
                    ▼
        Create <a> element
        href = objectURL
        download = "suppliers_export_2026-03-16.csv"
        link.click()
                    │
                    ▼
        Browser downloads CSV file
                    │
                    ▼
        URL.revokeObjectURL(url)
        (cleanup memory)
```

---

## 7. Filter Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                   FILTER DATA FLOW                          │
└─────────────────────────────────────────────────────────────┘

USER ACTION
    │
    ├── Moves risk score slider
    └── Checks certification checkbox
                    │
                    ▼
        FilterPanel.jsx
                    │
                    │  onChange(newFilters)
                    │
                    ▼
        Search.jsx
                    │
                    │  setFilters(newFilters)
                    │
                    ▼
        filteredSuppliers = suppliers.filter(supplier => {
                    │
                    ├── risk_score >= minRiskScore?
                    │   NO → exclude supplier
                    │
                    └── certifications selected?
                        supplier has any selected cert?
                        NO → exclude supplier
                        YES → include supplier
                    │
                    })
                    │
                    ▼
        Re-render SupplierCard × filteredSuppliers.length
                    │
                    ▼
        Update results summary:
        "Showing X of Y suppliers"
```

---

## 8. Navigation State Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│               NAVIGATION STATE DATA FLOW                    │
└─────────────────────────────────────────────────────────────┘

Search.jsx (Search Results)
    │
    │  User clicks supplier card
    │
    ▼
SupplierCard.jsx → handleClick()
    │
    │  navigate(`/supplier/${supplier.uei}`, {
    │    state: { supplier }
    │  })
    │
    ▼
React Router
    │
    ▼
SupplierDetail.jsx
    │
    │  const { state } = useLocation()
    │  const supplier = state.supplier
    │
    ▼
Render full supplier profile
    │
    │  User clicks "← Back to Results"
    │
    ▼
navigate(-1) OR navigate("/", {
  state: {
    suppliers,
    total,
    searched: true,
    filters
  }
})
    │
    ▼
Search.jsx re-renders
    │
    │  Restores previous state:
    │  suppliers, total, searched, filters
    │
    ▼
User sees original search results
(scroll position and filters preserved)
```

---

## 9. Mock Data Structure
```
┌─────────────────────────────────────────────────────────────┐
│                  MOCK DATA STRUCTURE                        │
└─────────────────────────────────────────────────────────────┘

suppliers.json
┌────────────────────────────────────────────────────────────┐
│  {                                                         │
│    "total": 8011,                                          │
│    "suppliers": [                                          │
│      {                                                     │
│        "uei": "X3VAV4RKB3J7",          ← Join key         │
│        "name": "KSGC SOLUTIONS LLC",                       │
│        "state": "VA",                                      │
│        "city": "Herndon",                                  │
│        "naics_code": "541512",                             │
│        "registration_status": "Active",                    │
│        "cage_code": "19NR1",                               │
│        "expiration_date": "2027-03-03",                    │
│        "certifications": ["WOSB", "SDB"]                   │
│      }                                                     │
│    ]                                                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘

spending.json
┌────────────────────────────────────────────────────────────┐
│  {                                                         │
│    "X3VAV4RKB3J7": {                  ← Keyed by UEI       │
│      "total_awards": 4200000,                              │
│      "contract_count": 12,                                 │
│      "agencies_served": ["DoD", "HHS"],                    │
│      "last_award_date": "2024-11-15"                       │
│    }                                                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘

sba.json
┌────────────────────────────────────────────────────────────┐
│  {                                                         │
│    "X3VAV4RKB3J7": {                  ← Keyed by UEI       │
│      "certifications": ["WOSB", "SDB"],                    │
│      "cert_expiry": {                                      │
│        "WOSB": "2026-08-15",                               │
│        "SDB": "2027-01-20"                                 │
│      }                                                     │
│    }                                                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘

Merge result (by UEI in api.js)
┌────────────────────────────────────────────────────────────┐
│  {                                                         │
│    "uei": "X3VAV4RKB3J7",                                  │
│    "name": "KSGC SOLUTIONS LLC",                           │
│    "state": "VA",                                          │
│    "city": "Herndon",                                      │
│    "naics_code": "541512",                                 │
│    "registration_status": "Active",                        │
│    "cage_code": "19NR1",                                   │
│    "expiration_date": "2027-03-03",                        │
│    "certifications": ["WOSB", "SDB"],    ← from suppliers  │
│    "total_awards": 4200000,              ← from spending   │
│    "contract_count": 12,                ← from spending   │
│    "agencies_served": ["DoD", "HHS"],   ← from spending   │
│    "last_award_date": "2024-11-15",     ← from spending   │
│    "cert_expiry": {...},                ← from sba        │
│    "risk_score": 82,                    ← calculated      │
│    "diversity_score": 75                ← calculated      │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

---

## 10. Error Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                   ERROR DATA FLOW                           │
└─────────────────────────────────────────────────────────────┘

API Request Fails
    │
    ├── Network Error (backend down)
    │       │
    │       ▼
    │   catch(err) in handleSearch()
    │       │
    │       ▼
    │   setError("Failed to fetch suppliers. Please try again.")
    │       │
    │       ▼
    │   Red error banner shown in UI
    │
    ├── SAM.gov API Error (key expired / rate limit)
    │       │
    │       ▼
    │   FastAPI returns { "error": "..." }
    │       │
    │       ▼
    │   Frontend checks "error" in results
    │       │
    │       ▼
    │   setError(results.error)
    │       │
    │       ▼
    │   Red error banner shown in UI
    │
    ├── Chat API Error (Anthropic failure)
    │       │
    │       ▼
    │   catch(err) in ChatBubble.jsx
    │       │
    │       ▼
    │   Add error message to messages[]:
    │   "Something went wrong. Please try again."
    │       │
    │       ▼
    │   Error shown as assistant message in chat
    │
    └── AI Summary Error (Claude failure)
            │
            ▼
        catch(err) in SupplierDetail.jsx
            │
            ▼
        setSummaryError("Failed to generate summary.")
            │
            ▼
        Error message shown below summary button
```