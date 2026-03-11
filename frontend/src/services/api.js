import mockSuppliers from "../mock/suppliers.json";
import mockSpending from "../mock/spending.json";
import mockSba from "../mock/sba.json";

const USE_MOCK = true; // Switch to false for real API

// Merge all three data sources by UEI
const enrichSuppliers = (suppliers) => {
  return suppliers.map((supplier) => {
    const uei = supplier.uei;

    // Get spending data for this supplier
    const spending = mockSpending[uei] || {
      total_awards: 0,
      contract_count: 0,
      agencies_served: [],
      last_award_date: null,
      contracts: [],
    };

    // Get SBA certification data for this supplier
    const sba = mockSba[uei] || {
      certifications: [],
      expiry: {},
    };

    // Calculate risk score
    const riskScore = calculateRiskScore(supplier, spending);

    // Calculate diversity score
    const diversityScore = calculateDiversityScore(sba.certifications);

    // Return unified supplier record
    return {
      ...supplier,
      // Override with real spending data
      total_awards: spending.total_awards,
      contract_count: spending.contract_count,
      agencies_served: spending.agencies_served,
      last_award_date: spending.last_award_date,
      contracts: spending.contracts,
      // Override with real SBA data
      certifications: sba.certifications,
      cert_expiry: sba.expiry,
      // Calculated scores
      risk_score: riskScore.score,
      risk_breakdown: riskScore.breakdown,
      diversity_score: diversityScore.score,
      diversity_breakdown: diversityScore.breakdown,
    };
  });
};

// Risk score calculation (mirrors backend scorer.py)
const calculateRiskScore = (supplier, spending) => {
  let score = 0;
  const breakdown = {};

  // Active registration (20 pts)
  if (supplier.registration_status?.toLowerCase() === "active") {
    score += 20;
    breakdown.active_registration = {
      points: 20, max: 20, note: "Active SAM registration ✅",
    };
  } else {
    breakdown.active_registration = {
      points: 0, max: 20, note: "Inactive registration ❌",
    };
  }

  // Expiration (15 pts)
  if (supplier.expiration_date) {
    const days = Math.floor(
      (new Date(supplier.expiration_date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (days > 180) {
      score += 15;
      breakdown.expiration = { points: 15, max: 15, note: `Valid for ${days} days ✅` };
    } else if (days > 90) {
      score += 8;
      breakdown.expiration = { points: 8, max: 15, note: `Expiring in ${days} days ⚠️` };
    } else {
      breakdown.expiration = { points: 0, max: 15, note: `Expiring soon (${days} days) ❌` };
    }
  }

  // Contract history (25 pts)
  const count = spending.contract_count || 0;
  if (count >= 10) {
    score += 25;
    breakdown.past_awards = { points: 25, max: 25, note: `Strong history: ${count} contracts ✅` };
  } else if (count >= 5) {
    score += 15;
    breakdown.past_awards = { points: 15, max: 25, note: `Moderate history: ${count} contracts ⚠️` };
  } else if (count >= 1) {
    score += 8;
    breakdown.past_awards = { points: 8, max: 25, note: `Limited history: ${count} contracts ⚠️` };
  } else {
    breakdown.past_awards = { points: 0, max: 25, note: "No contract history ❌" };
  }

  // Agency relationships (15 pts)
  const agencies = spending.agencies_served || [];
  if (agencies.length >= 3) {
    score += 15;
    breakdown.agencies = { points: 15, max: 15, note: `Works with ${agencies.length} agencies ✅` };
  } else if (agencies.length >= 2) {
    score += 10;
    breakdown.agencies = { points: 10, max: 15, note: `Works with ${agencies.length} agencies ⚠️` };
  } else if (agencies.length === 1) {
    score += 5;
    breakdown.agencies = { points: 5, max: 15, note: "Only 1 agency relationship ⚠️" };
  } else {
    breakdown.agencies = { points: 0, max: 15, note: "No agency relationships ❌" };
  }

  // CAGE code (10 pts)
  if (supplier.cage_code) {
    score += 10;
    breakdown.cage_code = { points: 10, max: 10, note: `CAGE code: ${supplier.cage_code} ✅` };
  } else {
    breakdown.cage_code = { points: 0, max: 10, note: "No CAGE code ❌" };
  }

  // UEI (15 pts)
  if (supplier.uei) {
    score += 15;
    breakdown.uei = { points: 15, max: 15, note: `UEI: ${supplier.uei} ✅` };
  } else {
    breakdown.uei = { points: 0, max: 15, note: "No UEI ❌" };
  }

  return { score: Math.min(score, 100), breakdown };
};

// Diversity score calculation
const calculateDiversityScore = (certifications = []) => {
  const certMap = {
    "8(a)":    { points: 20, label: "SBA 8(a) Certified" },
    "WOSB":    { points: 20, label: "Women-Owned Small Business" },
    "EDWOSB":  { points: 20, label: "Economically Disadvantaged WOSB" },
    "HUBZone": { points: 20, label: "HUBZone Certified" },
    "SDVOSB":  { points: 20, label: "Service-Disabled Veteran-Owned" },
    "VOSB":    { points: 20, label: "Veteran-Owned Small Business" },
    "SDB":     { points: 20, label: "Small Disadvantaged Business" },
  };

  let score = 0;
  const breakdown = {};

  certifications.forEach((cert) => {
    if (certMap[cert] && !breakdown[cert]) {
      score += certMap[cert].points;
      breakdown[cert] = {
        points: certMap[cert].points,
        label: certMap[cert].label,
        note: `${certMap[cert].label} ✅`,
      };
    }
  });

  return { score: Math.min(score, 100), breakdown };
};

export const searchSuppliers = async (params) => {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Merge all three data sources
    const enriched = enrichSuppliers(mockSuppliers.suppliers);

    return {
      total: mockSuppliers.total,
      suppliers: enriched,
    };
  }

  // Real API call (Stage 7)
  const response = await fetch(
    `http://localhost:8000/api/suppliers?${new URLSearchParams(params)}`
  );
  return response.json();
};