const API_BASE_URL = "http://localhost:5000/api";

export async function searchStocks(query) {
  const response = await fetch(`${API_BASE_URL}/search?query=${query}`);

  if (!response.ok) {
    throw new Error("Failed to search stocks");
  }

  return response.json();
}

export async function getStockQuote(symbol) {
  const response = await fetch(`${API_BASE_URL}/quote/${symbol}`);

  if (!response.ok) {
    throw new Error("Failed to fetch stock quote");
  }

  return response.json();
}