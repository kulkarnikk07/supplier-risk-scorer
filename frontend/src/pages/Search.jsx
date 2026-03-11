import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import SupplierCard from "../components/SupplierCard";
import { searchSuppliers } from "../services/api";

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [suppliers, setSuppliers] = useState(
    location.state?.suppliers || []
  );
  const [total, setTotal] = useState(location.state?.total || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(
    location.state?.searched || false
  );
  const [filters, setFilters] = useState(
    location.state?.filters || { minRiskScore: 0, certifications: [] }
  );
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchSuppliers(params);
      setSuppliers(data.suppliers);
      setTotal(data.total);
      setSearched(true);
      navigate(".", {
        state: {
          suppliers: data.suppliers,
          total: data.total,
          searched: true,
          filters,
        },
        replace: true,
      });
    } catch (err) {
      setError("Failed to fetch suppliers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (suppliers) => {
    const headers = [
      "Name",
      "City",
      "State",
      "UEI",
      "CAGE Code",
      "Registration Status",
      "Expiration Date",
      "Risk Score",
      "Diversity Score",
      "Certifications",
      "Total Awards ($)",
      "Contract Count",
      "Agencies Served",
      "Last Award Date",
    ];

    const rows = suppliers.map((s) => [
      s.name,
      s.city,
      s.state,
      s.uei,
      s.cage_code,
      s.registration_status,
      s.expiration_date,
      s.risk_score,
      s.diversity_score,
      (s.certifications || []).join("; "),
      s.total_awards,
      s.contract_count,
      (s.agencies_served || []).join("; "),
      s.last_award_date || "N/A",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `suppliers_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleCompare = (supplier) => {
    setCompareList((prev) => {
      const exists = prev.find((s) => s.uei === supplier.uei);
      if (exists) return prev.filter((s) => s.uei !== supplier.uei);
      if (prev.length >= 3) {
        alert("You can compare up to 3 suppliers at a time.");
        return prev;
      }
      return [...prev, supplier];
    });
  };

  // Apply filters to suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    if ((supplier.risk_score ?? 0) < filters.minRiskScore) return false;
    if (filters.certifications.length > 0) {
      const supplierCerts = supplier.certifications || [];
      const hasCert = filters.certifications.some((cert) =>
        supplierCerts.includes(cert)
      );
      if (!hasCert) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-blue-700 text-white py-8 px-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">
            🏛️ Supplier Risk Scorer
          </h1>
          <p className="text-blue-200">
            Discover and evaluate federal suppliers using SAM.gov,
            USASpending.gov and SBA data
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Filter Panel — only show after search */}
        {searched && (
          <div>
            <FilterPanel filters={filters} onChange={setFilters} />
            <div className="flex justify-end mb-4">
              <button
                onClick={() =>
                  setFilters({ minRiskScore: 0, certifications: [] })
                }
                className="text-sm text-gray-500 hover:text-red-500 border border-gray-300 hover:border-red-400 px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* Results Summary */}
        {searched && !loading && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 text-sm">
              Showing{" "}
              <span className="font-bold">{filteredSuppliers.length}</span> of{" "}
              <span className="font-bold">{total.toLocaleString()}</span>{" "}
              suppliers
            </p>
            <div className="flex items-center gap-3">
              <p className="text-gray-400 text-xs">
                Filtered by risk score ≥ {filters.minRiskScore}
                {filters.certifications.length > 0 &&
                  ` | Certs: ${filters.certifications.join(", ")}`}
              </p>
              <button
                onClick={() => exportToCSV(filteredSuppliers)}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                ⬇️ Export CSV
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Searching suppliers...</p>
          </div>
        )}

        {/* Supplier Cards Grid */}
        {!loading && filteredSuppliers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.uei}
                supplier={supplier}
                onCompare={toggleCompare}
                isComparing={compareList.some((s) => s.uei === supplier.uei)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {searched && !loading && filteredSuppliers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500">
              No suppliers found matching your filters.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your risk score or certification filters.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🏛️</div>
            <p className="text-gray-500">
              Enter a NAICS code and state to search for suppliers.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try NAICS code 541512 for IT vendors in Virginia.
            </p>
          </div>
        )}

      </div>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-lg z-50">
          <div className="flex items-center gap-3">
            <span className="font-medium">
              🔍 Comparing {compareList.length} supplier{compareList.length > 1 ? "s" : ""}:
            </span>
            {compareList.map((s) => (
              <span key={s.uei} className="bg-blue-500 px-3 py-1 rounded-full text-sm">
                {s.name.split(" ")[0]}
                <button
                  onClick={() => toggleCompare(s)}
                  className="ml-2 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCompareList([])}
              className="text-blue-200 hover:text-white text-sm"
            >
              Clear
            </button>
            <button
              onClick={() => setShowCompare(true)}
              disabled={compareList.length < 2}
              className="bg-white text-blue-700 font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-blue-50"
            >
              Compare Now →
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-screen overflow-y-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                🔍 Supplier Comparison
              </h2>
              <button
                onClick={() => setShowCompare(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Comparison Table */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 bg-gray-50 text-gray-500 font-medium rounded-l w-40">
                      Criteria
                    </th>
                    {compareList.map((s) => (
                      <th key={s.uei} className="text-left py-3 px-4 bg-gray-50 text-gray-700 font-bold">
                        {s.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "📍 Location",       key: (s) => `${s.city}, ${s.state}` },
                    { label: "🛡️ Risk Score",     key: (s) => `${s.risk_score}/100` },
                    { label: "🌟 Diversity Score", key: (s) => `${s.diversity_score}/100` },
                    { label: "🏅 Certifications",  key: (s) => (s.certifications || []).join(", ") || "None" },
                    { label: "💰 Total Awards",    key: (s) => `$${(s.total_awards || 0).toLocaleString()}` },
                    { label: "📋 Contracts",       key: (s) => s.contract_count || 0 },
                    { label: "🏛️ Agencies",        key: (s) => (s.agencies_served || []).join(", ") || "None" },
                    { label: "📅 Last Award",      key: (s) => s.last_award_date || "N/A" },
                    { label: "🔖 CAGE Code",       key: (s) => s.cage_code || "N/A" },
                    { label: "📆 Expires",         key: (s) => s.expiration_date || "N/A" },
                  ].map((row) => (
                    <tr key={row.label} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-500">
                        {row.label}
                      </td>
                      {compareList.map((s) => (
                        <td key={s.uei} className="py-3 px-4 text-gray-700">
                          {row.key(s)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => exportToCSV(compareList)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                ⬇️ Export Comparison
              </button>
              <button
                onClick={() => setShowCompare(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}