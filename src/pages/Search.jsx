import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchStocks, getStockQuote } from "../services/stockApi";

function Search() {
  const [query, setQuery] = useState("");
  const [stocks, setStocks] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();

  async function runSearch(searchValue) {
    const cleanQuery = searchValue.trim();

    if (cleanQuery === "") {
      setError("Please enter a stock symbol or company name.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStocks([]);
      setQuotes({});

      const data = await searchStocks(cleanQuery);

      const filteredResults = data.result
        .filter((item) => item.type === "Common Stock")
        .slice(0, 8);

      setStocks(filteredResults);

      const quoteData = {};

      for (const stock of filteredResults.slice(0, 4)) {
        try {
          const quote = await getStockQuote(stock.symbol);
          quoteData[stock.symbol] = quote;
        } catch {
          quoteData[stock.symbol] = null;
        }
      }

      setQuotes(quoteData);
    } catch {
      setError("Something went wrong while searching stocks.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    runSearch(query);
  }

  useEffect(() => {
    const queryFromNavbar = searchParams.get("q");

    if (queryFromNavbar) {
      setQuery(queryFromNavbar);
      runSearch(queryFromNavbar);
    }
  }, [searchParams]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Search</h1>
          <p>Search live stock data by company name or ticker symbol.</p>
        </div>
      </div>

      <form className="stock-search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search stocks, example: AAPL, TSLA, MSFT"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="search-section">
        <h2>Search Results</h2>

        {loading && <p className="muted-text">Loading stock results...</p>}

        {!loading && stocks.length === 0 && !error && (
          <p className="muted-text">
            No results yet. Search for a stock symbol or company name.
          </p>
        )}

        <div className="stock-results">
          {stocks.map((stock) => {
            const quote = quotes[stock.symbol];

            return (
              <div className="stock-result-card" key={stock.symbol}>
                <div>
                  <h3>{stock.displaySymbol}</h3>
                  <p>{stock.description}</p>
                  <span>{stock.type}</span>
                </div>

                <div className="stock-price-box">
                  {quote ? (
                    <>
                      <strong>
                        {quote.c ? `$${quote.c.toFixed(2)}` : "$0.00"}
                      </strong>

                      <small
                        className={
                          quote.d >= 0 ? "positive-text" : "negative-text"
                        }
                      >
                        {quote.d >= 0 ? "+" : ""}
                        {quote.d?.toFixed(2) || "0.00"} (
                        {quote.dp?.toFixed(2) || "0.00"}%)
                      </small>
                    </>
                  ) : (
                    <small className="muted-text">Quote loading...</small>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Search;