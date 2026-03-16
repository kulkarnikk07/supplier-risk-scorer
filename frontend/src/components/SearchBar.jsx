import { useState } from "react";
import { NAICS_CODES } from "../data/naics";

export default function SearchBar({ onSearch, loading }) {
  const [naicsSearch, setNaicsSearch] = useState("");
  const [selectedNaics, setSelectedNaics] = useState("541512");
  const [showDropdown, setShowDropdown] = useState(false);
  const [state, setState] = useState("VA");

  const filtered = NAICS_CODES.filter(
    (n) =>
      n.code.includes(naicsSearch) ||
      n.label.toLowerCase().includes(naicsSearch.toLowerCase())
  );

  const selectedLabel = NAICS_CODES.find((n) => n.code === selectedNaics);

  const handleSelect = (code) => {
    setSelectedNaics(code);
    setNaicsSearch("");
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!selectedNaics) return;
    onSearch({ naics_code: selectedNaics, state });
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">🔍 Search Suppliers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* NAICS Code Searchable Dropdown */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            NAICS Code
          </label>

          {/* Selected value display */}
          <div
            onClick={() => setShowDropdown((prev) => !prev)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <span className={selectedNaics ? "text-gray-800" : "text-gray-400"}>
              {selectedLabel
                ? `${selectedLabel.code} — ${selectedLabel.label}`
                : "Select a NAICS code"}
            </span>
            <span className="text-gray-400 ml-2">{showDropdown ? "▲" : "▼"}</span>
          </div>

          {/* Dropdown panel */}
          {showDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              {/* Search input */}
              <div className="p-2 border-b">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by code or description..."
                  value={naicsSearch}
                  onChange={(e) => setNaicsSearch(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Options list */}
              <ul className="max-h-56 overflow-y-auto">
                {filtered.length > 0 ? (
                  filtered.map((n) => (
                    <li
                      key={n.code}
                      onClick={() => handleSelect(n.code)}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${
                        selectedNaics === n.code
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="font-mono font-bold">{n.code}</span>
                      <span className="ml-2 text-gray-500">— {n.label}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-sm text-gray-400 text-center">
                    No codes found
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All States</option>
            <option value="VA">Virginia (VA)</option>
            <option value="MD">Maryland (MD)</option>
            <option value="TX">Texas (TX)</option>
            <option value="CA">California (CA)</option>
            <option value="FL">Florida (FL)</option>
            <option value="NY">New York (NY)</option>
            <option value="DC">Washington DC</option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedNaics}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Suppliers"}
          </button>
        </div>

      </div>

      {/* Selected NAICS summary */}
      {selectedLabel && (
        <p className="mt-3 text-xs text-gray-400">
          Selected: <span className="font-medium text-blue-600">{selectedLabel.code}</span> — {selectedLabel.label}
        </p>
      )}
    </div>
  );
}