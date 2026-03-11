import axios from "axios";
import mockData from "../mock/suppliers.json";

const USE_MOCK = true; // Switch to false when ready for real API

export const searchSuppliers = async (params) => {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockData;
  }

  // Real API call
  const response = await axios.get("http://localhost:8000/api/suppliers", {
    params,
  });
  return response.data;
};