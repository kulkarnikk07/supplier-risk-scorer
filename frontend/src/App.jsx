import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "./pages/Search";
import SupplierDetail from "./pages/SupplierDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/supplier/:uei" element={<SupplierDetail />} />
      </Routes>
    </BrowserRouter>
  );
}