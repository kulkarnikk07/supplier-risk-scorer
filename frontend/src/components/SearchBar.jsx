export default function SearchBar({ onSearch, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    onSearch({
      naics_code: form.naics_code.value,
      state: form.state.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">🔍 Search Suppliers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* NAICS Code */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            NAICS Code
          </label>
          <input
            name="naics_code"
            type="text"
            placeholder="e.g. 541512"
            defaultValue="541512"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            State
          </label>
          <select
            name="state"
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
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Suppliers"}
          </button>
        </div>
      </div>
    </form>
  );
}