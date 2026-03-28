# 📋 Product Requirements Document (PRD)
## Supplier Risk Scorer

**Version:** 1.0  
**Author:** Kedar Kulkarni  
**Last Updated:** March 2026  
**Status:** Active Development  

---

## 1. Executive Summary

Supplier Risk Scorer is an AI-powered federal procurement tool that helps contracting officers, small business advisors, and procurement professionals discover, evaluate, and compare federal vendors. It aggregates data from multiple US government sources and uses Claude AI to generate plain-English risk assessments — reducing vendor evaluation time from hours to minutes.

---

## 2. Problem Statement

Federal procurement is a $700+ billion industry. Despite this scale, procurement professionals still rely on manual, time-consuming processes to evaluate vendors:

- Searching SAM.gov manually by NAICS code and state
- Cross-referencing USASpending.gov for contract history
- Verifying SBA certifications across multiple systems
- Writing procurement justifications from scratch

There is no single tool that aggregates, scores, and explains vendor data in plain English — leaving procurement teams inefficient and prone to error.

---

## 3. Goals and Objectives

| Goal | Success Metric |
|---|---|
| Reduce vendor evaluation time | From hours to under 5 minutes |
| Surface certified small businesses | Diversity score visible on every card |
| Enable side-by-side vendor comparison | Compare up to 3 vendors simultaneously |
| Provide AI-powered procurement guidance | AI summary and chat assistant available |
| Export results for reporting | CSV export working for results and comparisons |

---

## 4. Target Users

### Primary Users
| User | Description | Pain Point Solved |
|---|---|---|
| Contracting Officers | Federal employees awarding contracts | Manual vendor research |
| Small Business Advisors | SBA counselors helping vendors | Understanding vendor positioning |
| Procurement Analysts | Teams comparing vendors | No unified comparison tool |

### Secondary Users
| User | Description |
|---|---|
| GovTech Developers | Developers building on government APIs |
| Researchers | Academics studying federal procurement trends |
| Small Business Owners | Vendors checking their own profile |

---

## 5. Features and Requirements

### 5.1 Core Features

#### F1 — Supplier Search
- **Description:** Search federal vendors by NAICS code and state
- **Priority:** P0 (Must Have)
- **Requirements:**
  - Searchable NAICS dropdown with top 50 federal codes
  - State selector for all US states
  - Returns up to 10 suppliers per search
  - Mock data mode for demo without API keys

#### F2 — Risk Scoring
- **Description:** Algorithmically score each supplier on reliability
- **Priority:** P0 (Must Have)
- **Requirements:**
  - Score from 0–100 based on 6 factors
  - Displayed prominently on supplier card
  - Color coded (green/yellow/red)

#### F3 — Diversity Scoring
- **Description:** Score suppliers on small business certifications
- **Priority:** P0 (Must Have)
- **Requirements:**
  - Score from 0–100 based on certifications held
  - Certifications displayed as badges
  - Supports 8(a), WOSB, EDWOSB, HUBZone, SDVOSB, VOSB, SDB

#### F4 — Supplier Detail Page
- **Description:** Full profile view for each supplier
- **Priority:** P0 (Must Have)
- **Requirements:**
  - Registration details, expiration, CAGE, UEI
  - Contract history table
  - Agencies served
  - Score breakdowns
  - AI summary generation

#### F5 — Side-by-Side Comparison
- **Description:** Compare up to 3 suppliers simultaneously
- **Priority:** P1 (Should Have)
- **Requirements:**
  - Checkbox on each card to add to compare list
  - Fixed compare bar at bottom of screen
  - Comparison modal with all key metrics
  - Best score highlighted in green with star
  - Export comparison to CSV

#### F6 — AI Summaries
- **Description:** Claude-generated procurement analysis per supplier
- **Priority:** P1 (Should Have)
- **Requirements:**
  - Single button click on detail page
  - Plain English assessment
  - Highlights strengths, risks, suitability

#### F7 — Procurement Chat Assistant
- **Description:** Floating AI chat bubble for procurement Q&A
- **Priority:** P1 (Should Have)
- **Requirements:**
  - Context-aware — knows current suppliers on screen
  - Answers questions about displayed suppliers
  - Answers general federal procurement questions
  - Markdown rendering for formatted responses
  - Typing indicator while loading

#### F8 — Filters
- **Description:** Filter search results by score and certifications
- **Priority:** P1 (Should Have)
- **Requirements:**
  - Minimum risk score slider
  - Certification multi-select filter
  - Reset filters clears results and returns to initial state

#### F9 — CSV Export
- **Description:** Export results or comparisons to CSV
- **Priority:** P2 (Nice to Have)
- **Requirements:**
  - Export all filtered results
  - Export comparison table
  - Filename includes date

### 5.2 Non-Functional Requirements

| Requirement | Description |
|---|---|
| Performance | Search results load within 2 seconds in mock mode |
| Responsiveness | Works on desktop and tablet screens |
| Accessibility | Readable color contrast, keyboard navigable |
| Security | API keys stored in environment variables, never in code |
| Maintainability | Mock/real API toggle with single flag |

---

## 6. Out of Scope (v1.0)

- User authentication and saved searches
- Real-time SAM.gov data (mock data only in v1.0)
- Email notifications
- Mobile app
- Multi-language support
- Integration with procurement systems (e.g. FPDS)

---

## 7. Future Roadmap

### v1.1
- Add all 50 US states to search
- Expand mock data to 50+ suppliers
- Add NAICS code descriptions to supplier cards

### v1.2
- Switch to real SAM.gov, USASpending, and SBA APIs
- Add pagination for large result sets
- Add saved searches with user accounts

### v2.0
- Integration with FPDS (Federal Procurement Data System)
- Contract opportunity matching
- Vendor self-assessment portal

---

## 8. Assumptions and Constraints

| Item | Detail |
|---|---|
| Data | Mock data used in v1.0 — real APIs available via toggle |
| API Limits | SAM.gov limits non-federal users to 10 requests/day |
| AI Cost | Anthropic API has per-token pricing — chat and summaries incur cost |
| Hosting | Free tier on Render (backend may sleep after inactivity) |

---

## 9. Dependencies

| Dependency | Purpose |
|---|---|
| SAM.gov API | Vendor registration data |
| USASpending.gov API | Contract award history |
| SBA DSBS API | Small business certifications |
| Anthropic Claude API | AI summaries and chat assistant |
| Render.com | Backend hosting |
| Vercel | Frontend hosting |