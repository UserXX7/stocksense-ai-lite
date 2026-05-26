import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BellRing,
  Clock3,
  Database,
  Download,
  History,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  WATCHLIST_ALERTS_KEY,
  WATCHLIST_DATA_EVENT,
  WATCHLIST_DATA_STORAGE_KEY,
  WATCHLIST_NOTES_KEY,
  WATCHLIST_PREFERENCES_KEY,
  addTrackedSymbol,
  announceWatchlistAction,
  downloadWatchlistCsv,
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  getQuoteTone,
  isAlertTriggered,
  mergeTrackedItems,
  normalizeSymbol,
  normalizeWatchlistData,
  readAlerts,
  readNotes,
  readRuntimeWatchlistData,
  readWatchlistPreferences,
  removeTrackedSymbol,
  saveAlerts,
  saveNotes,
  saveWatchlistPreferences,
} from "../features/watchlist/watchlistData";
import "../features/watchlist/watchlist.css";

const historyRanges = ["1D", "1W", "1M", "3M", "1Y"];

const demoHistoryFrames = {
  "1D": {
    labels: ["9:30", "10:30", "11:30", "12:30", "1:30", "2:30", "3:30"],
    offsets: [-1.3, -0.65, -0.92, -0.28, 0.34, 0.16, 0],
  },
  "1W": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    offsets: [-2.8, -1.65, -2.1, -0.76, 0],
  },
  "1M": {
    labels: ["May 01", "May 08", "May 15", "May 22", "May 26"],
    offsets: [-4.2, -3.15, -1.84, -2.38, 0],
  },
  "3M": {
    labels: ["Mar", "Apr", "May"],
    offsets: [-7.4, -3.82, 0],
  },
  "1Y": {
    labels: ["Jul", "Sep", "Nov", "Jan", "Mar", "May"],
    offsets: [-13.2, -9.8, -11.4, -6.72, -4.31, 0],
  },
};

function createDemoHistory(latestPrice, movementScale) {
  return Object.fromEntries(
    Object.entries(demoHistoryFrames).map(([range, frame]) => [
      range,
      frame.labels.map((label, index) => ({
        label,
        value: Number(
          (latestPrice + frame.offsets[index] * movementScale).toFixed(2)
        ),
      })),
    ])
  );
}

const watchlistDemoData = {
  status: {
    isLive: false,
    label: "Demo data - not live",
    provider: "Sample dataset",
    updatedAt: "Preview values only",
  },
  items: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      exchange: "NASDAQ",
      sector: "Technology",
      quote: {
        price: 198.42,
        change: 2.1,
        changePercent: 1.07,
        previousClose: 196.32,
        dayHigh: 199.02,
        dayLow: 195.88,
        volume: 52740231,
        marketCap: 3050000000000,
        updatedAt: "Preview values only",
      },
      history: createDemoHistory(198.42, 1),
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      exchange: "NASDAQ",
      sector: "Technology",
      quote: {
        price: 429.12,
        change: 2.31,
        changePercent: 0.54,
        previousClose: 426.81,
        dayHigh: 431.08,
        dayLow: 425.72,
        volume: 18244912,
        marketCap: 3190000000000,
        updatedAt: "Preview values only",
      },
      history: createDemoHistory(429.12, 1.75),
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      exchange: "NASDAQ",
      sector: "Technology",
      quote: {
        price: 121.38,
        change: 4.26,
        changePercent: 3.64,
        previousClose: 117.12,
        dayHigh: 122.14,
        dayLow: 117.54,
        volume: 248630411,
        marketCap: 2980000000000,
        updatedAt: "Preview values only",
      },
      history: createDemoHistory(121.38, 1.42),
    },
    {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      exchange: "NASDAQ",
      sector: "Consumer Cyclical",
      quote: {
        price: 176.29,
        change: -2.59,
        changePercent: -1.45,
        previousClose: 178.88,
        dayHigh: 180.31,
        dayLow: 174.91,
        volume: 76342109,
        marketCap: 562000000000,
        updatedAt: "Preview values only",
      },
      history: createDemoHistory(176.29, -1.2),
    },
    {
      symbol: "AMZN",
      name: "Amazon.com, Inc.",
      exchange: "NASDAQ",
      sector: "Consumer Cyclical",
      quote: {
        price: 184.76,
        change: -0.7,
        changePercent: -0.38,
        previousClose: 185.46,
        dayHigh: 186.21,
        dayLow: 183.84,
        volume: 33128040,
        marketCap: 1920000000000,
        updatedAt: "Preview values only",
      },
      history: createDemoHistory(184.76, -0.72),
    },
  ],
};

function formatTimestamp(value) {
  if (!value) return "Awaiting provider timestamp";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function sortWatchlist(items, sortBy) {
  return [...items].sort((left, right) => {
    if (sortBy === "change") {
      return (right.quote.changePercent ?? -Infinity) -
        (left.quote.changePercent ?? -Infinity);
    }

    if (sortBy === "price") {
      return (right.quote.price ?? -Infinity) - (left.quote.price ?? -Infinity);
    }

    return left.symbol.localeCompare(right.symbol);
  });
}

function SummaryCard({ icon: Icon, label, value, note }) {
  return (
    <article className="watchlist-stat">
      <span className="watchlist-stat-label">
        <Icon size={16} />
        {label}
      </span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function EmptyPanel({ title, message }) {
  return (
    <div className="watchlist-empty">
      <Star size={26} />
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}

function AlertEditor({ symbol, alert, price, onSave, onRemove, onToggle }) {
  const [direction, setDirection] = useState(alert?.direction || "above");
  const [target, setTarget] = useState(alert?.target || "");
  const triggered = isAlertTriggered(alert, price);

  function handleSubmit(event) {
    event.preventDefault();

    const numericTarget = Number(target);

    if (!Number.isFinite(numericTarget) || numericTarget <= 0) return;

    onSave(symbol, {
      direction,
      target: numericTarget,
      enabled: true,
    });
  }

  return (
    <div className="watchlist-section">
      <div className="watchlist-section-title">
        <h3>
          <BellRing size={16} />
          Price alert
        </h3>
        {alert && (
          <span className={`watchlist-alert-pill ${triggered ? "triggered" : ""}`}>
            {triggered ? "Triggered" : alert.enabled ? "Armed" : "Paused"}
          </span>
        )}
      </div>

      <form className="watchlist-alert-form" onSubmit={handleSubmit}>
        <select
          className="watchlist-control"
          aria-label="Alert direction"
          value={direction}
          onChange={(event) => setDirection(event.target.value)}
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <input
          className="watchlist-alert-input"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Target price"
          aria-label="Alert target price"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
        />
        <button className="watchlist-button primary" type="submit">
          Save
        </button>
      </form>

      {alert && (
        <div className="watchlist-toolbar watchlist-alert-actions">
          <button
            className="watchlist-button"
            type="button"
            onClick={() => onToggle(symbol)}
          >
            {alert.enabled ? "Pause alert" : "Resume alert"}
          </button>
          <button
            className="watchlist-button"
            type="button"
            onClick={() => onRemove(symbol)}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function InstrumentInspector({
  item,
  range,
  alert,
  note,
  onRangeChange,
  onSaveAlert,
  onRemoveAlert,
  onToggleAlert,
  onNoteChange,
  onViewDetails,
}) {
  const tone = getQuoteTone(item.quote.changePercent);
  const history = item.history[range] || [];

  return (
    <article className="watchlist-panel">
      <div className="watchlist-inspector-head">
        <div>
          <span className="watchlist-eyebrow">Selected security</span>
          <h2>{item.symbol}</h2>
          <p>{item.name}</p>
        </div>
        <div className="watchlist-latest">
          <strong>{formatCurrency(item.quote.price)}</strong>
          <span className={`watchlist-change ${tone}`}>
            {formatPercent(item.quote.changePercent)}
          </span>
        </div>
      </div>

      <div className="watchlist-range" aria-label="History timeframe">
        {historyRanges.map((historyRange) => (
          <button
            className={range === historyRange ? "active" : ""}
            type="button"
            key={historyRange}
            onClick={() => onRangeChange(historyRange)}
          >
            {historyRange}
          </button>
        ))}
      </div>

      <div className="watchlist-chart">
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 8, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="watchlistGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22e6a8" stopOpacity={0.36} />
                  <stop offset="95%" stopColor="#22e6a8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#173044"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#718096"
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  background: "#081421",
                  border: "1px solid #1b2f42",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22e6a8"
                strokeWidth={2.5}
                fill="url(#watchlistGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="watchlist-chart-empty">
            Historical prices will chart here once the market data service provides
            {` ${range} `}history.
          </div>
        )}
      </div>

      <div className="watchlist-metrics">
        <div className="watchlist-metric">
          <span>Previous close</span>
          <strong>{formatCurrency(item.quote.previousClose)}</strong>
        </div>
        <div className="watchlist-metric">
          <span>Day range</span>
          <strong>
            {formatCurrency(item.quote.dayLow)} - {formatCurrency(item.quote.dayHigh)}
          </strong>
        </div>
        <div className="watchlist-metric">
          <span>Volume</span>
          <strong>{formatCompactNumber(item.quote.volume)}</strong>
        </div>
        <div className="watchlist-metric">
          <span>Market cap</span>
          <strong>{formatCompactNumber(item.quote.marketCap)}</strong>
        </div>
      </div>

      <button className="watchlist-button primary" type="button" onClick={onViewDetails}>
        View stock details
      </button>

      <AlertEditor
        key={`${item.symbol}-${alert?.target || ""}-${alert?.enabled || false}`}
        symbol={item.symbol}
        alert={alert}
        price={item.quote.price}
        onSave={onSaveAlert}
        onRemove={onRemoveAlert}
        onToggle={onToggleAlert}
      />

      <div className="watchlist-section">
        <div className="watchlist-section-title">
          <h3>
            <History size={16} />
            Research note
          </h3>
          <span>Stored locally</span>
        </div>
        <textarea
          className="watchlist-note"
          placeholder="Record your thesis, entry level, or risk note..."
          value={note}
          onChange={(event) => onNoteChange(item.symbol, event.target.value)}
        />
      </div>
    </article>
  );
}

function Watchlist({ data }) {
  const navigate = useNavigate();
  const [runtimeData, setRuntimeData] = useState(() => readRuntimeWatchlistData());
  const [preferences, setPreferences] = useState(() => readWatchlistPreferences());
  const [alerts, setAlerts] = useState(() => readAlerts());
  const [notes, setNotes] = useState(() => readNotes());
  const [searchTerm, setSearchTerm] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [sortBy, setSortBy] = useState("symbol");
  const [filter, setFilter] = useState("all");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [historyRange, setHistoryRange] = useState("1M");
  const watchlistData = useMemo(
    () => normalizeWatchlistData(data ?? runtimeData ?? watchlistDemoData),
    [data, runtimeData]
  );
  const items = useMemo(
    () => mergeTrackedItems(watchlistData.items, preferences),
    [watchlistData.items, preferences]
  );
  const visibleItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const searchedItems = items.filter(
      (item) =>
        !query ||
        item.symbol.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
    );
    const filteredItems = searchedItems.filter((item) => {
      const change = item.quote.changePercent;

      if (filter === "gainers") return change !== null && change > 0;
      if (filter === "losers") return change !== null && change < 0;
      if (filter === "alerts") return alerts[item.symbol]?.enabled;
      return true;
    });

    return sortWatchlist(filteredItems, sortBy);
  }, [alerts, filter, items, searchTerm, sortBy]);
  const activeSymbol = visibleItems.some((item) => item.symbol === selectedSymbol)
    ? selectedSymbol
    : visibleItems[0]?.symbol;
  const selectedItem = visibleItems.find((item) => item.symbol === activeSymbol);
  const quotedItems = items.filter((item) => item.quote.price !== null);
  const movers = items.filter((item) => item.quote.changePercent !== null);
  const gainers = movers.filter((item) => item.quote.changePercent > 0).length;
  const activeAlerts = items.filter((item) => alerts[item.symbol]?.enabled).length;
  const averageChange =
    movers.length > 0
      ? movers.reduce((total, item) => total + item.quote.changePercent, 0) /
        movers.length
      : null;

  useEffect(() => {
    function handleLiveData(event) {
      setRuntimeData(event.detail);
    }

    function handleStorage(event) {
      if (event.key === WATCHLIST_DATA_STORAGE_KEY) {
        setRuntimeData(readRuntimeWatchlistData());
      }

      if (event.key === WATCHLIST_PREFERENCES_KEY) {
        setPreferences(readWatchlistPreferences());
      }

      if (event.key === WATCHLIST_ALERTS_KEY) {
        setAlerts(readAlerts());
      }

      if (event.key === WATCHLIST_NOTES_KEY) {
        setNotes(readNotes());
      }
    }

    window.addEventListener(WATCHLIST_DATA_EVENT, handleLiveData);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(WATCHLIST_DATA_EVENT, handleLiveData);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function handleAddSymbol(event) {
    event.preventDefault();

    const symbol = normalizeSymbol(newSymbol);

    if (!symbol) return;

    const nextPreferences = addTrackedSymbol(preferences, symbol);
    setPreferences(nextPreferences);
    saveWatchlistPreferences(nextPreferences);
    setSelectedSymbol(symbol);
    setNewSymbol("");
    announceWatchlistAction("add-symbol", { symbol });
  }

  function handleRemoveSymbol(symbol) {
    const nextPreferences = removeTrackedSymbol(preferences, symbol);
    setPreferences(nextPreferences);
    saveWatchlistPreferences(nextPreferences);
    announceWatchlistAction("remove-symbol", { symbol });
  }

  function handleSaveAlert(symbol, alert) {
    const nextAlerts = { ...alerts, [symbol]: alert };
    setAlerts(nextAlerts);
    saveAlerts(nextAlerts);
    announceWatchlistAction("save-alert", { symbol, alert });
  }

  function handleRemoveAlert(symbol) {
    const nextAlerts = { ...alerts };
    delete nextAlerts[symbol];
    setAlerts(nextAlerts);
    saveAlerts(nextAlerts);
    announceWatchlistAction("remove-alert", { symbol });
  }

  function handleToggleAlert(symbol) {
    const currentAlert = alerts[symbol];

    if (!currentAlert) return;

    handleSaveAlert(symbol, {
      ...currentAlert,
      enabled: !currentAlert.enabled,
    });
  }

  function handleNoteChange(symbol, note) {
    const nextNotes = { ...notes, [symbol]: note };
    setNotes(nextNotes);
    saveNotes(nextNotes);
  }

  return (
    <section className="page watchlist-page">
      <header className="watchlist-header">
        <div>
          <span className="watchlist-eyebrow">
            <TrendingUp size={15} />
            Personal market monitor
          </span>
          <h1>Watchlist</h1>
          <p className="watchlist-subtitle">
            Track securities, study price history, and manage alert levels in one
            research workspace. Preview values are clearly identified as demo data
            until a live provider is connected.
          </p>
        </div>

        <div className="watchlist-status" aria-label="Market data connection status">
          <div className="watchlist-status-row">
            <span
              className={`watchlist-status-dot ${
                watchlistData.status.isLive ? "live" : ""
              }`}
            ></span>
            {watchlistData.status.label}
          </div>
          <small>
            {watchlistData.status.provider
              ? `${watchlistData.status.provider} - `
              : ""}
            {formatTimestamp(watchlistData.status.updatedAt)}
          </small>
        </div>
      </header>

      <div className="watchlist-summary" aria-label="Watchlist summary">
        <SummaryCard
          icon={Star}
          label="Securities tracked"
          value={items.length}
          note="Saved to your watchlist"
        />
        <SummaryCard
          icon={Database}
          label="Quotes received"
          value={`${quotedItems.length}/${items.length}`}
          note="Updates when market data arrives"
        />
        <SummaryCard
          icon={Activity}
          label="Daily movement"
          value={averageChange === null ? "--" : formatPercent(averageChange)}
          note={movers.length > 0 ? `${gainers} gainers today` : "Awaiting quotes"}
        />
        <SummaryCard
          icon={BellRing}
          label="Active alerts"
          value={activeAlerts}
          note="Targets monitored from live prices"
        />
      </div>

      <div className="watchlist-toolbar" aria-label="Watchlist controls">
        <label className="watchlist-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search watchlist"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <select
          className="watchlist-control"
          aria-label="Filter securities"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All securities</option>
          <option value="gainers">Gainers</option>
          <option value="losers">Losers</option>
          <option value="alerts">With alerts</option>
        </select>

        <select
          className="watchlist-control"
          aria-label="Sort securities"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="symbol">Sort: Symbol</option>
          <option value="change">Sort: Daily change</option>
          <option value="price">Sort: Price</option>
        </select>

        <form className="watchlist-add" onSubmit={handleAddSymbol}>
          <input
            type="text"
            placeholder="Add ticker, e.g. AAPL"
            maxLength={12}
            value={newSymbol}
            onChange={(event) => setNewSymbol(event.target.value)}
          />
          <button className="watchlist-button primary" type="submit">
            <Plus size={16} />
            Add
          </button>
        </form>

        <button
          className="watchlist-button"
          type="button"
          disabled={items.length === 0}
          onClick={() => downloadWatchlistCsv(items)}
        >
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="watchlist-workspace">
        <article className="watchlist-panel">
          <div className="watchlist-panel-head">
            <h2>Tracked securities</h2>
            <span>{visibleItems.length} shown</span>
          </div>

          {visibleItems.length > 0 ? (
            <>
              <div className="watchlist-table-head" aria-hidden="true">
                <span>Security</span>
                <span>Last price</span>
                <span>Day change</span>
                <span>Volume</span>
                <span></span>
              </div>
              <div className="watchlist-rows">
                {visibleItems.map((item) => {
                  const tone = getQuoteTone(item.quote.changePercent);

                  return (
                    <div
                      className={`watchlist-row ${
                        item.symbol === activeSymbol ? "selected" : ""
                      }`}
                      key={item.symbol}
                    >
                      <button
                        className="watchlist-row-target"
                        type="button"
                        aria-label={`Select ${item.symbol} for analysis`}
                        onClick={() => setSelectedSymbol(item.symbol)}
                      >
                        <span className="watchlist-symbol">
                          <span className="watchlist-ticker">
                            {item.symbol.slice(0, 2)}
                          </span>
                          <span>
                            <strong>{item.symbol}</strong>
                            <small>{item.name}</small>
                          </span>
                        </span>
                        <span className="watchlist-cell">
                          <strong>{formatCurrency(item.quote.price)}</strong>
                          <small>{item.exchange || "Awaiting quote"}</small>
                        </span>
                        <span className={`watchlist-cell ${tone}`}>
                          <strong>{formatPercent(item.quote.changePercent)}</strong>
                          <small>
                            {alerts[item.symbol]?.enabled ? "Alert armed" : "No alert"}
                          </small>
                        </span>
                        <span className="watchlist-cell volume">
                          <strong>{formatCompactNumber(item.quote.volume)}</strong>
                          <small>Volume</small>
                        </span>
                      </button>
                      <button
                        className="watchlist-remove"
                        type="button"
                        aria-label={`Remove ${item.symbol} from watchlist`}
                        onClick={() => handleRemoveSymbol(item.symbol)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyPanel
              title={items.length > 0 ? "No matching securities" : "Start your watchlist"}
              message={
                items.length > 0
                  ? "Adjust your search or filter to view tracked stocks."
                  : "Add a ticker above. Quotes and history will populate when data is connected."
              }
            />
          )}
        </article>

        {selectedItem ? (
          <InstrumentInspector
            item={selectedItem}
            range={historyRange}
            alert={alerts[selectedItem.symbol]}
            note={notes[selectedItem.symbol] || ""}
            onRangeChange={setHistoryRange}
            onSaveAlert={handleSaveAlert}
            onRemoveAlert={handleRemoveAlert}
            onToggleAlert={handleToggleAlert}
            onNoteChange={handleNoteChange}
            onViewDetails={() => navigate(`/stock/${selectedItem.symbol}`)}
          />
        ) : (
          <article className="watchlist-panel">
            <EmptyPanel
              title="No security selected"
              message="Select or add a security to view its history, metrics, and alerts."
            />
          </article>
        )}
      </div>

      <div className="watchlist-data-guide">
        <Clock3 size={17} />
        <span>
          Displaying labelled demo quotes and price history for presentation. When a
          market feed provides live watchlist data, that incoming snapshot replaces this
          preview automatically.
        </span>
      </div>
    </section>
  );
}

export default Watchlist;
