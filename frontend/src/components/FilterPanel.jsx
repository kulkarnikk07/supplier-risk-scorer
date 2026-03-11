export default function FilterPanel({ filters, onChange }) {
  const certifications = ["WOSB", "SDVOSB", "8(a)", "HUBZone", "SDB"];

  const toggleCert = (cert) => {
    const current = filters.certifications || [];
    const updated = current.includes(cert)
      ? current.filter((c) => c !== cert)
      : [...current, cert];
    onChange({ ...filters, certifications: updated });
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">🎯 Filter Results</h2>

      {/* Min Risk Score */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Minimum Risk Score: {filters.minRiskScore || 0}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.minRiskScore || 0}
          onChange={(e) =>
            onChange({ ...filters, minRiskScore: Number(e.target.value) })
          }
          className="w-full accent-blue-600"
        />
      </div>

      {/* Diversity Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Diversity Certifications
        </label>
        <div className="flex flex-wrap gap-2">
          {certifications.map((cert) => {
            const active = (filters.certifications || []).includes(cert);
            return (
              <button
                key={cert}
                onClick={() => toggleCert(cert)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                }`}
              >
                {cert}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}