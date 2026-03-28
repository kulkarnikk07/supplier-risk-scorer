# 📖 User Documentation
## Supplier Risk Scorer

**Version:** 1.0  
**Author:** Kedar Kulkarni  
**Last Updated:** March 2026  

---

## Welcome to Supplier Risk Scorer

Supplier Risk Scorer helps you discover, evaluate, and compare federal vendors quickly and easily. This guide will walk you through every feature of the app — no technical knowledge required.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Searching for Suppliers](#searching-for-suppliers)
3. [Understanding Supplier Cards](#understanding-supplier-cards)
4. [Risk and Diversity Scores](#risk-and-diversity-scores)
5. [Filtering Results](#filtering-results)
6. [Viewing Supplier Details](#viewing-supplier-details)
7. [AI Procurement Summary](#ai-procurement-summary)
8. [Comparing Suppliers](#comparing-suppliers)
9. [Exporting to CSV](#exporting-to-csv)
10. [Procurement Chat Assistant](#procurement-chat-assistant)
11. [Resetting Your Search](#resetting-your-search)
12. [Frequently Asked Questions](#frequently-asked-questions)

---

## 1. Getting Started

When you open the app you will see the main search screen with:

- A **blue header** with the app name and an About button
- A **search bar** with a NAICS code dropdown and state selector
- An **initial prompt** to enter a NAICS code and state

No login or account is required to use the app.

---

## 2. Searching for Suppliers

### Step 1 — Select a NAICS Code
NAICS codes classify businesses by industry. Click the **NAICS Code dropdown** to open it.

You can:
- **Scroll** through the list of 50 federal NAICS codes
- **Type** a code number (e.g. 541512) to filter the list
- **Type** a description (e.g. "cyber" or "IT") to find relevant codes

**Common NAICS codes for federal contracting:**

| Code | Description |
|---|---|
| 541512 | Computer Systems Design Services |
| 541511 | Custom Computer Programming |
| 541330 | Engineering Services |
| 541611 | Administrative Management Consulting |
| 561621 | Security Systems Services |

### Step 2 — Select a State
Click the **State dropdown** and select the state you want to search in.

### Step 3 — Click Search
Click the **Search Suppliers** button. The app will load supplier results within a few seconds.

> 💡 **Tip:** Try NAICS code 541512 and Virginia (VA) to see a full set of results.

---

## 3. Understanding Supplier Cards

Each supplier is displayed as a card showing:

| Element | Description |
|---|---|
| **Company Name** | Legal name as registered in SAM.gov |
| **Location** | City and state |
| **CAGE Code** | Commercial and Government Entity code — unique vendor ID |
| **UEI** | Unique Entity Identifier — replaced DUNS number in 2022 |
| **Risk Score** | 0–100 reliability score |
| **Diversity Score** | 0–100 certification score |
| **Total Awards** | Total federal contract value |
| **Contracts** | Number of federal contracts awarded |
| **Agencies** | Number of federal agencies served |
| **Certifications** | Small business certification badges |
| **Expiration Date** | SAM.gov registration expiry date |
| **Status** | Active or Inactive registration |

Click anywhere on a card to view the full supplier profile.

---

## 4. Risk and Diversity Scores

### 🛡️ Risk Score (0–100)
Measures how reliable and trustworthy a vendor is for federal contracting.

| Score Range | Meaning |
|---|---|
| 80–100 | Low risk — strong vendor |
| 60–79 | Moderate risk — review carefully |
| 0–59 | Higher risk — verify before proceeding |

**How it's calculated:**

| Factor | Points |
|---|---|
| Active SAM.gov registration | 20 |
| Registration expires in 6+ months | 15 |
| Has federal contract history | 25 |
| Has served multiple agencies | 15 |
| CAGE code on file | 10 |
| UEI on file | 15 |
| **Total** | **100** |

### 🌟 Diversity Score (0–100)
Measures small business certifications that qualify vendors for set-aside contracts.

**Certifications and what they mean:**

| Certification | Full Name | Who Qualifies |
|---|---|---|
| 8(a) | SBA 8(a) Business Development | Socially and economically disadvantaged businesses |
| WOSB | Women-Owned Small Business | Women-owned and controlled businesses |
| EDWOSB | Economically Disadvantaged WOSB | Low-income women-owned businesses |
| HUBZone | Historically Underutilized Business Zone | Businesses in designated underserved areas |
| SDVOSB | Service-Disabled Veteran-Owned Small Business | Veterans with service-connected disabilities |
| VOSB | Veteran-Owned Small Business | Any veteran-owned business |
| SDB | Small Disadvantaged Business | Socially disadvantaged small businesses |

Each certification adds **20 points** to the diversity score, capped at 100.

> 💡 **Why this matters:** Federal agencies have set-aside contracts specifically for certified vendors. A high diversity score means more contract opportunities.

---

## 5. Filtering Results

After searching, a **filter panel** appears above the results.

### Risk Score Filter
Use the slider to set a **minimum risk score**. Only suppliers at or above this score will be shown.

Example: Set to 75 to see only high-reliability vendors.

### Certification Filter
Check one or more certifications to show only suppliers with those certifications.

Example: Check "WOSB" to see only women-owned businesses.

### Applying Filters
Filters apply **automatically** as you adjust them — no need to click a button.

The results summary shows:
```
Showing 4 of 10 suppliers | Filtered by risk score ≥ 75
```

---

## 6. Viewing Supplier Details

Click any supplier card to open their **full profile page**.

The detail page shows:

### Registration Information
- Full company name and location
- UEI and CAGE code
- Registration status and expiration date
- NAICS code and industry description

### Score Breakdown
- Risk score with individual factor breakdown
- Diversity score with certification list and expiry dates

### Contract History
A table showing:
- Total contract awards in dollars
- Number of contracts
- Federal agencies served
- Date of last award

### Back Navigation
Click **← Back to Results** to return to your search results. Your previous search and filters are preserved.

---

## 7. AI Procurement Summary

On the supplier detail page, click **🤖 Generate AI Summary** to get a plain-English procurement assessment.

### What the summary includes:
- Overall vendor reliability assessment
- Certification highlights and eligibility
- Contract history analysis
- Agency relationship summary
- Procurement suitability recommendation

### Example Summary:
> *"TALOS Group Inc. is a strong procurement candidate based in Charlottesville, VA. With a risk score of 91/100 and an active registration valid through March 2027, this vendor demonstrates exceptional reliability. Their SDVOSB certification makes them eligible for service-disabled veteran set-aside contracts. Having served DoD, DHS, and GSA across 28 contracts totaling $12.5M, they show deep federal experience. Highly recommended for IT services procurements."*

> ⏱️ The summary takes 5–10 seconds to generate.

---

## 8. Comparing Suppliers

You can compare up to **3 suppliers side by side**.

### Step 1 — Select Suppliers to Compare
Check the **Compare** checkbox in the top-right corner of each supplier card.

The card will highlight in blue when selected.

### Step 2 — Open the Comparison
A **blue bar** appears at the bottom of the screen showing selected suppliers.

Click **Compare Now →** to open the comparison table.

> ⚠️ You need at least 2 suppliers selected to compare.

### Step 3 — Review the Comparison Table
The table shows all key metrics side by side:
- Location, scores, certifications
- Total awards, contract count, agencies
- Last award date, CAGE code, expiration

**⭐ Green highlighting** shows the best value in each scored category automatically.

### Step 4 — Remove a Supplier
Click the **×** next to a supplier name in the blue bar to remove them from the comparison.

Click **Clear** to remove all suppliers and start over.

---

## 9. Exporting to CSV

### Export Search Results
Click the **⬇️ Export CSV** button in the results summary bar to download all filtered results as a CSV file.

### Export Comparison
Inside the comparison modal, click **⬇️ Export Comparison** to download the comparison table as a CSV file.

### What's in the CSV:
- Company name, city, state
- UEI, CAGE code
- Registration status and expiration
- Risk score, diversity score
- Certifications
- Total awards, contract count
- Agencies served
- Last award date

The file is named automatically:
```
suppliers_export_2026-03-16.csv
```

---

## 10. Procurement Chat Assistant

Click the **💬 blue bubble** in the bottom-right corner to open the AI procurement assistant.

### What you can ask:

**About suppliers on screen:**
- *"Which supplier has the highest risk score?"*
- *"Which vendors are HUBZone certified?"*
- *"Which supplier would be best for a DoD contract?"*
- *"Compare TALOS Group and KSGC Solutions for cybersecurity work"*

**General procurement questions:**
- *"What is an 8(a) certification?"*
- *"How does HUBZone designation work?"*
- *"What is the difference between WOSB and EDWOSB?"*
- *"What NAICS codes are used for cybersecurity services?"*

### Tips for better answers:
- Be specific — *"Which supplier has the most DoD experience?"* works better than *"Who is best?"*
- Ask follow-up questions — the assistant remembers the conversation history
- Ask for explanations — *"Explain what SDVOSB means and how it affects contract eligibility"*

### Closing the chat
Click the **×** button on the chat window or click the bubble again to close it.

> 💡 The chat assistant is context-aware — it automatically knows which suppliers are currently shown on your screen.

---

## 11. Resetting Your Search

Click the **🔄 Reset Filters** button to:
- Clear all active filters
- Remove all search results
- Return to the initial search screen

This is useful when you want to start a completely new search.

---

## 12. Frequently Asked Questions

**Q: Is this real government data?**  
A: The app currently runs on mock data based on real SAM.gov vendors. The scoring and certifications are realistic but not live. Real API mode is available — see the GitHub repo for instructions.

**Q: What is a NAICS code?**  
A: NAICS (North American Industry Classification System) codes classify businesses by industry. The federal government uses them to categorize contracts and search for vendors. For example, 541512 is Computer Systems Design Services.

**Q: What is SAM.gov?**  
A: System for Award Management — the official US government database where vendors must register to receive federal contracts. All legitimate federal vendors are registered here.

**Q: What does "Active" registration status mean?**  
A: The vendor's SAM.gov registration is current and valid. Vendors must renew annually. An expired registration means the vendor cannot currently receive federal contracts.

**Q: Why do scores matter?**  
A: A high risk score means a vendor is reliable and low-risk for contracting. A high diversity score means they qualify for more set-aside contract opportunities — which can be a competitive advantage.

**Q: Can I save my search results?**  
A: Not in v1.0. Use the CSV export to save results. Saved searches are planned for a future version.

**Q: Why is the chat slow sometimes?**  
A: The backend is hosted on Render's free tier, which sleeps after 15 minutes of inactivity. The first request after sleep may take 30–60 seconds to wake up. Subsequent requests are fast.

**Q: How do I report a bug or suggest a feature?**  
A: Open an issue on the GitHub repository or connect with the developer on LinkedIn.

---

## About

**Supplier Risk Scorer** is built and maintained by **Kedar Kulkarni**.

🔗 [linkedin.com/in/kedar-kulkarni](https://www.linkedin.com/in/kedar-kulkarni/)  
💻 [GitHub Repository](https://github.com/kulkarnikk07/supplier-risk-scorer)  


---

> ⚠️ **Disclaimer:** This application is created for educational and portfolio purposes using publicly available US government data. Information provided is for general guidance only and should not be considered official procurement advice. Always verify supplier information through official government systems before making procurement decisions.