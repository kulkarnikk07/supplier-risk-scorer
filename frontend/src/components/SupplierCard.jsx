import RiskScoreBadge from "./RiskScoreBadge";

export default function SupplierCard({ supplier }) {
  const formatCurrency = (amount) => {
    if (amount >= 1000000)
      return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000)
      return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6 border border-gray-100">

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{supplier.name}</h3>
        <p className="text-sm text-gray-500">
          📍 {supplier.city}, {supplier.state} &nbsp;|&nbsp;
          🔖 CAGE: {supplier.cage_code} &nbsp;|&nbsp;
          🆔 UEI: {supplier.uei}
        </p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <RiskScoreBadge score={supplier.risk_score} label="Risk Score" />
        <RiskScoreBadge score={supplier.diversity_score} label="Diversity Score" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Total Awards</div>
          <div className="font-bold text-gray-800">
            {formatCurrency(supplier.total_awards)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Contracts</div>
          <div className="font-bold text-gray-800">{supplier.contract_count}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Agencies</div>
          <div className="font-bold text-gray-800">
            {supplier.agencies_served.length}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="mb-4">
        {supplier.certifications.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {supplier.certifications.map((cert) => (
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

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
        <span>Expires: {supplier.expiration_date}</span>
        <span className="text-green-600 font-medium">● {supplier.registration_status}</span>
      </div>
    </div>
  );
}