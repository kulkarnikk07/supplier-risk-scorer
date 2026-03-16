import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import SupplierCard from "../components/SupplierCard";
import { searchSuppliers } from "../services/api";
import ChatBubble from "../components/ChatBubble";

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [suppliers, setSuppliers] = useState(location.state?.suppliers || []);
  const [total, setTotal] = useState(location.state?.total || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(location.state?.searched || false);
  const [filters, setFilters] = useState(location.state?.filters || { minRiskScore: 0, certifications: [] });
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchSuppliers(params);
      setSuppliers(data.suppliers);
      setTotal(data.total);
      setSearched(true);
      navigate(".", {
        state: { suppliers: data.suppliers, total: data.total, searched: true, filters },
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
      "Name", "City", "State", "UEI", "CAGE Code",
      "Registration Status", "Expiration Date", "Risk Score",
      "Diversity Score", "Certifications", "Total Awards ($)",
      "Contract Count", "Agencies Served", "Last Award Date",
    ];
    const rows = suppliers.map((s) => [
      s.name, s.city, s.state, s.uei, s.cage_code,
      s.registration_status, s.expiration_date, s.risk_score,
      s.diversity_score, (s.certifications || []).join("; "),
      s.total_awards, s.contract_count,
      (s.agencies_served || []).join("; "), s.last_award_date || "N/A",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
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
      if (prev.length >= 3) { alert("You can compare up to 3 suppliers at a time."); return prev; }
      return [...prev, supplier];
    });
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    if ((supplier.risk_score ?? 0) < filters.minRiskScore) return false;
    if (filters.certifications.length > 0) {
      const hasCert = filters.certifications.some((cert) => (supplier.certifications || []).includes(cert));
      if (!hasCert) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-blue-700 text-white py-8 px-6 mb-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">🏛️ Supplier Risk Scorer</h1>
            <p className="text-blue-200">
              Discover and evaluate federal suppliers using SAM.gov, USASpending.gov and SBA data
            </p>
          </div>
          <button
            onClick={() => setShowAbout(true)}
            className="bg-white text-blue-700 hover:bg-blue-50 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
          >
            ℹ️ About
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">

        <SearchBar onSearch={handleSearch} loading={loading} />

        {searched && (
          <div>
            <FilterPanel filters={filters} onChange={setFilters} />
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setFilters({ minRiskScore: 0, certifications: [] });
                  setSuppliers([]);
                  setTotal(0);
                  setSearched(false);
                  setCompareList([]);
                }}
                className="text-sm text-gray-500 hover:text-red-500 border border-gray-300 hover:border-red-400 px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Reset Filters
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">{error}</div>
        )}

        {searched && !loading && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 text-sm">
              Showing <span className="font-bold">{filteredSuppliers.length}</span> of{" "}
              <span className="font-bold">{total.toLocaleString()}</span> suppliers
            </p>
            <div className="flex items-center gap-3">
              <p className="text-gray-400 text-xs">
                Filtered by risk score ≥ {filters.minRiskScore}
                {filters.certifications.length > 0 && ` | Certs: ${filters.certifications.join(", ")}`}
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

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-6"></div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="h-16 bg-gray-100 rounded-lg"></div>
                  <div className="h-16 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="h-12 bg-gray-100 rounded-lg"></div>
                  <div className="h-12 bg-gray-100 rounded-lg"></div>
                  <div className="h-12 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}

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

        {searched && !loading && filteredSuppliers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500">No suppliers found matching your filters.</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your risk score or certification filters.</p>
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🏛️</div>
            <p className="text-gray-500">Enter a NAICS code and state to search for suppliers.</p>
            <p className="text-gray-400 text-sm mt-1">Try NAICS code 541512 for IT vendors in Virginia.</p>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-xs text-gray-400">
          <span>🏛️ Supplier Risk Scorer — Built with open US government data</span>
          <span>Built by <a href="https://www.linkedin.com/in/kedar-kulkarni/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Kedar Kulkarni</a></span>
        </div>
      </footer>

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
                <button onClick={() => toggleCompare(s)} className="ml-2 hover:text-red-300">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCompareList([])} className="text-blue-200 hover:text-white text-sm">Clear</button>
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
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">🔍 Supplier Comparison</h2>
              <button onClick={() => setShowCompare(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 bg-gray-50 text-gray-500 font-medium rounded-l w-40">Criteria</th>
                    {compareList.map((s) => (
                      <th key={s.uei} className="text-left py-3 px-4 bg-gray-50 text-gray-700 font-bold">{s.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "📍 Location",       key: (s) => `${s.city}, ${s.state}`,                         highlight: false },
                    { label: "🛡️ Risk Score",     key: (s) => `${s.risk_score}/100`,      value: (s) => s.risk_score,      highlight: true },
                    { label: "🌟 Diversity Score", key: (s) => `${s.diversity_score}/100`, value: (s) => s.diversity_score, highlight: true },
                    { label: "🏅 Certifications",  key: (s) => (s.certifications || []).join(", ") || "None",  highlight: false },
                    { label: "💰 Total Awards",    key: (s) => `$${(s.total_awards || 0).toLocaleString()}`,   value: (s) => s.total_awards,    highlight: true },
                    { label: "📋 Contracts",       key: (s) => s.contract_count || 0,      value: (s) => s.contract_count,  highlight: true },
                    { label: "🏛️ Agencies",        key: (s) => (s.agencies_served || []).join(", ") || "None", highlight: false },
                    { label: "📅 Last Award",      key: (s) => s.last_award_date || "N/A",                     highlight: false },
                    { label: "🔖 CAGE Code",       key: (s) => s.cage_code || "N/A",                           highlight: false },
                    { label: "📆 Expires",         key: (s) => s.expiration_date || "N/A",                     highlight: false },
                  ].map((row) => {
                    const best = row.highlight ? Math.max(...compareList.map((s) => row.value(s) || 0)) : null;
                    return (
                      <tr key={row.label} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-500">{row.label}</td>
                        {compareList.map((s) => {
                          const isBest = row.highlight && row.value(s) === best && best > 0;
                          return (
                            <td key={s.uei} className={`py-3 px-4 font-medium ${isBest ? "text-green-600 bg-green-50" : "text-gray-700"}`}>
                              {isBest ? "⭐ " : ""}{row.key(s)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => exportToCSV(compareList)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                ⬇️ Export Comparison
              </button>
              <button onClick={() => setShowCompare(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">

            {/* Modal Header */}
            <div className="bg-blue-700 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">🏛️ Supplier Risk Scorer</h2>
                <p className="text-blue-200 text-sm">Federal Supplier Discovery & Risk Analysis Tool</p>
              </div>
              <button onClick={() => setShowAbout(false)} className="text-white hover:text-blue-200 text-2xl font-bold">×</button>
            </div>

            <div className="p-6 space-y-6">

              {/* About */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-2">📌 About the Project</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Supplier Risk Scorer is an AI-powered federal procurement tool that helps contracting officers,
                  small business advisors, and procurement professionals discover, evaluate, and compare
                  federal suppliers. It aggregates data from multiple US government sources and uses
                  AI to generate plain-English risk assessments — saving hours of manual research.
                </p>
                <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>Search federal vendors by NAICS code and state</li>
                  <li>Score suppliers on risk and diversity certifications</li>
                  <li>Compare up to 3 suppliers side by side</li>
                  <li>Generate AI-powered procurement summaries</li>
                  <li>Export results to CSV for reporting</li>
                </ul>
              </section>

              {/* Data Sources */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-2">📡 Data Sources</h3>
                <div className="space-y-2">
                  {[
                    { name: "SAM.gov", desc: "Vendor registration, CAGE codes, UEI, and certifications", url: "https://sam.gov" },
                    { name: "USASpending.gov", desc: "Federal contract awards, agencies served, and spending history", url: "https://usaspending.gov" },
                    { name: "SBA DSBS", desc: "Small business certifications — 8(a), WOSB, HUBZone, SDVOSB", url: "https://sba.gov" },
                  ].map((source) => (
                    <div key={source.name} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="flex-1">
                        <a href={source.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                          {source.name}
                        </a>
                        <p className="text-xs text-gray-500 mt-0.5">{source.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tech Stack */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-2">🛠️ Tech Stack</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "React + Vite", desc: "Frontend UI" },
                    { name: "Tailwind CSS v4", desc: "Styling" },
                    { name: "FastAPI + Python", desc: "Backend API" },
                    { name: "Anthropic Claude", desc: "AI summaries & chat" },
                    { name: "SAM.gov API", desc: "Vendor data" },
                    { name: "USASpending API", desc: "Contract data" },
                  ].map((tech) => (
                    <div key={tech.name} className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-bold text-blue-700">{tech.name}</p>
                      <p className="text-xs text-gray-500">{tech.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Developer */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-2">👨‍💻 Developer</h3>
                <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    K
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Kedar Kulkarni</p>
                    
                      <a href="https://www.linkedin.com/in/kedar-kulkarni/" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                      🔗 linkedin.com/in/kedar-kulkarni
                    </a>
                  </div>
                </div>
              </section>

              {/* Disclaimer */}
              <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-yellow-800 mb-1">⚠️ Disclaimer</h3>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  This project is created for educational and portfolio purposes using publicly available data from US government sources including SAM.gov, USASpending.gov, and the SBA. The information provided is for general guidance only and should not be considered official procurement advice. Risk and diversity scores are algorithmically generated estimates and do not represent official government assessments. Always verify supplier information directly through official government systems before making procurement decisions.
                </p>
              </section>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <button
                onClick={() => setShowAbout(false)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                ← Back to Search
              </button>
              <button
                onClick={() => setShowAbout(false)}
                className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-6 py-2 rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Chat Bubble */}
      <ChatBubble suppliers={filteredSuppliers} />

    </div>
  );
}