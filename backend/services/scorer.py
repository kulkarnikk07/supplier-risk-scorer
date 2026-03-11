from datetime import datetime, date

def calculate_risk_score(supplier: dict, awards: dict = None) -> dict:
    """
    Calculate risk score (0-100) for a supplier.
    Higher score = Lower risk = Better supplier
    """
    score = 0
    breakdown = {}

    # ─────────────────────────────────────────
    # 1. Active SAM Registration (20 pts)
    # ─────────────────────────────────────────
    if supplier.get("registration_status", "").lower() == "active":
        score += 20
        breakdown["active_registration"] = {
            "points": 20,
            "max": 20,
            "note": "Active SAM registration ✅"
        }
    else:
        breakdown["active_registration"] = {
            "points": 0,
            "max": 20,
            "note": "Inactive or missing registration ❌"
        }

    # ─────────────────────────────────────────
    # 2. Registration Not Expiring Soon (15 pts)
    # ─────────────────────────────────────────
    expiration_date = supplier.get("expiration_date", "")
    if expiration_date:
        try:
            exp = datetime.strptime(expiration_date, "%Y-%m-%d").date()
            days_until_expiry = (exp - date.today()).days
            if days_until_expiry > 180:
                score += 15
                breakdown["expiration"] = {
                    "points": 15,
                    "max": 15,
                    "note": f"Registration valid for {days_until_expiry} days ✅"
                }
            elif days_until_expiry > 90:
                score += 8
                breakdown["expiration"] = {
                    "points": 8,
                    "max": 15,
                    "note": f"Registration expiring in {days_until_expiry} days ⚠️"
                }
            else:
                breakdown["expiration"] = {
                    "points": 0,
                    "max": 15,
                    "note": f"Registration expiring soon ({days_until_expiry} days) ❌"
                }
        except ValueError:
            breakdown["expiration"] = {
                "points": 0,
                "max": 15,
                "note": "Could not parse expiration date"
            }
    else:
        breakdown["expiration"] = {
            "points": 0,
            "max": 15,
            "note": "No expiration date found"
        }

    # ─────────────────────────────────────────
    # 3. Past Contract Awards (25 pts)
    # ─────────────────────────────────────────
    if awards:
        contract_count = awards.get("contract_count", 0)
        total_awards = awards.get("total_awards", 0)

        if contract_count >= 10:
            score += 25
            breakdown["past_awards"] = {
                "points": 25,
                "max": 25,
                "note": f"Strong history: {contract_count} contracts ✅"
            }
        elif contract_count >= 5:
            score += 15
            breakdown["past_awards"] = {
                "points": 15,
                "max": 25,
                "note": f"Moderate history: {contract_count} contracts ⚠️"
            }
        elif contract_count >= 1:
            score += 8
            breakdown["past_awards"] = {
                "points": 8,
                "max": 25,
                "note": f"Limited history: {contract_count} contracts ⚠️"
            }
        else:
            breakdown["past_awards"] = {
                "points": 0,
                "max": 25,
                "note": "No contract history found ❌"
            }
    else:
        breakdown["past_awards"] = {
            "points": 0,
            "max": 25,
            "note": "No award data available ❌"
        }

    # ─────────────────────────────────────────
    # 4. Multiple Agency Relationships (15 pts)
    # ─────────────────────────────────────────
    if awards:
        agencies = awards.get("agencies_served", [])
        if len(agencies) >= 3:
            score += 15
            breakdown["agencies"] = {
                "points": 15,
                "max": 15,
                "note": f"Works with {len(agencies)} agencies ✅"
            }
        elif len(agencies) >= 2:
            score += 10
            breakdown["agencies"] = {
                "points": 10,
                "max": 15,
                "note": f"Works with {len(agencies)} agencies ⚠️"
            }
        elif len(agencies) == 1:
            score += 5
            breakdown["agencies"] = {
                "points": 5,
                "max": 15,
                "note": "Only 1 agency relationship ⚠️"
            }
        else:
            breakdown["agencies"] = {
                "points": 0,
                "max": 15,
                "note": "No agency relationships ❌"
            }
    else:
        breakdown["agencies"] = {
            "points": 0,
            "max": 15,
            "note": "No agency data available"
        }

    # ─────────────────────────────────────────
    # 5. CAGE Code Present (10 pts)
    # ─────────────────────────────────────────
    if supplier.get("cage_code"):
        score += 10
        breakdown["cage_code"] = {
            "points": 10,
            "max": 10,
            "note": f"CAGE code present: {supplier['cage_code']} ✅"
        }
    else:
        breakdown["cage_code"] = {
            "points": 0,
            "max": 10,
            "note": "No CAGE code found ❌"
        }

    # ─────────────────────────────────────────
    # 6. UEI Present (15 pts)
    # ─────────────────────────────────────────
    if supplier.get("uei"):
        score += 15
        breakdown["uei"] = {
            "points": 15,
            "max": 15,
            "note": f"UEI present: {supplier['uei']} ✅"
        }
    else:
        breakdown["uei"] = {
            "points": 0,
            "max": 15,
            "note": "No UEI found ❌"
        }

    return {
        "risk_score": min(score, 100),
        "breakdown": breakdown
    }


def calculate_diversity_score(certifications: list) -> dict:
    """
    Calculate diversity score (0-100) based on certifications.
    Higher score = More diverse certifications
    """
    score = 0
    breakdown = {}

    cert_map = {
        "8(a)":    {"points": 20, "label": "SBA 8(a) Certified"},
        "WOSB":    {"points": 20, "label": "Women-Owned Small Business"},
        "EDWOSB":  {"points": 20, "label": "Economically Disadvantaged WOSB"},
        "HUBZone": {"points": 20, "label": "HUBZone Certified"},
        "SDVOSB":  {"points": 20, "label": "Service-Disabled Veteran-Owned"},
        "VOSB":    {"points": 20, "label": "Veteran-Owned Small Business"},
        "SDB":     {"points": 20, "label": "Small Disadvantaged Business"},
    }

    awarded = set()
    for cert in certifications:
        if cert in cert_map and cert not in awarded:
            pts = cert_map[cert]["points"]
            score += pts
            awarded.add(cert)
            breakdown[cert] = {
                "points": pts,
                "label": cert_map[cert]["label"],
                "note": f"{cert_map[cert]['label']} ✅"
            }

    # Cap at 100
    score = min(score, 100)

    return {
        "diversity_score": score,
        "breakdown": breakdown
    }


def score_supplier(supplier: dict, awards: dict = None) -> dict:
    """
    Master function — scores a supplier on both risk and diversity
    """
    certifications = supplier.get("certifications", [])

    risk = calculate_risk_score(supplier, awards)
    diversity = calculate_diversity_score(certifications)

    return {
        **supplier,
        "risk_score": risk["risk_score"],
        "risk_breakdown": risk["breakdown"],
        "diversity_score": diversity["diversity_score"],
        "diversity_breakdown": diversity["breakdown"],
    }