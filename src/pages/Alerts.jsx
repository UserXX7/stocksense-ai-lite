import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Plus, X, AlertTriangle, Bell, ChevronUp, ChevronDown } from "lucide-react";
import "./Alerts.css";


const initialWatchlist = [
  { id: "w1", symbol: "AAPL",  price: 197.32,  change:  2.4,  addedAt: "Today" },
  { id: "w2", symbol: "TSLA",  price: 248.76,  change: -8.3,  addedAt: "Today" },
  { id: "w3", symbol: "NVDA",  price: 1124.50, change:  5.1,  addedAt: "Today" },
  { id: "w4", symbol: "GOOGL", price: 178.20,  change: -1.2,  addedAt: "Yesterday" },
  { id: "w5", symbol: "META",  price: 512.30,  change: -12.4, addedAt: "Yesterday" },
  { id: "w6", symbol: "MSFT",  price: 419.15,  change:  1.8,  addedAt: "Yesterday" },
  { id: "w7", symbol: "AMZN",  price: 193.45,  change:  3.6,  addedAt: "2 days ago" },
];

const COMPANY_NAMES = {
  AAPL: "Apple", TSLA: "Tesla", NVDA: "Nvidia", GOOGL: "Google",
  META: "Meta", MSFT: "Microsoft", AMZN: "Amazon",
};

function HowItWorks() {
  const [open, setOpen] = useState(true);
  return (
    <div className="hiw-guide">
      <button className="hiw-toggle" onClick={() => setOpen((o) => !o)}>
        <Bell size={14} />
        How this page works
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <ol className="hiw-steps">
          <li>
            <span className="hiw-num">1</span>
            <span>Type a stock symbol in the form (e.g. <strong>AAPL</strong> for Apple, <strong>TSLA</strong> for Tesla) and click <strong>Add Stock</strong>.</span>
          </li>
          <li>
            <span className="hiw-num">2</span>
            <span>Set your <strong>drop alert %</strong> — this is the percentage drop you want to be warned about. Start with 5% if you are unsure.</span>
          </li>
          <li>
            <span className="hiw-num">3</span>
            <span>If any stock on your list drops by more than that amount, a <strong style={{color:"#ff4d5e"}}>red warning banner</strong> will appear at the top of the screen.</span>
          </li>
        </ol>
      )}
    </div>
  );
}

function Alerts() {
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [ticker, setTicker] = useState("");
  const [threshold, setThreshold] = useState("5");
  const [error, setError] = useState("");
  const [dismissedWarnings, setDismissedWarnings] = useState([]);

  // auto-dismiss warnings after 8s when they first appear
  useEffect(() => {
    const bigDropIds = initialWatchlist
      .filter((s) => s.change <= -(parseFloat(threshold) || 0))
      .map((s) => s.id);

    bigDropIds.forEach((id) => {
      const timer = setTimeout(() => {
        setDismissedWarnings((prev) => [...prev, id]);
      }, 8000);
      return () => clearTimeout(timer);
    });
  }, []);

  const activeWarnings = watchlist.filter(
    (s) => s.change <= -(parseFloat(threshold) || 0) && !dismissedWarnings.includes(s.id)
  );

  const dismissWarning = (id) =>
    setDismissedWarnings((prev) => [...prev, id]);

  const addStock = (e) => {
    e.preventDefault();
    setError("");
    const sym = ticker.trim().toUpperCase();
    if (!sym) return setError("Please enter a stock symbol.");
    if (watchlist.some((s) => s.symbol === sym))
      return setError(`${sym} is already on your watchlist.`);

    const mockChange = parseFloat(((Math.random() * 16) - 6).toFixed(1));
    const newStock = {
      id: Date.now().toString(),
      symbol: sym,
      price: parseFloat((Math.random() * 500 + 50).toFixed(2)),
      change: mockChange,
      addedAt: "Just now",
    };

    setWatchlist((prev) => [newStock, ...prev]);

    if (mockChange <= -(parseFloat(threshold) || 0)) {
      // remove from dismissed so the warning shows
      setDismissedWarnings((prev) => prev.filter((id) => id !== newStock.id));
    }

    setTicker("");
  };

  const removeStock = (id) => {
    setWatchlist((prev) => prev.filter((s) => s.id !== id));
    setDismissedWarnings((prev) => [...prev, id]);
  };

  const gaining = watchlist.filter((s) => s.change > 0).length;
  const declining = watchlist.filter((s) => s.change < 0).length;

  return (
    <>
      {/* ── Big Drop Warnings (fixed, iPhone-style) ──────────────── */}
      {activeWarnings.length > 0 && (
        <div className="warnings-container">
          {activeWarnings.map((stock) => (
            <div key={stock.id} className="big-drop-pill">
              <AlertTriangle size={17} className="pill-icon" />
              <div className="pill-text">
                <span className="pill-title">Sharp Drop Alert</span>
                <span className="pill-sub">
                  <strong>{stock.symbol}</strong> dropped{" "}
                  {Math.abs(stock.change).toFixed(1)}% today — bigger than your{" "}
                  {threshold || "0"}% warning level.
                </span>
              </div>
              <button
                className="pill-dismiss"
                onClick={() => dismissWarning(stock.id)}
                aria-label="Dismiss warning"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <section className="alerts-page">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="alerts-header">
          <div className="alerts-title-row">
            <Bell size={22} />
            <h1>Stock Watchlist</h1>
            <span className="alerts-count-badge">{watchlist.length} stocks</span>
          </div>
        </div>

        <HowItWorks />

        <div className="alerts-layout">
          {/* ── Add Stock Form ───────────────────────────────────── */}
          <div className="alerts-form-card">
            <h3>Add to Watchlist</h3>
            <p className="form-hint">
              You will be warned if a stock drops more than {threshold}% in a session.
            </p>

            <form onSubmit={addStock} noValidate>
              <div className="form-group">
                <label htmlFor="ticker-input">Stock Symbol</label>
                <input
                  id="ticker-input"
                  type="text"
                  placeholder="e.g. AAPL"
                  value={ticker}
                  maxLength={6}
                  onChange={(e) => setTicker(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="threshold-input">
                  Warn me if drop exceeds (%)
                </label>
                <input
                  id="threshold-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 5"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value.replace(/[^0-9.]/g, ""))}
                />
                <p className="threshold-hint">
                  Example: entering <strong>5</strong> means you will be warned if a stock drops 5% or more in a single day.
                </p>
              </div>
              {error && <p className="alert-form-error">{error}</p>}
              <button type="submit" className="add-stock-btn">
                <Plus size={16} />
                Add Stock
              </button>
            </form>

            <div className="color-legend">
              <span className="legend-item"><span className="legend-dot green" />Stock went up today</span>
              <span className="legend-item"><span className="legend-dot red" />Stock went down today</span>
            </div>

            <div className="form-stats">
              <div className="form-stat">
                <span className="stat-value gaining">{gaining}</span>
                <span className="stat-label">Gaining</span>
              </div>
              <div className="form-stat-divider" />
              <div className="form-stat">
                <span className="stat-value declining">{declining}</span>
                <span className="stat-label">Declining</span>
              </div>
            </div>
          </div>

          {/* ── Watchlist Cards ──────────────────────────────────── */}
          <div className="alerts-list">
            {watchlist.length === 0 ? (
              <div className="alerts-empty">
                <Bell size={44} strokeWidth={1} />
                <p>No stocks added yet. Search for a ticker to get started.</p>
              </div>
            ) : (
              watchlist.map((stock) => {
                const isUp = stock.change > 0;
                const isBigDrop = stock.change <= -(parseFloat(threshold) || 0);

                return (
                  <div
                    key={stock.id}
                    className={`alert-card ${isUp ? "up" : "down"} ${isBigDrop ? "big-drop" : ""}`}
                  >
                    <div className="alert-accent-bar" />

                    {/* Symbol + trend icon */}
                    <div className="alert-symbol-block">
                      <span className="alert-symbol">{stock.symbol}</span>
                      {isUp ? (
                        <TrendingUp size={14} className="trend-icon up-icon" />
                      ) : (
                        <TrendingDown size={14} className="trend-icon down-icon" />
                      )}
                    </div>

                    {/* Price info */}
                    <div className="alert-body">
                      <span className={`alert-change ${isUp ? "change-up" : "change-down"}`}>
                        {isUp ? "+" : ""}
                        {stock.change.toFixed(1)}%
                      </span>
                      <p className="alert-plain-english">
                        {isBigDrop
                          ? `${COMPANY_NAMES[stock.symbol] || stock.symbol} dropped sharply — see warning above`
                          : isUp
                          ? `${COMPANY_NAMES[stock.symbol] || stock.symbol} went up today`
                          : `${COMPANY_NAMES[stock.symbol] || stock.symbol} went down today`}
                      </p>
                      <p className="alert-price">${stock.price.toFixed(2)}</p>
                      <span className="alert-timestamp">Added {stock.addedAt}</span>
                    </div>

                    {/* Big drop tag */}
                    {isBigDrop && (
                      <div className="big-drop-tag">
                        <AlertTriangle size={11} />
                        Major Drop
                      </div>
                    )}

                    {/* Remove */}
                    <button
                      className="remove-btn"
                      onClick={() => removeStock(stock.id)}
                      title="Remove from watchlist"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Alerts;
