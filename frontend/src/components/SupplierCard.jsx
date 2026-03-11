import RiskScoreBadge from "./RiskScoreBadge";

export default function SupplierCard({ supplier }) {
  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    if (amount >= 1000000)
      return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000)
      return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  // Safely handle missing fields
  const certifications = supplier.certifications || [];
  const agenciesServed = supplier.agencies_served || [];
  const contractCount = supplier.contract_count || 0;
  const totalAwards = supplier.total_awards || 0;
  const riskScore = supplier.risk_score ?? 0;
  const diversityScore = supplier.diversity_score ?? 0;

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6 border border-gray-100">

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{supplier.name || "Unknown"}</h3>
        <p className="text-sm text-gray-500">
          📍 {supplier.city || "N/A"}, {supplier.state || "N/A"} &nbsp;|&nbsp;
          🔖 CAGE: {supplier.cage_code || "N/A"} &nbsp;|&nbsp;
          🆔 UEI: {supplier.uei || "N/A"}
        </p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <RiskScoreBadge score={riskScore} label="Risk Score" />
        <RiskScoreBadge score={diversityScore} label="Diversity Score" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Total Awards</div>
          <div className="font-bold text-gray-800">
            {formatCurrency(totalAwards)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Contracts</div>
          <div className="font-bold text-gray-800">{contractCount}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Agencies</div>
          <div className="font-bold text-gray-800">
            {agenciesServed.length > 0 ? agenciesServed.length : "N/A"}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="mb-4">
        {certifications.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert) => (
              <span
                key={cert}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
              >
                {cert}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">No certifications</span>
        )}
      </div>

      {/* Risk Breakdown */}
      {supplier.risk_breakdown && (
        <div className="mb-4 border-t pt-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Risk Score Breakdown</p>
          <div className="space-y-1">
            {Object.values(supplier.risk_breakdown).map((item, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-500">{item.note}</span>
                <span className="font-medium text-gray-700">
                  {item.points}/{item.max}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
        <span>Expires: {supplier.expiration_date || "N/A"}</span>
        <span className="text-green-600 font-medium">
          ● {supplier.registration_status || "Unknown"}
        </span>
      </div>
    </div>
  );
}