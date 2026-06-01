const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "StockSense AI Lite backend is running",
  });
});

// Stock search route
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({
        error: "Search query is required",
      });
    }

    const response = await axios.get("https://finnhub.io/api/v1/search", {
      params: {
        q: query,
        token: FINNHUB_API_KEY,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Search error:", error.message);

    res.status(500).json({
      error: "Failed to search stocks",
    });
  }
});

// Stock quote route
app.get("/api/quote/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;

    const response = await axios.get("https://finnhub.io/api/v1/quote", {
      params: {
        symbol: symbol,
        token: FINNHUB_API_KEY,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Quote error:", error.message);

    res.status(500).json({
      error: "Failed to fetch stock quote",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});