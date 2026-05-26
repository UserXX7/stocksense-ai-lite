import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Newspaper,
  ShieldCheck,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DASHBOARD_DATA_EVENT = "stocksense:dashboard-data";
const DASHBOARD_STORAGE_KEY = "stocksenseDashboardData";

const emptyDashboardData = {
  header: {
    kicker: "Live market workspace",
    title: "Dashboard",
    summary: "Market overview, top movers, watchlist, and AI market summary.",
  },
  status: {
    label: "Waiting for live data",
    updatedAt: "Not connected",
    isLive: false,
  },
  marketIndexes: [],
  marketTrend: {
    label: "Intraday Trend",
    changePercent: null,
    points: [],
  },
  portfolioStats: [],
  topMovers: [],
  watchlistPreview: [],
  sectorPerformance: [],
  aiHighlights: [],
  newsItems: [],
};

const dashboardDemoData = {
  header: {
    kicker: "Demo market workspace",
    title: "Dashboard",
    summary:
      "Preview market coverage, saved securities, and analysis workflows while live market services are being connected.",
  },
  status: {
    label: "Demo data - not live",
    updatedAt: "Sample snapshot",
    isLive: false,
  },
  marketIndexes: [
    {
      symbol: "SPX",
      name: "S&P 500",
      value: 5321.41,
      changePercent: 0.42,
      detail: "Broad market benchmark",
    },
    {
      symbol: "IXIC",
      name: "NASDAQ Composite",
      value: 16864.12,
      changePercent: 0.87,
      detail: "Technology-heavy index",
    },
    {
      symbol: "DJI",
      name: "Dow Jones",
      value: 39487.64,
      changePercent: -0.18,
      detail: "Blue-chip industrials",
    },
    {
      symbol: "RUT",
      name: "Russell 2000",
      value: 2064.75,
      changePercent: 0.23,
      detail: "Small-cap benchmark",
    },
  ],
  marketTrend: {
    label: "S&P 500 Intraday Trend",
    changePercent: 0.42,
    points: [
      { time: "9:30", value: 5304.18 },
      { time: "10:00", value: 5309.63 },
      { time: "10:30", value: 5306.42 },
      { time: "11:00", value: 5312.77 },
      { time: "11:30", value: 5316.24 },
      { time: "12:00", value: 5314.61 },
      { time: "1:00", value: 5319.08 },
      { time: "2:00", value: 5317.52 },
      { time: "3:00", value: 5321.41 },
    ],
  },
  portfolioStats: [
    {
      type: "portfolio",
      label: "Watchlist value",
      value: 125840.74,
      valueType: "currency",
      change: "Illustrative tracked value",
    },
    {
      type: "signals",
      label: "Price alerts armed",
      value: 4,
      valueType: "number",
      change: "Demo monitoring targets",
    },
    {
      type: "risk",
      label: "Daily exposure",
      value: "Balanced",
      change: "Sample portfolio profile",
    },
  ],
  topMovers: [
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 121.38,
      changePercent: 3.64,
    },
    {
      symbol: "AMD",
      name: "Advanced Micro Devices",
      price: 167.14,
      changePercent: 2.21,
    },
    {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      price: 176.29,
      changePercent: -1.45,
    },
  ],
  watchlistPreview: [
    {
      symbol: "AAPL",
      company: "Apple Inc.",
      price: 198.42,
      changePercent: 1.07,
    },
    {
      symbol: "MSFT",
      company: "Microsoft Corporation",
      price: 429.12,
      changePercent: 0.54,
    },
    {
      symbol: "AMZN",
      company: "Amazon.com, Inc.",
      price: 184.76,
      changePercent: -0.38,
    },
  ],
  sectorPerformance: [
    { sector: "Tech", value: 2.4 },
    { sector: "Energy", value: 0.8 },
    { sector: "Health", value: 1.2 },
    { sector: "Finance", value: 0.5 },
    { sector: "Retail", value: -0.3 },
  ],
  aiHighlights: [
    {
      type: "momentum",
      title: "Demo momentum read",
      text: "Technology shares are leading this illustrative market session.",
    },
    {
      type: "volatility",
      title: "Demo volatility read",
      text: "Selected watchlist names show moderate intraday movement.",
    },
  ],
  newsItems: [
    {
      headline: "Sample headline: Technology sector leads market breadth",
      source: "Demo feed",
      time: "Preview only",
    },
    {
      headline: "Sample headline: Investors watch upcoming earnings reports",
      source: "Demo feed",
      time: "Preview only",
    },
  ],
};

const statIcons = {
  portfolio: Wallet,
  signals: Eye,
  risk: ShieldCheck,
};

const insightIcons = {
  momentum: Brain,
  volatility: Activity,
  focus: CalendarClock,
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function safeParseJson(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readDashboardDataFromRuntime() {
  if (typeof window === "undefined") return null;

  return (
    window.stockSenseDashboardData ||
    safeParseJson(localStorage.getItem(DASHBOARD_STORAGE_KEY))
  );
}

function listFromSource(sourceValue) {
  return Array.isArray(sourceValue) ? sourceValue : [];
}

function normalizeDashboardData(apiData) {
  const source = apiData || {};
  const marketIndexes = listFromSource(source.marketIndexes).map(
    normalizeMarketIndex
  );
  const marketTrend = normalizeMarketTrend(source.marketTrend);
  const portfolioStats = listFromSource(source.portfolioStats).map(
    normalizePortfolioStat
  );
  const topMovers = listFromSource(source.topMovers).map(normalizeStock);
  const watchlistPreview = listFromSource(source.watchlistPreview).map(
    normalizeStock
  );
  const sectorPerformance = listFromSource(source.sectorPerformance).map(
    normalizeSector
  );
  const aiHighlights = listFromSource(source.aiHighlights);
  const newsItems = listFromSource(source.newsItems);

  return {
    header: {
      ...emptyDashboardData.header,
      ...source.header,
    },
    status: {
      ...emptyDashboardData.status,
      ...source.status,
    },
    overviewCards:
      source.overviewCards || buildOverviewCards({
        marketIndexes,
        aiHighlights,
        watchlistPreview,
      }),
    marketIndexes,
    marketTrend,
    portfolioStats,
    topMovers,
    watchlistPreview,
    sectorPerformance,
    aiHighlights,
    newsItems,
  };
}

function buildOverviewCards({ marketIndexes, aiHighlights, watchlistPreview }) {
  return [
    {
      title: "Market Overview",
      text: "S&P 500, NASDAQ, DOW, and major market indexes.",
      metric:
        marketIndexes.length > 0
          ? `${marketIndexes.length} indexes tracked`
          : "Waiting for live market data",
      note: "This will update from the market API.",
    },
    {
      title: "AI Market Summary",
      text:
        aiHighlights[0]?.text ||
        "AI-generated market insight will appear after data is connected.",
      metric: aiHighlights[0]?.title || "Waiting for AI insight",
      note: "This will update from the insights service.",
    },
    {
      title: "Watchlist",
      text: "Track your favorite stocks in one place.",
      metric:
        watchlistPreview.length > 0
          ? `${watchlistPreview.length} stocks tracked`
          : "Waiting for watchlist data",
      note: "This will update from saved stocks or watchlist API data.",
    },
  ];
}

function normalizeMarketIndex(index) {
  return {
    symbol: index.symbol || index.ticker || index.name || "INDEX",
    name: index.name || index.symbol || index.ticker || "Market Index",
    value: index.value ?? index.price ?? index.close ?? index.latestPrice,
    changePercent: index.changePercent ?? index.percentChange ?? index.change,
    detail: index.detail || index.description || index.status || "Live data",
    tone: index.tone,
  };
}

function normalizeMarketTrend(trendSource) {
  const source = Array.isArray(trendSource)
    ? { points: trendSource }
    : trendSource || {};

  return {
    label: source.label || emptyDashboardData.marketTrend.label,
    changePercent: source.changePercent ?? source.percentChange ?? null,
    points: listFromSource(source.points).map((point) => ({
      time: point.time || point.label || point.timestamp || "",
      value: Number(point.value ?? point.close ?? point.price ?? 0),
    })),
  };
}

function normalizePortfolioStat(stat) {
  return {
    type: stat.type || "portfolio",
    label: stat.label || "Dashboard Stat",
    value: stat.value ?? stat.amount,
    valueType: stat.valueType || "text",
    suffix: stat.suffix || "",
    change: stat.change || stat.detail || "",
  };
}

function normalizeStock(stock) {
  return {
    symbol: stock.symbol || stock.ticker || "N/A",
    name: stock.name || stock.company || stock.companyName || "Company",
    company: stock.company || stock.name || stock.companyName || "Company",
    price: stock.price ?? stock.latestPrice ?? stock.close,
    changePercent: stock.changePercent ?? stock.percentChange ?? stock.change,
    tone: stock.tone,
  };
}

function normalizeSector(sector) {
  return {
    sector: sector.sector || sector.name || "Sector",
    value: Number(sector.value ?? sector.strength ?? sector.performance ?? 0),
  };
}

function formatDashboardValue(value, valueType = "text") {
  if (value === null || value === undefined || value === "") {
    return "Waiting";
  }

  if (typeof value === "string") {
    return value;
  }

  if (valueType === "currency") {
    return currencyFormatter.format(value);
  }

  if (valueType === "number") {
    return numberFormatter.format(value);
  }

  return value;
}

function formatPrice(value) {
  return formatDashboardValue(value, "currency");
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") {
    return "Waiting";
  }

  if (typeof value === "string") {
    return value;
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function getChangeTone(value, explicitTone) {
  if (explicitTone) {
    return explicitTone;
  }

  if (typeof value === "string") {
    if (value.trim().startsWith("-")) return "down";
    if (value.trim().startsWith("+")) return "up";
  }

  if (Number(value) < 0) return "down";
  if (Number(value) > 0) return "up";
  return "neutral";
}

function toneClass(tone) {
  if (tone === "down") return "loss";
  if (tone === "neutral") return "neutral";
  return "gain";
}

function getOverviewRoute(cardTitle) {
  const title = cardTitle.toLowerCase();

  if (title.includes("watchlist")) return "/watchlist";
  if (title.includes("ai")) return "/ai-insights";
  return "/search";
}

function handleKeyboardAction(event, action) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}

function Dashboard({ data }) {
  const navigate = useNavigate();
  const [runtimeData, setRuntimeData] = useState(() =>
    readDashboardDataFromRuntime()
  );
  const dashboardData = useMemo(
    () => normalizeDashboardData(data ?? runtimeData ?? dashboardDemoData),
    [data, runtimeData]
  );
  const trendTone = getChangeTone(dashboardData.marketTrend.changePercent);
  const TrendIcon = trendTone === "down" ? ArrowDownRight : ArrowUpRight;
  const goToStock = (symbol) => navigate(`/stock/${symbol}`);

  useEffect(() => {
    function handleDashboardData(event) {
      setRuntimeData(event.detail);
    }

    function handleStorage(event) {
      if (event.key === DASHBOARD_STORAGE_KEY) {
        setRuntimeData(safeParseJson(event.newValue));
      }
    }

    window.addEventListener(DASHBOARD_DATA_EVENT, handleDashboardData);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(DASHBOARD_DATA_EVENT, handleDashboardData);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <section className="page dashboard-page">
      <style>{dashboardStyles}</style>

      <div className="dashboard-header">
        <div>
          <span className="dashboard-kicker">
            <TrendingUp size={16} />
            {dashboardData.header.kicker}
          </span>
          <h1>{dashboardData.header.title}</h1>
          <p>{dashboardData.header.summary}</p>
        </div>

        <div className="market-status">
          <span
            className={`status-dot ${
              dashboardData.status.isLive ? "" : "paused"
            }`}
          ></span>
          {dashboardData.status.label}
          <strong>{dashboardData.status.updatedAt}</strong>
        </div>
      </div>

      <div className="card-grid beginner-overview" aria-label="Dashboard overview">
        {dashboardData.overviewCards.map((card) => {
          const route = card.route || getOverviewRoute(card.title);

          return (
            <article
              className="card foundation-card clickable-card"
              key={card.title}
              role="button"
              tabIndex="0"
              onClick={() => navigate(route)}
              onKeyDown={(event) =>
                handleKeyboardAction(event, () => navigate(route))
              }
            >
              <div className="section-label-row">
                <span className="section-label">Overview</span>
                <ChevronRight size={18} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <strong>{card.metric}</strong>
              <small>{card.note}</small>
            </article>
          );
        })}
      </div>

      <div className="index-grid" aria-label="Market overview">
        {dashboardData.marketIndexes.length > 0 ? (
          dashboardData.marketIndexes.map((index) => {
            const tone = getChangeTone(index.changePercent, index.tone);
            const ChangeIcon = tone === "down" ? ArrowDownRight : ArrowUpRight;

            return (
              <article
                className="dashboard-card index-card clickable-card"
                key={index.symbol}
                role="button"
                tabIndex="0"
                onClick={() => navigate(`/search?symbol=${index.symbol}`)}
                onKeyDown={(event) =>
                  handleKeyboardAction(event, () =>
                    navigate(`/search?symbol=${index.symbol}`)
                  )
                }
              >
                <div className="card-topline">
                  <span>{index.name}</span>
                  <span className={toneClass(tone)}>
                    <ChangeIcon size={16} />
                    {formatPercent(index.changePercent)}
                  </span>
                </div>
                <strong>{formatDashboardValue(index.value, "number")}</strong>
                <p>{index.detail}</p>
              </article>
            );
          })
        ) : (
          <EmptyState>Live market indexes will appear here.</EmptyState>
        )}
      </div>

      <div className="dashboard-layout">
        <article className="dashboard-panel hero-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Market pulse</span>
              <h2>{dashboardData.marketTrend.label}</h2>
            </div>
            <div className="panel-actions">
              <span className={`pill ${toneClass(trendTone)}`}>
                <TrendIcon size={16} />
                {formatPercent(dashboardData.marketTrend.changePercent)} session
              </span>
              <button
                className="panel-action"
                type="button"
                onClick={() => navigate("/search")}
              >
                Explore
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="chart-wrap">
            {dashboardData.marketTrend.points.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboardData.marketTrend.points}
                  margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="marketGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#22e6a8" stopOpacity={0.42} />
                      <stop
                        offset="95%"
                        stopColor="#22e6a8"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#173044"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#718096"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide domain={["dataMin - 4", "dataMax + 4"]} />
                  <Tooltip
                    cursor={{ stroke: "#22e6a8", strokeWidth: 1 }}
                    contentStyle={{
                      background: "#081421",
                      border: "1px solid #1b2f42",
                      borderRadius: 8,
                      color: "#f5f7fa",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22e6a8"
                    strokeWidth={3}
                    fill="url(#marketGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState>Live trend chart will appear here.</EmptyState>
            )}
          </div>
        </article>

        <aside className="dashboard-panel stats-panel">
          <div className="panel-heading compact">
            <div>
              <span className="section-label">Account</span>
              <h2>Snapshot</h2>
            </div>
            <button
              className="panel-action"
              type="button"
              onClick={() => navigate("/profile")}
            >
              Profile
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="stat-list">
            {dashboardData.portfolioStats.length > 0 ? (
              dashboardData.portfolioStats.map((stat) => {
                const StatIcon = statIcons[stat.type] || Activity;

                return (
                  <div className="stat-row" key={stat.label}>
                    <span className="stat-icon">
                      <StatIcon size={20} />
                    </span>
                    <div>
                      <span>{stat.label}</span>
                      <strong>
                        {formatDashboardValue(stat.value, stat.valueType)}
                        {stat.suffix}
                      </strong>
                      <p>{stat.change}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState>Live account stats will appear here.</EmptyState>
            )}
          </div>
        </aside>
      </div>

      <div className="dashboard-columns">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Today</span>
              <h2>Top Movers</h2>
            </div>
            <button
              className="panel-action"
              type="button"
              onClick={() => navigate("/search")}
            >
              Search
              <CircleDollarSign size={16} />
            </button>
          </div>

          <div className="stock-list">
            {dashboardData.topMovers.length > 0 ? (
              dashboardData.topMovers.map((stock, index) => {
                const tone = getChangeTone(stock.changePercent, stock.tone);

                return (
                  <button
                    className="stock-row interactive-row"
                    key={stock.symbol}
                    type="button"
                    onClick={() => goToStock(stock.symbol)}
                    aria-label={`Open ${stock.symbol} stock details`}
                  >
                    <span className="rank">{index + 1}</span>
                    <span className="stock-main">
                      <strong>{stock.symbol}</strong>
                      <span>{stock.name}</span>
                    </span>
                    <span className="stock-price">
                      <strong>{formatPrice(stock.price)}</strong>
                      <span className={toneClass(tone)}>
                        {formatPercent(stock.changePercent)}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <EmptyState>Live top movers will appear here.</EmptyState>
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Saved</span>
              <h2>Watchlist Preview</h2>
            </div>
            <button
              className="panel-action"
              type="button"
              onClick={() => navigate("/watchlist")}
            >
              View all
              <Star size={16} />
            </button>
          </div>

          <div className="stock-list">
            {dashboardData.watchlistPreview.length > 0 ? (
              dashboardData.watchlistPreview.map((stock) => {
                const tone = getChangeTone(stock.changePercent, stock.tone);

                return (
                  <button
                    className="stock-row interactive-row"
                    key={stock.symbol}
                    type="button"
                    onClick={() => goToStock(stock.symbol)}
                    aria-label={`Open ${stock.symbol} stock details`}
                  >
                    <span className="ticker-badge">
                      {stock.symbol.slice(0, 2)}
                    </span>
                    <span className="stock-main">
                      <strong>{stock.symbol}</strong>
                      <span>{stock.company}</span>
                    </span>
                    <span className="stock-price">
                      <strong>{formatPrice(stock.price)}</strong>
                      <span className={toneClass(tone)}>
                        {formatPercent(stock.changePercent)}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <EmptyState>Live watchlist stocks will appear here.</EmptyState>
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Breadth</span>
              <h2>Sector Strength</h2>
            </div>
            <button
              className="panel-action"
              type="button"
              onClick={() => navigate("/search")}
            >
              Explore
              <Activity size={16} />
            </button>
          </div>

          <div className="mini-chart">
            {dashboardData.sectorPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.sectorPerformance}
                  margin={{ top: 8, right: 0, left: -24, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#173044"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="sector"
                    stroke="#718096"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(34, 230, 168, 0.08)" }}
                    contentStyle={{
                      background: "#081421",
                      border: "1px solid #1b2f42",
                      borderRadius: 8,
                      color: "#f5f7fa",
                    }}
                  />
                  <Bar dataKey="value" fill="#22e6a8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState>Live sector data will appear here.</EmptyState>
            )}
          </div>
        </article>
      </div>

      <div className="dashboard-bottom">
        <article className="dashboard-panel ai-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">AI read</span>
              <h2>Market Summary</h2>
            </div>
            <button
              className="panel-action"
              type="button"
              onClick={() => navigate("/ai-insights")}
            >
              Open
              <Brain size={16} />
            </button>
          </div>

          <div className="insight-grid">
            {dashboardData.aiHighlights.length > 0 ? (
              dashboardData.aiHighlights.map((item) => {
                const InsightIcon = insightIcons[item.type] || Brain;

                return (
                  <div className="insight-item" key={item.title}>
                    <span>
                      <InsightIcon size={18} />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState>Live AI market insights will appear here.</EmptyState>
            )}
          </div>
        </article>

        <article className="dashboard-panel news-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Headlines</span>
              <h2>Market News</h2>
            </div>
            <button
              className="panel-action"
              type="button"
              onClick={() => navigate("/news")}
            >
              Open
              <Newspaper size={16} />
            </button>
          </div>

          {dashboardData.newsItems.length > 0 ? (
            <ul className="news-list">
              {dashboardData.newsItems.map((item) => {
                const newsItem =
                  typeof item === "string" ? { headline: item } : item;

                return (
                  <li
                    key={newsItem.headline}
                    role="button"
                    tabIndex="0"
                    onClick={() => navigate("/news")}
                    onKeyDown={(event) =>
                      handleKeyboardAction(event, () => navigate("/news"))
                    }
                  >
                    <span>{newsItem.headline}</span>
                    {(newsItem.source || newsItem.time) && (
                      <small>
                        {[newsItem.source, newsItem.time]
                          .filter(Boolean)
                          .join(" - ")}
                      </small>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState>Live market headlines will appear here.</EmptyState>
          )}
        </article>
      </div>
    </section>
  );
}

const dashboardStyles = `
  .dashboard-page {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .dashboard-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }

  .dashboard-header h1 {
    margin-bottom: 10px;
  }

  .dashboard-header p {
    max-width: 760px;
    color: var(--text-muted);
    line-height: 1.65;
    margin-bottom: 0;
  }

  .dashboard-kicker,
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--green);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .market-status {
    min-width: 190px;
    display: flex;
    align-items: center;
    gap: 9px;
    background: rgba(11, 22, 35, 0.78);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 14px;
    color: #cbd5e1;
    font-size: 14px;
  }

  .market-status strong {
    display: block;
    margin-left: auto;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 600;
  }

  .status-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: var(--green);
    box-shadow: 0 0 18px rgba(34, 230, 168, 0.85);
  }

  .status-dot.paused {
    background: var(--text-muted);
    box-shadow: none;
  }

  .index-grid,
  .dashboard-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .beginner-overview {
    margin-top: 2px;
  }

  .foundation-card {
    position: relative;
    min-height: 190px;
    border-radius: 8px;
    background:
      linear-gradient(145deg, rgba(16, 31, 46, 0.96), rgba(7, 17, 29, 0.94));
    overflow: hidden;
  }

  .foundation-card::after {
    content: "";
    position: absolute;
    inset: 0;
    border-top: 2px solid rgba(34, 230, 168, 0.35);
    pointer-events: none;
  }

  .foundation-card h3 {
    margin-top: 12px;
    font-size: 21px;
  }

  .foundation-card strong,
  .foundation-card small {
    display: block;
  }

  .foundation-card strong {
    margin-top: 18px;
    color: var(--green);
    font-size: 18px;
  }

  .foundation-card small {
    margin-top: 6px;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .section-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .section-label-row svg {
    color: var(--green);
  }

  .clickable-card,
  .news-list li {
    cursor: pointer;
  }

  .clickable-card:hover,
  .interactive-row:hover,
  .news-list li:hover {
    border-color: rgba(34, 230, 168, 0.48);
    transform: translateY(-1px);
  }

  .clickable-card:focus-visible,
  .interactive-row:focus-visible,
  .panel-action:focus-visible,
  .news-list li:focus-visible {
    outline: 2px solid rgba(34, 230, 168, 0.82);
    outline-offset: 3px;
  }

  .dashboard-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.8fr);
    gap: 16px;
  }

  .dashboard-bottom {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
    gap: 16px;
  }

  .dashboard-card,
  .dashboard-panel {
    background:
      linear-gradient(145deg, rgba(16, 31, 46, 0.95), rgba(7, 17, 29, 0.92));
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.24);
  }

  .dashboard-card {
    padding: 18px;
  }

  .dashboard-panel {
    padding: 22px;
    min-width: 0;
  }

  .index-card {
    min-height: 142px;
  }

  .card-topline,
  .panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .card-topline {
    color: var(--text-muted);
    font-size: 14px;
    margin-bottom: 18px;
  }

  .card-topline span:last-child,
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
  }

  .index-card strong {
    display: block;
    font-size: 25px;
    margin-bottom: 8px;
  }

  .index-card p,
  .stat-row p,
  .insight-item p {
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0;
  }

  .panel-heading {
    margin-bottom: 20px;
  }

  .panel-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
  }

  .panel-heading h2 {
    font-size: 21px;
    margin-top: 5px;
  }

  .panel-heading > svg {
    color: var(--green);
  }

  .panel-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 34px;
    border: 1px solid rgba(34, 230, 168, 0.22);
    border-radius: 8px;
    background: rgba(34, 230, 168, 0.08);
    color: var(--green);
    padding: 7px 10px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .panel-action:hover {
    background: rgba(34, 230, 168, 0.14);
    border-color: rgba(34, 230, 168, 0.42);
  }

  .compact {
    margin-bottom: 18px;
  }

  .pill {
    border: 1px solid rgba(34, 230, 168, 0.26);
    border-radius: 999px;
    padding: 8px 10px;
    background: rgba(34, 230, 168, 0.08);
    font-size: 13px;
  }

  .gain {
    color: var(--green);
  }

  .loss {
    color: var(--red);
  }

  .neutral {
    color: var(--text-muted);
  }

  .chart-wrap {
    width: 100%;
    height: 330px;
  }

  .mini-chart {
    width: 100%;
    height: 262px;
  }

  .stat-list,
  .stock-list,
  .insight-grid {
    display: grid;
    gap: 12px;
  }

  .stat-row,
  .stock-row,
  .insight-item,
  .empty-state {
    display: flex;
    align-items: center;
    gap: 13px;
    background: rgba(5, 11, 18, 0.38);
    border: 1px solid rgba(27, 47, 66, 0.82);
    border-radius: 8px;
    padding: 13px;
    transition: border-color 0.18s ease, transform 0.18s ease, background 0.18s ease;
  }

  .empty-state {
    min-height: 96px;
    justify-content: center;
    color: var(--text-muted);
    text-align: center;
  }

  .index-grid > .empty-state {
    grid-column: 1 / -1;
  }

  .stat-icon,
  .ticker-badge,
  .rank,
  .insight-item > span {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(34, 230, 168, 0.1);
    color: var(--green);
    border: 1px solid rgba(34, 230, 168, 0.18);
    font-weight: 800;
  }

  .stat-row span,
  .stock-main span {
    color: var(--text-muted);
    font-size: 13px;
  }

  .stat-row strong {
    display: block;
    margin: 4px 0;
    font-size: 19px;
  }

  .stock-main {
    min-width: 0;
    flex: 1;
  }

  .stock-main strong,
  .stock-main span {
    display: block;
  }

  .stock-main strong {
    margin-bottom: 4px;
  }

  .stock-price {
    text-align: right;
    white-space: nowrap;
  }

  .stock-price strong,
  .stock-price span {
    display: block;
  }

  .stock-price span {
    margin-top: 4px;
    font-size: 13px;
    font-weight: 700;
  }

  .interactive-row {
    width: 100%;
    border: 1px solid rgba(27, 47, 66, 0.82);
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .interactive-row:hover {
    background: rgba(5, 11, 18, 0.58);
  }

  .ai-panel {
    background:
      linear-gradient(145deg, rgba(16, 31, 46, 0.98), rgba(7, 17, 29, 0.94)),
      radial-gradient(circle at top right, rgba(34, 230, 168, 0.12), transparent 34%);
  }

  .insight-item {
    align-items: flex-start;
  }

  .insight-item strong {
    display: block;
    margin-bottom: 4px;
  }

  .news-list {
    display: grid;
    gap: 12px;
    list-style: none;
  }

  .news-list li {
    position: relative;
    padding: 0 0 0 18px;
    color: #d6dee8;
    line-height: 1.55;
    transition: color 0.18s ease, transform 0.18s ease;
  }

  .news-list li:hover {
    color: var(--text-main);
  }

  .news-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--green);
  }

  .news-list li span,
  .news-list li small {
    display: block;
  }

  .news-list li small {
    margin-top: 4px;
    color: var(--text-muted);
    font-size: 12px;
  }

  @media (max-width: 1150px) {
    .dashboard-layout,
    .dashboard-bottom {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .dashboard-header,
    .panel-heading,
    .card-topline {
      flex-direction: column;
      align-items: flex-start;
    }

    .market-status {
      width: 100%;
    }

    .market-status strong {
      margin-left: 0;
    }

    .panel-actions {
      justify-content: flex-start;
    }

    .chart-wrap {
      height: 260px;
    }

    .stock-row {
      align-items: flex-start;
    }

    .stock-price {
      text-align: left;
    }
  }
`;

export default Dashboard;
