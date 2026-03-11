import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RiskScoreBadge from "../components/RiskScoreBadge";

export default function SupplierDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const supplier = location.state?.supplier;

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // If no supplier data, go back to search
  if (!supplier) {
    navigate("/");
    return null;
  }

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const response = await fetch("http://localhost:8000/api/suppliers/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setSummaryError("Failed to generate summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-blue-700 text-white py-8 px-6 mb-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-200 hover:text-white text-sm mb-4 flex items-center gap-1"
          >
            ← Back to Search
          </button>
          <h1 className="text-3xl font-bold">{supplier.name}</h1>
          <p className="text-blue-200 mt-1">
            📍 {supplier.city}, {supplier.state} &nbsp;|&nbsp;
            🔖 CAGE: {supplier.cage_code} &nbsp;|&nbsp;
            🆔 UEI: {supplier.uei}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              🛡️ Risk Score
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold text-gray-800">
                {supplier.risk_score}
              </div>
              <div className="text-gray-400">/ 100</div>
            </div>
            {supplier.risk_breakdown && (
              <div className="space-y-2">
                {Object.values(supplier.risk_breakdown).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.note}</span>
                    <span className={`font-medium ${
                      item.points === item.max
                        ? "text-green-600"
                        : item.points > 0
                        ? "text-yellow-600"
                        : "text-red-500"
                    }`}>
                      {item.points}/{item.max}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              🌟 Diversity Score
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold text-gray-800">
                {supplier.diversity_score}
              </div>
              <div className="text-gray-400">/ 100</div>
            </div>
            {supplier.diversity_breakdown &&
            Object.keys(supplier.diversity_breakdown).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(supplier.diversity_breakdown).map(
                  ([cert, item]) => (
                    <div key={cert} className="flex justify-between text-sm">
                      <span className="text-gray-500">{item.note}</span>
                      <span className="font-medium text-green-600">
                        +{item.points}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No diversity certifications</p>
            )}
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">
              🤖 AI Procurement Summary
            </h2>
            <button
              onClick={generateSummary}
              disabled={summaryLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {summaryLoading ? "Generating..." : "Generate Summary"}
            </button>
          </div>

          {summaryError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
              {summaryError}
            </div>
          )}

          {summaryLoading && (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">⏳</div>
              <p className="text-gray-400 text-sm">
                Claude is analyzing this supplier...
              </p>
            </div>
          )}

          {summary && !summaryLoading && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{summary}</p>
              <p className="text-xs text-blue-400 mt-3">
                ✨ Generated by Claude AI — for informational purposes only
              </p>
            </div>
          )}

          {!summary && !summaryLoading && !summaryError && (
            <p className="text-gray-400 text-sm">
              Click "Generate Summary" to get an AI-powered procurement
              analysis of this supplier.
            </p>
          )}
        </div>

        {/* Registration Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            📋 Registration Info
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <p className="font-medium text-green-600">
                ● {supplier.registration_status}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Expiration Date</p>
              <p className="font-medium text-gray-700">
                {supplier.expiration_date}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">CAGE Code</p>
              <p className="font-medium text-gray-700">{supplier.cage_code}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">UEI</p>
              <p className="font-medium text-gray-700">{supplier.uei}</p>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            🏅 Certifications
          </h2>
          {supplier.certifications?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {supplier.certifications.map((cert) => (
                <div
                  key={cert}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2"
                >
                  <p className="font-bold text-blue-800">{cert}</p>
                  {supplier.cert_expiry?.[cert] && (
                    <p className="text-xs text-blue-500">
                      Expires: {supplier.cert_expiry[cert]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No certifications on record</p>
          )}
        </div>

        {/* Contract Summary */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            💰 Contract Summary
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Total Awards</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(supplier.total_awards)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-800">
                {supplier.contract_count}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Last Award</p>
              <p className="text-2xl font-bold text-gray-800">
                {supplier.last_award_date || "N/A"}
              </p>
            </div>
          </div>

          {/* Agencies Served */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Agencies Served
            </p>
            <div className="flex flex-wrap gap-2">
              {supplier.agencies_served?.map((agency) => (
                <span
                  key={agency}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {agency}
                </span>
              ))}
            </div>
          </div>

          {/* Contract History Table */}
          {supplier.contracts?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">
                Recent Contracts
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs">
                      <th className="text-left py-2 px-3 rounded-l">Agency</th>
                      <th className="text-left py-2 px-3">Amount</th>
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3 rounded-r">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.contracts.map((contract, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 px-3 font-medium text-gray-700">
                          {contract.agency}
                        </td>
                        <td className="py-2 px-3 text-green-600 font-medium">
                          {formatCurrency(contract.amount)}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {contract.date}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {contract.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}