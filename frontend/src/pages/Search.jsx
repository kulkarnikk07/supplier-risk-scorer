import { useState } from "react";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import SupplierCard from "../components/SupplierCard";
import { searchSuppliers } from "../services/api";

export default function Search() {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({
    minRiskScore: 0,
    certifications: [],
  });

  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchSuppliers(params);
      setSuppliers(data.suppliers);
      setTotal(data.total);
      setSearched(true);
    } catch (err) {
      setError("Failed to fetch suppliers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    // Filter by min risk score
    if (supplier.risk_score < filters.minRiskScore) return false;

    // Filter by certifications
    if (filters.certifications.length > 0) {
      const hasCert = filters.certifications.some((cert) =>
        supplier.certifications.includes(cert)
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
                onClick={() => setFilters({ minRiskScore: 0, certifications: [] })}
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
              Showing <span className="font-bold">{filteredSuppliers.length}</span> of{" "}
              <span className="font-bold">{total.toLocaleString()}</span> suppliers
            </p>
            <p className="text-gray-400 text-xs">
              Filtered by risk score ≥ {filters.minRiskScore}
              {filters.certifications.length > 0 &&
                ` | Certs: ${filters.certifications.join(", ")}`}
            </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard key={supplier.uei} supplier={supplier} />
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
    </div>
  );
}