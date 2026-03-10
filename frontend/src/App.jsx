import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    axios.get("http://localhost:8000/health")
      .then(res => setStatus(`Backend connected ✅ v${res.data.version}`))
      .catch(() => setStatus("Backend not reachable ❌"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Supplier Risk Scorer
        </h1>
        <p className="text-gray-500">API Status: {status}</p>
      </div>
    </div>
  );
}