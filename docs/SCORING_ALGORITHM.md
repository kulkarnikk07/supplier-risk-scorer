# 🤖 Scoring Algorithm
## Supplier Risk Scorer

**Version:** 1.0  
**Author:** Kedar Kulkarni  
**Last Updated:** March 2026  

---

## 1. Overview

The Supplier Risk Scorer uses two independent scoring algorithms to evaluate federal vendors:

| Score | Range | Purpose |
|---|---|---|
| **Risk Score** | 0–100 | Measures vendor reliability and trustworthiness |
| **Diversity Score** | 0–100 | Measures small business certification eligibility |

Both scores are calculated algorithmically from vendor data sourced from SAM.gov, USASpending.gov, and the SBA. They are designed to give procurement professionals an instant, objective assessment of a vendor's suitability for federal contracting.

---

## 2. Risk Score Algorithm

### 2.1 Purpose
The Risk Score answers the question:

> *"How reliable and trustworthy is this vendor for federal contracting?"*

A high risk score means the vendor is **low risk** — they are actively registered, have valid credentials, and have a proven track record of federal contract performance.

A low risk score means the vendor may have gaps — expired registration, missing identifiers, or no contract history — that could make them a risky choice for a contracting officer.

### 2.2 Scoring Factors

#### Factor 1 — Active Registration (20 points)
```
IF registration_status == "Active"
    THEN +20 points
    ELSE +0 points
```

**Why it matters:**  
Vendors must maintain an active SAM.gov registration to be eligible for federal contracts. An inactive or expired registration disqualifies a vendor from receiving awards. This is the most fundamental eligibility check.

**Data source:** SAM.gov `registrationStatus` field

---

#### Factor 2 — Registration Expiration (15 points)
```
IF expiration_date > TODAY + 6 months
    THEN +15 points
ELSE IF expiration_date > TODAY
    THEN +7 points
ELSE
    THEN +0 points
```

**Why it matters:**  
Contracts often run for multiple years. A vendor whose registration expires in 30 days poses a risk — if they forget to renew, they lose contract eligibility mid-performance. Contracting officers prefer vendors with registrations that won't expire during contract performance.

**Data source:** SAM.gov `registrationExpirationDate` field

---

#### Factor 3 — Contract History (25 points)
```
IF contract_count >= 10
    THEN +25 points
ELSE IF contract_count >= 5
    THEN +15 points
ELSE IF contract_count >= 1
    THEN +10 points
ELSE
    THEN +0 points
```

**Why it matters:**  
Past performance is one of the most important evaluation criteria in federal procurement. A vendor with a strong contract history has demonstrated they can successfully deliver on federal contracts. This is the highest-weighted factor because past performance is the strongest predictor of future performance.

**Data source:** USASpending.gov contract awards data

---

#### Factor 4 — Agency Relationships (15 points)
```
IF len(agencies_served) >= 3
    THEN +15 points
ELSE IF len(agencies_served) >= 2
    THEN +10 points
ELSE IF len(agencies_served) >= 1
    THEN +5 points
ELSE
    THEN +0 points
```

**Why it matters:**  
Vendors who have successfully worked with multiple federal agencies demonstrate broad experience and adaptability. An agency relationship signals that the vendor has passed security checks, understood agency-specific requirements, and delivered results — across different environments.

**Data source:** USASpending.gov `awarding_agency` field

---

#### Factor 5 — CAGE Code (10 points)
```
IF cage_code IS NOT NULL AND cage_code != ""
    THEN +10 points
    ELSE +0 points
```

**Why it matters:**  
A CAGE (Commercial and Government Entity) code is a 5-character identifier assigned by the Defense Logistics Agency. It is required for DoD contracts and many civilian agency contracts. Its presence indicates the vendor has engaged seriously with the federal procurement system.

**Data source:** SAM.gov `cageCode` field

---

#### Factor 6 — UEI (15 points)
```
IF uei IS NOT NULL AND uei != ""
    THEN +15 points
    ELSE +0 points
```

**Why it matters:**  
The UEI (Unique Entity Identifier) replaced the DUNS number in April 2022 as the primary identifier for federal vendors. All vendors receiving federal awards must have a valid UEI. Its presence is a strong signal that the vendor is properly registered and current with federal requirements.

**Data source:** SAM.gov `ueiSAM` field

---

### 2.3 Risk Score Summary Table

| Factor | Max Points | Data Source |
|---|---|---|
| Active Registration | 20 | SAM.gov |
| Registration Expiration > 6 months | 15 | SAM.gov |
| Contract History | 25 | USASpending.gov |
| Agency Relationships | 15 | USASpending.gov |
| CAGE Code Present | 10 | SAM.gov |
| UEI Present | 15 | SAM.gov |
| **Total** | **100** | |

---

### 2.4 Risk Score Interpretation

| Score | Rating | Recommended Action |
|---|---|---|
| 90–100 | ⭐ Excellent | Strong candidate — proceed with confidence |
| 75–89 | ✅ Good | Solid vendor — minor verification recommended |
| 60–74 | ⚠️ Fair | Review gaps before proceeding |
| 40–59 | 🔶 Poor | Significant gaps — thorough due diligence required |
| 0–39 | ❌ High Risk | Major concerns — verify all factors before considering |

---

### 2.5 Risk Score Code Implementation
```python
def calculate_risk_score(supplier: dict) -> int:
    score = 0

    # Factor 1 — Active Registration (20 pts)
    if supplier.get("registration_status") == "Active":
        score += 20

    # Factor 2 — Expiration Date (15 pts)
    expiry = supplier.get("expiration_date")
    if expiry:
        from datetime import datetime, timedelta
        try:
            exp_date = datetime.strptime(expiry, "%Y-%m-%d")
            today = datetime.today()
            if exp_date > today + timedelta(days=180):
                score += 15
            elif exp_date > today:
                score += 7
        except ValueError:
            pass

    # Factor 3 — Contract History (25 pts)
    contract_count = supplier.get("contract_count", 0)
    if contract_count >= 10:
        score += 25
    elif contract_count >= 5:
        score += 15
    elif contract_count >= 1:
        score += 10

    # Factor 4 — Agency Relationships (15 pts)
    agencies = supplier.get("agencies_served", [])
    if len(agencies) >= 3:
        score += 15
    elif len(agencies) >= 2:
        score += 10
    elif len(agencies) >= 1:
        score += 5

    # Factor 5 — CAGE Code (10 pts)
    if supplier.get("cage_code"):
        score += 10

    # Factor 6 — UEI (15 pts)
    if supplier.get("uei"):
        score += 15

    return min(score, 100)
```

---

## 3. Diversity Score Algorithm

### 3.1 Purpose
The Diversity Score answers the question:

> *"How many set-aside contract opportunities is this vendor eligible for?"*

The federal government reserves certain contracts specifically for certified small businesses. Each certification a vendor holds opens up new contract opportunities that larger competitors cannot bid on. A high diversity score means the vendor has maximum set-aside eligibility.

### 3.2 Certifications and Point Values

Each certification adds **20 points** to the diversity score. The score is **capped at 100**.

#### Certification 1 — 8(a) Business Development (20 points)
```
IF "8(a)" IN certifications
    THEN +20 points
```

**What it is:**  
The SBA's 8(a) Business Development Program supports small businesses owned by socially and economically disadvantaged individuals. Named after Section 8(a) of the Small Business Act.

**Who qualifies:**  
Businesses at least 51% owned by US citizens who are socially disadvantaged (often based on racial/ethnic background) and economically disadvantaged (net worth under $750K excluding home and business).

**Why it matters:**  
8(a) vendors can receive sole-source contracts up to $4.5M for services and $7M for manufacturing — meaning they can win contracts without competitive bidding in some cases.

---

#### Certification 2 — WOSB (20 points)
```
IF "WOSB" IN certifications
    THEN +20 points
```

**What it is:**  
Women-Owned Small Business certification under the SBA's WOSB Federal Contracting Program.

**Who qualifies:**  
Small businesses at least 51% owned and controlled by one or more women who are US citizens.

**Why it matters:**  
The federal government has a 5% annual spending goal for WOSB contracts. Contracting officers can set aside contracts specifically for WOSBs in industries where women are underrepresented.

---

#### Certification 3 — EDWOSB (20 points)
```
IF "EDWOSB" IN certifications
    THEN +20 points
```

**What it is:**  
Economically Disadvantaged Women-Owned Small Business — a subset of WOSB for lower-income women business owners.

**Who qualifies:**  
WOSB owners with personal net worth under $850K, adjusted gross income under $400K, and total assets under $6.5M.

**Why it matters:**  
EDWOSB vendors are eligible for a wider range of set-aside contracts than standard WOSB vendors, including industries where women are not underrepresented.

---

#### Certification 4 — HUBZone (20 points)
```
IF "HUBZone" IN certifications
    THEN +20 points
```

**What it is:**  
Historically Underutilized Business Zone certification — for businesses located in designated economically distressed areas.

**Who qualifies:**  
Small businesses with a principal office in a HUBZone area and at least 35% of employees living in a HUBZone.

**Why it matters:**  
The federal government has a 3% annual spending goal for HUBZone contracts. HUBZone vendors also receive a 10% price evaluation preference in full and open competitions — meaning they can win even if their bid is up to 10% higher than competitors.

---

#### Certification 5 — SDVOSB (20 points)
```
IF "SDVOSB" IN certifications
    THEN +20 points
```

**What it is:**  
Service-Disabled Veteran-Owned Small Business certification.

**Who qualifies:**  
Small businesses at least 51% owned by one or more service-disabled veterans — veterans with a disability connected to their military service.

**Why it matters:**  
The federal government has a 3% annual spending goal for SDVOSB contracts. The VA (Department of Veterans Affairs) gives SDVOSB vendors priority in their procurement — called the "Rule of Two."

---

#### Certification 6 — VOSB (20 points)
```
IF "VOSB" IN certifications
    THEN +20 points
```

**What it is:**  
Veteran-Owned Small Business certification.

**Who qualifies:**  
Small businesses at least 51% owned by one or more veterans of the US Armed Forces.

**Why it matters:**  
VOSB vendors receive preference in VA procurements and are eligible for certain set-aside contracts across the federal government.

---

#### Certification 7 — SDB (20 points)
```
IF "SDB" IN certifications
    THEN +20 points
```

**What it is:**  
Small Disadvantaged Business designation.

**Who qualifies:**  
Small businesses at least 51% owned by socially and economically disadvantaged individuals. Similar to 8(a) but broader — includes businesses that are not enrolled in the 8(a) program.

**Why it matters:**  
The federal government has a 12% annual spending goal for SDB contracts. SDB designation can provide price evaluation benefits in certain procurements.

---

### 3.3 Diversity Score Summary Table

| Certification | Points | Federal Spending Goal |
|---|---|---|
| 8(a) | 20 | Sole-source eligible |
| WOSB | 20 | 5% of annual spend |
| EDWOSB | 20 | Broader than WOSB |
| HUBZone | 20 | 3% + 10% price preference |
| SDVOSB | 20 | 3% + VA Rule of Two |
| VOSB | 20 | VA preference |
| SDB | 20 | 12% of annual spend |
| **Max Total** | **100** | Capped at 100 |

---

### 3.4 Diversity Score Interpretation

| Score | Certifications | Meaning |
|---|---|---|
| 100 | 5+ | Maximum set-aside eligibility |
| 80 | 4 | Very high eligibility |
| 60 | 3 | Strong eligibility |
| 40 | 2 | Moderate eligibility |
| 20 | 1 | Basic eligibility |
| 0 | 0 | No set-aside eligibility |

---

### 3.5 Diversity Score Code Implementation
```python
def calculate_diversity_score(supplier: dict) -> int:
    score = 0
    certifications = supplier.get("certifications", [])

    certification_points = {
        "8(a)":    20,
        "WOSB":    20,
        "EDWOSB":  20,
        "HUBZone": 20,
        "SDVOSB":  20,
        "VOSB":    20,
        "SDB":     20,
    }

    for cert, points in certification_points.items():
        if cert in certifications:
            score += points

    return min(score, 100)
```

---

## 4. Combined Scoring Function
```python
def score_supplier(supplier: dict) -> dict:
    """
    Master function — calculates both scores
    and returns enriched supplier object
    """
    risk_score = calculate_risk_score(supplier)
    diversity_score = calculate_diversity_score(supplier)

    return {
        **supplier,
        "risk_score": risk_score,
        "diversity_score": diversity_score,
    }
```

---

## 5. Scoring Examples

### Example 1 — High Performing Vendor

**Vendor:** TALOS Group Inc.
```
Registration Status:  Active          → +20
Expiration Date:      2027-03-01      → +15 (> 6 months)
Contract Count:       28              → +25 (>= 10)
Agencies Served:      DoD, DHS, GSA  → +15 (>= 3)
CAGE Code:            19T76           → +10
UEI:                  VMPJF3P46H73   → +15
                                     ─────
Risk Score:                            100

Certifications:       SDVOSB         → +20
                                     ─────
Diversity Score:                       20
```

---

### Example 2 — Diverse Vendor

**Vendor:** PATRIOT VENTURES & CONSULTING, LLC
```
Registration Status:  Active          → +20
Expiration Date:      2027-02-26      → +15 (> 6 months)
Contract Count:       5               → +15 (>= 5)
Agencies Served:      HHS             → +5  (>= 1)
CAGE Code:            19SB0           → +10
UEI:                  QRUGA5ZCLXR3   → +15
                                     ─────
Risk Score:                            80

Certifications:       8(a), HUBZone, SDB → +60
                                         ─────
Diversity Score:                           60
```

---

### Example 3 — Lower Scoring Vendor

**Vendor:** Misfit Athletics LLC
```
Registration Status:  Active          → +20
Expiration Date:      2027-03-08      → +15 (> 6 months)
Contract Count:       2               → +10 (>= 1)
Agencies Served:      DoD             → +5  (>= 1)
CAGE Code:            19QR1           → +10
UEI:                  HT66X17MV8B1   → +15
                                     ─────
Risk Score:                            75

Certifications:       None            → +0
                                      ─────
Diversity Score:                        0
```

---

## 6. Algorithm Design Decisions

### Why is Contract History weighted highest (25 points)?
Past performance is the strongest predictor of future performance in federal contracting. The FAR (Federal Acquisition Regulation) requires contracting officers to evaluate past performance for most contracts. A vendor with zero contract history represents unknown risk — no matter how good their registration looks.

### Why is Active Registration weighted second (20 points)?
Without an active SAM.gov registration a vendor simply cannot receive federal contracts. It is the most basic eligibility gate. Vendors with inactive registrations should be immediately flagged.

### Why is UEI weighted at 15 points?
The UEI replaced DUNS in 2022 and is now the primary federal vendor identifier. Its presence confirms the vendor is current with modern federal requirements. Vendors still using legacy identifiers or missing UEI may have outdated registrations.

### Why cap the Diversity Score at 100?
The diversity score measures eligibility breadth, not depth. Having 5 certifications doesn't make a vendor 5x better than one with 1 certification — it just means more contract opportunities. Capping at 100 keeps the score consistent and comparable with the risk score.

### Why 20 points per certification?
With 7 certifications available, 20 points each (capped at 100) means a vendor needs 5 certifications for a perfect diversity score. This is intentional — it rewards highly certified vendors without making a perfect score trivially easy to achieve.

---

## 7. Limitations and Future Improvements

| Limitation | Impact | Planned Fix |
|---|---|---|
| Contract count from mock data | Scores may not reflect real history | Connect USASpending.gov API in v1.1 |
| No financial health check | Vendor financial stability not scored | Add revenue/size factors in v1.1 |
| Binary certification check | Doesn't check certification expiry | Add expiry date validation in v1.1 |
| No performance rating | Past performance quality not measured | Integrate CPARS data in v2.0 |
| Equal certification weights | All certs weighted equally | Adjust weights by contract value in v2.0 |

---

## 8. Glossary

| Term | Definition |
|---|---|
| SAM.gov | System for Award Management — official federal vendor registration database |
| UEI | Unique Entity Identifier — replaced DUNS as primary federal vendor ID in 2022 |
| CAGE Code | Commercial and Government Entity code — 5-character DoD vendor identifier |
| NAICS | North American Industry Classification System — industry classification codes |
| FAR | Federal Acquisition Regulation — rules governing federal procurement |
| Set-Aside | Contract reserved for specific vendor categories (e.g. WOSB, HUBZone) |
| CPARS | Contractor Performance Assessment Reporting System — federal past performance database |
| FPDS | Federal Procurement Data System — database of all federal contract actions |
| Sole-Source | Contract awarded without competition — requires justification |
| Rule of Two | VA policy requiring set-aside if 2+ SDVOSBs can perform the work |