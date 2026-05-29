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
const WATCHLIST_SIMULATION_INTERVAL = 2200;

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

const demoStockUniverse = [
  ["AAPL", "Apple Inc.", "NASDAQ", "Technology", 198.42, 3050000000000, 52740231],
  ["MSFT", "Microsoft Corporation", "NASDAQ", "Technology", 429.12, 3190000000000, 18244912],
  ["NVDA", "NVIDIA Corporation", "NASDAQ", "Technology", 121.38, 2980000000000, 248630411],
  ["AMZN", "Amazon.com, Inc.", "NASDAQ", "Consumer Cyclical", 184.76, 1920000000000, 33128040],
  ["GOOGL", "Alphabet Inc.", "NASDAQ", "Communication Services", 176.44, 2180000000000, 22418613],
  ["META", "Meta Platforms, Inc.", "NASDAQ", "Communication Services", 507.12, 1280000000000, 14675023],
  ["TSLA", "Tesla, Inc.", "NASDAQ", "Consumer Cyclical", 176.29, 562000000000, 76342109],
  ["AVGO", "Broadcom Inc.", "NASDAQ", "Technology", 1421.54, 665000000000, 2863711],
  ["BRK.B", "Berkshire Hathaway Inc.", "NYSE", "Financial Services", 410.27, 886000000000, 3928441],
  ["LLY", "Eli Lilly and Company", "NYSE", "Healthcare", 812.14, 770000000000, 3148820],
  ["JPM", "JPMorgan Chase & Co.", "NYSE", "Financial Services", 201.39, 578000000000, 8162011],
  ["V", "Visa Inc.", "NYSE", "Financial Services", 276.93, 554000000000, 6221420],
  ["WMT", "Walmart Inc.", "NYSE", "Consumer Defensive", 67.48, 542000000000, 13278090],
  ["XOM", "Exxon Mobil Corporation", "NYSE", "Energy", 114.83, 454000000000, 15182290],
  ["UNH", "UnitedHealth Group Inc.", "NYSE", "Healthcare", 506.18, 466000000000, 3850270],
  ["MA", "Mastercard Incorporated", "NYSE", "Financial Services", 451.72, 421000000000, 2839440],
  ["COST", "Costco Wholesale Corporation", "NASDAQ", "Consumer Defensive", 809.62, 359000000000, 1778321],
  ["HD", "The Home Depot, Inc.", "NYSE", "Consumer Cyclical", 352.81, 350000000000, 3192210],
  ["PG", "The Procter & Gamble Company", "NYSE", "Consumer Defensive", 167.31, 394000000000, 5848392],
  ["JNJ", "Johnson & Johnson", "NYSE", "Healthcare", 147.92, 356000000000, 6849211],
  ["ORCL", "Oracle Corporation", "NYSE", "Technology", 124.77, 343000000000, 8541228],
  ["NFLX", "Netflix, Inc.", "NASDAQ", "Communication Services", 648.32, 279000000000, 3921882],
  ["AMD", "Advanced Micro Devices, Inc.", "NASDAQ", "Technology", 167.14, 270000000000, 49201183],
  ["CRM", "Salesforce, Inc.", "NYSE", "Technology", 271.84, 263000000000, 5632017],
  ["ADBE", "Adobe Inc.", "NASDAQ", "Technology", 487.11, 219000000000, 2981345],
  ["BAC", "Bank of America Corporation", "NYSE", "Financial Services", 39.81, 311000000000, 36200174],
  ["KO", "The Coca-Cola Company", "NYSE", "Consumer Defensive", 62.75, 270000000000, 13729450],
  ["PEP", "PepsiCo, Inc.", "NASDAQ", "Consumer Defensive", 173.94, 238000000000, 4811772],
  ["TMO", "Thermo Fisher Scientific Inc.", "NYSE", "Healthcare", 572.62, 218000000000, 1433224],
  ["CSCO", "Cisco Systems, Inc.", "NASDAQ", "Technology", 46.72, 188000000000, 18227341],
  ["ACN", "Accenture plc", "NYSE", "Technology", 301.78, 189000000000, 2611724],
  ["MCD", "McDonald's Corporation", "NYSE", "Consumer Cyclical", 287.45, 207000000000, 3021876],
  ["LIN", "Linde plc", "NASDAQ", "Basic Materials", 439.66, 211000000000, 1832944],
  ["ABT", "Abbott Laboratories", "NYSE", "Healthcare", 104.28, 181000000000, 5683301],
  ["DIS", "The Walt Disney Company", "NYSE", "Communication Services", 101.12, 184000000000, 9411228],
  ["INTC", "Intel Corporation", "NASDAQ", "Technology", 31.14, 132000000000, 44821773],
  ["IBM", "International Business Machines", "NYSE", "Technology", 169.72, 156000000000, 3221980],
  ["QCOM", "QUALCOMM Incorporated", "NASDAQ", "Technology", 204.48, 228000000000, 8272134],
  ["CAT", "Caterpillar Inc.", "NYSE", "Industrials", 338.15, 164000000000, 2148011],
  ["GE", "GE Aerospace", "NYSE", "Industrials", 158.12, 173000000000, 6188202],
  ["UBER", "Uber Technologies, Inc.", "NYSE", "Technology", 70.84, 148000000000, 19452720],
  ["NKE", "NIKE, Inc.", "NYSE", "Consumer Cyclical", 92.18, 139000000000, 8721884],
  ["BA", "The Boeing Company", "NYSE", "Industrials", 177.43, 108000000000, 6943330],
  ["GS", "The Goldman Sachs Group, Inc.", "NYSE", "Financial Services", 454.61, 147000000000, 2191002],
  ["SPGI", "S&P Global Inc.", "NYSE", "Financial Services", 432.88, 136000000000, 1373004],
  ["RTX", "RTX Corporation", "NYSE", "Industrials", 104.16, 138000000000, 6173223],
  ["T", "AT&T Inc.", "NYSE", "Communication Services", 18.21, 130000000000, 28210091],
  ["VZ", "Verizon Communications Inc.", "NYSE", "Communication Services", 40.32, 169000000000, 16438333],
  ["PLTR", "Palantir Technologies Inc.", "NYSE", "Technology", 24.83, 53200000000, 43822184],
  ["SHOP", "Shopify Inc.", "NYSE", "Technology", 64.78, 83400000000, 10221934],
].map(([symbol, name, exchange, sector, basePrice, marketCap, volume]) => ({
  symbol,
  name,
  exchange,
  sector,
  basePrice,
  marketCap,
  volume,
}));

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

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function roundMarketValue(value) {
  return Number(value.toFixed(2));
}

function shuffleStocks(stocks) {
  const shuffledStocks = [...stocks];

  for (let index = shuffledStocks.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(Math.random() * (index + 1));
    [shuffledStocks[index], shuffledStocks[targetIndex]] = [
      shuffledStocks[targetIndex],
      shuffledStocks[index],
    ];
  }

  return shuffledStocks;
}

function createDemoWatchlistItem(stock) {
  const previousClose = roundMarketValue(
    stock.basePrice * (1 + randomBetween(-0.018, 0.018))
  );
  const price = roundMarketValue(
    previousClose * (1 + randomBetween(-0.026, 0.026))
  );
  const change = roundMarketValue(price - previousClose);
  const changePercent = roundMarketValue((change / previousClose) * 100);
  const movementScale = Math.max(stock.basePrice * 0.012, 0.42);

  return {
    ...stock,
    quote: {
      price,
      change,
      changePercent,
      previousClose,
      dayHigh: roundMarketValue(Math.max(price, previousClose) * 1.004),
      dayLow: roundMarketValue(Math.min(price, previousClose) * 0.996),
      volume: stock.volume + Math.floor(randomBetween(1000, 900000)),
      marketCap: stock.marketCap,
      updatedAt: new Date().toISOString(),
    },
    history: createDemoHistory(price, movementScale),
  };
}

function createWatchlistDemoData() {
  return {
    status: {
      isLive: false,
      label: "Research stream active",
      provider: "50-stock research universe",
      updatedAt: new Date().toISOString(),
    },
    items: shuffleStocks(demoStockUniverse).map(createDemoWatchlistItem),
  };
}

function updateDemoHistory(history, price) {
  return Object.fromEntries(
    Object.entries(history).map(([range, points]) => {
      if (range === "1D") {
        const currentTime = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return [
          range,
          [...points.slice(1), { label: currentTime, value: price }],
        ];
      }

      return [
        range,
        points.map((point, index) =>
          index === points.length - 1 ? { ...point, value: price } : point
        ),
      ];
    })
  );
}

function simulateWatchlistTick(previousData) {
  return {
    ...previousData,
    status: {
      ...previousData.status,
      updatedAt: new Date().toISOString(),
    },
    items: previousData.items.map((item) => {
      const price = roundMarketValue(
        Math.max(item.quote.price * (1 + randomBetween(-0.0028, 0.0028)), 0.01)
      );
      const change = roundMarketValue(price - item.quote.previousClose);
      const changePercent = roundMarketValue(
        (change / item.quote.previousClose) * 100
      );

      return {
        ...item,
        quote: {
          ...item.quote,
          price,
          change,
          changePercent,
          dayHigh: Math.max(item.quote.dayHigh, price),
          dayLow: Math.min(item.quote.dayLow, price),
          volume: item.quote.volume + Math.floor(randomBetween(500, 140000)),
          updatedAt: new Date().toISOString(),
        },
        history: updateDemoHistory(item.history, price),
      };
    }),
  };
}

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
    if (sortBy === "featured") {
      return 0;
    }

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
  const [simulatedData, setSimulatedData] = useState(() =>
    createWatchlistDemoData()
  );
  const [preferences, setPreferences] = useState(() => readWatchlistPreferences());
  const [alerts, setAlerts] = useState(() => readAlerts());
  const [notes, setNotes] = useState(() => readNotes());
  const [searchTerm, setSearchTerm] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filter, setFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [historyRange, setHistoryRange] = useState("1M");
  const isSimulatedDemo = data == null && runtimeData == null;
  const watchlistData = useMemo(
    () => normalizeWatchlistData(data ?? runtimeData ?? simulatedData),
    [data, runtimeData, simulatedData]
  );
  const items = useMemo(
    () => mergeTrackedItems(watchlistData.items, preferences),
    [watchlistData.items, preferences]
  );
  const sectors = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.sector).filter(Boolean))).sort(),
    [items]
  );
  const visibleItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const searchedItems = items.filter(
      (item) =>
        !query ||
        item.symbol.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.sector.toLowerCase().includes(query)
    );
    const sectorItems = searchedItems.filter(
      (item) => sectorFilter === "all" || item.sector === sectorFilter
    );
    const filteredItems = sectorItems.filter((item) => {
      const change = item.quote.changePercent;

      if (filter === "gainers") return change !== null && change > 0;
      if (filter === "losers") return change !== null && change < 0;
      if (filter === "alerts") return alerts[item.symbol]?.enabled;
      return true;
    });

    return sortWatchlist(filteredItems, sortBy);
  }, [alerts, filter, items, searchTerm, sectorFilter, sortBy]);
  const activeSymbol = visibleItems.some((item) => item.symbol === selectedSymbol)
    ? selectedSymbol
    : visibleItems[0]?.symbol;
  const selectedItem = visibleItems.find((item) => item.symbol === activeSymbol);
  const quotedItems = items.filter((item) => item.quote.price !== null);
  const movers = items.filter((item) => item.quote.changePercent !== null);
  const gainers = movers.filter((item) => item.quote.changePercent > 0).length;
  const losers = movers.filter((item) => item.quote.changePercent < 0).length;
  const activeAlerts = items.filter((item) => alerts[item.symbol]?.enabled).length;
  const triggeredAlerts = items.filter((item) =>
    isAlertTriggered(alerts[item.symbol], item.quote.price)
  ).length;
  const noteCount = items.filter((item) => notes[item.symbol]?.trim()).length;
  const averageChange =
    movers.length > 0
      ? movers.reduce((total, item) => total + item.quote.changePercent, 0) /
        movers.length
      : null;
  const watchlistScore = Math.round(
    Math.min(98, Math.max(36, 66 + (averageChange || 0) * 8 + activeAlerts * 0.8))
  );
  const bestMover = [...movers].sort(
    (left, right) => right.quote.changePercent - left.quote.changePercent
  )[0];
  const weakestMover = [...movers].sort(
    (left, right) => left.quote.changePercent - right.quote.changePercent
  )[0];
  const topGainers = [...movers]
    .sort((left, right) => right.quote.changePercent - left.quote.changePercent)
    .slice(0, 4);
  const sectorPulse = sectors
    .map((sector) => {
      const sectorItems = movers.filter((item) => item.sector === sector);
      const average =
        sectorItems.length > 0
          ? sectorItems.reduce((total, item) => total + item.quote.changePercent, 0) /
            sectorItems.length
          : 0;

      return { sector, average, count: sectorItems.length };
    })
    .sort((left, right) => right.average - left.average)
    .slice(0, 5);
  const watchlistBrief =
    averageChange === null
      ? "Quotes are loading for the current watchlist universe."
      : averageChange >= 0
        ? "The list is leaning positive. Focus on leaders with clean trend support and strong relative strength."
        : "The list is under pressure. Prioritize risk controls, alerts, and only the cleanest setups.";

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

  useEffect(() => {
    if (!isSimulatedDemo) return undefined;

    const simulationTimer = window.setInterval(() => {
      setSimulatedData((currentData) => simulateWatchlistTick(currentData));
    }, WATCHLIST_SIMULATION_INTERVAL);

    return () => window.clearInterval(simulationTimer);
  }, [isSimulatedDemo]);

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
            professional research workspace. A 50-stock universe keeps the page active
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
          note={isSimulatedDemo ? "Research stream refreshes every few seconds" : "Live feed connected"}
        />
        <SummaryCard
          icon={Activity}
          label="Trend score"
          value={`${watchlistScore}/100`}
          note={
            averageChange === null
              ? "Awaiting quotes"
              : `${gainers} gainers, ${losers} laggards`
          }
        />
        <SummaryCard
          icon={BellRing}
          label="Risk alerts"
          value={activeAlerts}
          note={
            triggeredAlerts > 0
              ? `${triggeredAlerts} triggered now`
              : `${noteCount} research notes saved`
          }
        />
      </div>

      <section className="watchlist-command-center" aria-label="Watchlist intelligence">
        <article className="watchlist-focus-card">
          <div>
            <span className="watchlist-eyebrow">Watchlist intelligence</span>
            <h2>{averageChange === null ? "Build your market view" : "Research desk snapshot"}</h2>
            <p>{watchlistBrief}</p>
          </div>
          <div className="watchlist-score">
            <strong>{watchlistScore}</strong>
            <span>List score</span>
          </div>
          <div className="watchlist-focus-grid">
            <span>
              <small>Best mover</small>
              <strong>{bestMover ? `${bestMover.symbol} ${formatPercent(bestMover.quote.changePercent)}` : "--"}</strong>
            </span>
            <span>
              <small>Weakest mover</small>
              <strong>{weakestMover ? `${weakestMover.symbol} ${formatPercent(weakestMover.quote.changePercent)}` : "--"}</strong>
            </span>
            <span>
              <small>Coverage</small>
              <strong>{items.length} stocks</strong>
            </span>
          </div>
        </article>

        <article className="watchlist-rank-card">
          <div className="watchlist-panel-head compact">
            <h2>Opportunity Queue</h2>
            <span>Top 4</span>
          </div>
          <div className="watchlist-mini-list">
            {(topGainers.length > 0 ? topGainers : visibleItems.slice(0, 4)).map((item) => (
              <button
                type="button"
                key={item.symbol}
                onClick={() => setSelectedSymbol(item.symbol)}
              >
                <strong>{item.symbol}</strong>
                <span>{item.name}</span>
                <em className={getQuoteTone(item.quote.changePercent)}>
                  {formatPercent(item.quote.changePercent)}
                </em>
              </button>
            ))}
          </div>
        </article>

        <article className="watchlist-rank-card">
          <div className="watchlist-panel-head compact">
            <h2>Sector Pulse</h2>
            <span>{sectorPulse.length} sectors</span>
          </div>
          <div className="watchlist-sector-list">
            {sectorPulse.map((item) => (
              <button
                type="button"
                key={item.sector}
                onClick={() => setSectorFilter(item.sector)}
              >
                <span>{item.sector}</span>
                <strong className={getQuoteTone(item.average)}>
                  {formatPercent(item.average)}
                </strong>
              </button>
            ))}
          </div>
        </article>
      </section>

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
          aria-label="Filter by sector"
          value={sectorFilter}
          onChange={(event) => setSectorFilter(event.target.value)}
        >
          <option value="all">All sectors</option>
          {sectors.map((sector) => (
            <option value={sector} key={sector}>
              {sector}
            </option>
          ))}
        </select>

        <select
          className="watchlist-control"
          aria-label="Sort securities"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="featured">Sort: Default order</option>
          <option value="symbol">Sort: Symbol</option>
          <option value="change">Sort: Daily change</option>
          <option value="price">Sort: Price</option>
        </select>

        <button
          className="watchlist-button"
          type="button"
          onClick={() => {
            setSearchTerm("");
            setFilter("all");
            setSectorFilter("all");
            setSortBy("featured");
          }}
        >
          Reset
        </button>

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
            <span>{visibleItems.length} of {items.length} shown</span>
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
                            {item.sector && <em>{item.sector}</em>}
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
          Research stream mode is active with refreshed movement across 50 securities.
          When a market feed provides watchlist data, its snapshot replaces this
          stream automatically.
        </span>
      </div>
    </section>
  );
}

export default Watchlist;
