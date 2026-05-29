import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  ChevronLeft,
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
    label: "Market feed offline",
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
  marketStocks: [],
  topMovers: [],
  watchlistPreview: [],
  sectorPerformance: [],
  aiHighlights: [],
  newsItems: [],
};

const defaultAiHighlights = [
  {
    type: "momentum",
    title: "Momentum leadership",
    text:
      "Mega-cap technology and semiconductor names are carrying the strongest relative strength, while broader participation is improving at a measured pace.",
    confidence: "High conviction",
    signal: "Leadership",
    impact: "Primary focus",
  },
  {
    type: "volatility",
    title: "Risk temperature",
    text:
      "Volatility remains controlled, but concentrated gains make disciplined entries and pre-set exits more important than chasing extended moves.",
    confidence: "Moderate risk",
    signal: "Volatility",
    impact: "Position sizing",
  },
  {
    type: "focus",
    title: "Watchlist priority",
    text:
      "Prioritize stocks with rising relative strength, clean trend structure, and upcoming catalysts that can justify continued upside.",
    confidence: "Actionable",
    signal: "Watchlist",
    impact: "Alert review",
  },
  {
    type: "catalyst",
    title: "Next catalyst",
    text:
      "Earnings dates, inflation data, and rate expectations can quickly reset sentiment, so new entries should be paired with clear risk levels.",
    confidence: "Event aware",
    signal: "Macro",
    impact: "Timing",
  },
];

const dashboardScenarioData = {
  header: {
    kicker: "AI market workspace",
    title: "Dashboard",
    summary:
      "Track index direction, watchlist movement, and AI-assisted market reads from one professional trading workspace.",
  },
  status: {
    label: "Research stream",
    updatedAt: "Model snapshot",
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
      change: "Tracked securities value",
    },
    {
      type: "signals",
      label: "Price alerts armed",
      value: 4,
      valueType: "number",
      change: "Active monitoring levels",
    },
    {
      type: "risk",
      label: "Daily exposure",
      value: "Balanced",
      change: "Diversified risk profile",
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
  aiHighlights: defaultAiHighlights,
  newsItems: [
    {
      headline: "Technology sector leads market breadth as growth stocks firm",
      source: "Market desk",
      time: "Morning brief",
    },
    {
      headline: "Investors watch upcoming earnings reports and rate commentary",
      source: "Market desk",
      time: "Strategy note",
    },
  ],
};

const DASHBOARD_SIMULATION_INTERVAL = 2200;
const dashboardPulseLabels = [
  "9:30",
  "10:15",
  "11:00",
  "11:45",
  "12:30",
  "1:15",
  "2:00",
  "2:45",
];

const dashboardStockUniverse = [
  ["AAPL", "Apple Inc.", 198.42],
  ["MSFT", "Microsoft Corporation", 429.12],
  ["NVDA", "NVIDIA Corporation", 121.38],
  ["AMZN", "Amazon.com, Inc.", 184.76],
  ["GOOGL", "Alphabet Inc.", 176.44],
  ["META", "Meta Platforms, Inc.", 507.12],
  ["TSLA", "Tesla, Inc.", 176.29],
  ["AVGO", "Broadcom Inc.", 1421.54],
  ["BRK.B", "Berkshire Hathaway Inc.", 410.27],
  ["LLY", "Eli Lilly and Company", 812.14],
  ["JPM", "JPMorgan Chase & Co.", 201.39],
  ["V", "Visa Inc.", 276.93],
  ["WMT", "Walmart Inc.", 67.48],
  ["XOM", "Exxon Mobil Corporation", 114.83],
  ["UNH", "UnitedHealth Group Inc.", 506.18],
  ["MA", "Mastercard Incorporated", 451.72],
  ["COST", "Costco Wholesale Corporation", 809.62],
  ["HD", "The Home Depot, Inc.", 352.81],
  ["PG", "The Procter & Gamble Company", 167.31],
  ["JNJ", "Johnson & Johnson", 147.92],
  ["ORCL", "Oracle Corporation", 124.77],
  ["NFLX", "Netflix, Inc.", 648.32],
  ["AMD", "Advanced Micro Devices, Inc.", 167.14],
  ["CRM", "Salesforce, Inc.", 271.84],
  ["ADBE", "Adobe Inc.", 487.11],
  ["BAC", "Bank of America Corporation", 39.81],
  ["KO", "The Coca-Cola Company", 62.75],
  ["PEP", "PepsiCo, Inc.", 173.94],
  ["TMO", "Thermo Fisher Scientific Inc.", 572.62],
  ["CSCO", "Cisco Systems, Inc.", 46.72],
  ["ACN", "Accenture plc", 301.78],
  ["MCD", "McDonald's Corporation", 287.45],
  ["LIN", "Linde plc", 439.66],
  ["ABT", "Abbott Laboratories", 104.28],
  ["DIS", "The Walt Disney Company", 101.12],
  ["INTC", "Intel Corporation", 31.14],
  ["IBM", "International Business Machines", 169.72],
  ["QCOM", "QUALCOMM Incorporated", 204.48],
  ["CAT", "Caterpillar Inc.", 338.15],
  ["GE", "GE Aerospace", 158.12],
  ["UBER", "Uber Technologies, Inc.", 70.84],
  ["NKE", "NIKE, Inc.", 92.18],
  ["BA", "The Boeing Company", 177.43],
  ["GS", "The Goldman Sachs Group, Inc.", 454.61],
  ["SPGI", "S&P Global Inc.", 432.88],
  ["RTX", "RTX Corporation", 104.16],
  ["T", "AT&T Inc.", 18.21],
  ["VZ", "Verizon Communications Inc.", 40.32],
  ["PLTR", "Palantir Technologies Inc.", 24.83],
  ["SHOP", "Shopify Inc.", 64.78],
].map(([symbol, name, basePrice]) => ({ symbol, name, basePrice }));

const statIcons = {
  portfolio: Wallet,
  signals: Eye,
  risk: ShieldCheck,
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

function randomScenarioValue(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function roundScenarioValue(value) {
  return Number(value.toFixed(2));
}

function formatSimulationUpdate() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function shuffleDashboardStocks(stocks) {
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

function createDashboardScenarioStock(stock) {
  const previousClose = roundScenarioValue(
    stock.basePrice * (1 + randomScenarioValue(-0.012, 0.012))
  );
  const price = roundScenarioValue(
    previousClose * (1 + randomScenarioValue(-0.032, 0.032))
  );
  const movementScale = Math.max(stock.basePrice * 0.01, 0.3);

  return {
    ...stock,
    company: stock.name,
    price,
    previousClose,
    changePercent: roundScenarioValue(((price - previousClose) / previousClose) * 100),
    history: dashboardPulseLabels.map((time, index) => {
      const remainingPoints = dashboardPulseLabels.length - index - 1;
      const value =
        index === dashboardPulseLabels.length - 1
          ? price
          : price + randomScenarioValue(-movementScale, movementScale) * remainingPoints;

      return { time, value: roundScenarioValue(value) };
    }),
  };
}

function buildDashboardStockSections(stocks) {
  return {
    marketStocks: stocks,
    topMovers: [...stocks]
      .sort(
        (left, right) =>
          Math.abs(right.changePercent) - Math.abs(left.changePercent)
      )
      .slice(0, 4),
    watchlistPreview: stocks.slice(0, 4),
  };
}

function createDashboardScenarioData() {
  const stocks = shuffleDashboardStocks(dashboardStockUniverse).map(
    createDashboardScenarioStock
  );

  return {
    ...dashboardScenarioData,
    ...buildDashboardStockSections(stocks),
    status: {
      label: "Research stream active",
      updatedAt: formatSimulationUpdate(),
      isLive: false,
    },
  };
}

function simulateDashboardTick(previousData) {
  const marketStocks = previousData.marketStocks.map((stock) => {
    const price = roundScenarioValue(
      Math.max(stock.price * (1 + randomScenarioValue(-0.003, 0.003)), 0.01)
    );

    return {
      ...stock,
      price,
      changePercent: roundScenarioValue(
        ((price - stock.previousClose) / stock.previousClose) * 100
      ),
      history: [
        ...stock.history.slice(1),
        { time: formatSimulationUpdate(), value: price },
      ],
    };
  });
  const marketIndexes = previousData.marketIndexes.map((index) => ({
    ...index,
    value: roundScenarioValue(index.value * (1 + randomScenarioValue(-0.0007, 0.0007))),
    changePercent: roundScenarioValue(
      index.changePercent + randomScenarioValue(-0.04, 0.04)
    ),
  }));
  const marketTrendPoints = previousData.marketTrend.points;
  const latestTrendPoint = marketTrendPoints[marketTrendPoints.length - 1];
  const nextTrendValue = roundScenarioValue(
    latestTrendPoint.value * (1 + randomScenarioValue(-0.0008, 0.0008))
  );

  return {
    ...previousData,
    ...buildDashboardStockSections(marketStocks),
    status: {
      ...previousData.status,
      updatedAt: formatSimulationUpdate(),
    },
    marketIndexes,
    marketTrend: {
      ...previousData.marketTrend,
      changePercent: marketIndexes[0]?.changePercent ?? 0,
      points: [
        ...marketTrendPoints.slice(1),
        { time: formatSimulationUpdate(), value: nextTrendValue },
      ],
    },
  };
}

function uniqueStocks(stocks) {
  return Array.from(
    new Map(stocks.map((stock) => [stock.symbol, stock])).values()
  );
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
  const suppliedMarketStocks = listFromSource(
    source.marketStocks || source.stocks
  ).map(normalizeStock);
  const marketStocks =
    suppliedMarketStocks.length > 0
      ? suppliedMarketStocks
      : uniqueStocks([...topMovers, ...watchlistPreview]);
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
    marketStocks,
    topMovers,
    watchlistPreview,
    sectorPerformance,
    aiHighlights,
    newsItems,
  };
}

function buildOverviewCards({ marketIndexes, aiHighlights, watchlistPreview }) {
  const primaryInsight = aiHighlights[0] || defaultAiHighlights[0];
  const trackedIndexCount = marketIndexes.length || 4;
  const trackedWatchlistCount = watchlistPreview.length || 4;

  return [
    {
      title: "Market Regime",
      label: "AI Overview",
      text:
        "Index leadership is constructive, with growth-heavy sectors setting the pace while broader participation remains the key confirmation signal.",
      metric:
        trackedIndexCount === 1
          ? "1 index monitored"
          : `${trackedIndexCount} indexes monitored`,
      note: "Bias: cautiously bullish while breadth and support levels hold.",
      confidence: "76% signal score",
    },
    {
      title: "Strategy Read",
      label: "AI Overview",
      text:
        primaryInsight.text ||
        "Momentum is strongest in liquid leaders while volatility stays contained. Favor planned entries over chasing extended moves.",
      metric: primaryInsight.title || "Momentum leadership active",
      note: "Risk control: pair entries with alerts near support and catalysts.",
      confidence: primaryInsight.confidence || "High conviction",
    },
    {
      title: "Watchlist Priorities",
      label: "AI Overview",
      text:
        "Rank saved securities by relative strength, recent volatility, and catalyst timing so the next action is clear before price moves.",
      metric:
        trackedWatchlistCount === 1
          ? "1 symbol in focus"
          : `${trackedWatchlistCount} symbols in focus`,
      note: "Action: review leaders, laggards, and alert thresholds.",
      confidence: "Clear next steps",
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
  const historySource = Array.isArray(stock.history)
    ? stock.history
    : stock.history?.["1D"] || stock.points || stock.trend?.points || [];

  return {
    symbol: stock.symbol || stock.ticker || "N/A",
    name: stock.name || stock.company || stock.companyName || "Company",
    company: stock.company || stock.name || stock.companyName || "Company",
    price: stock.price ?? stock.latestPrice ?? stock.close,
    previousClose: stock.previousClose ?? stock.prevClose,
    changePercent: stock.changePercent ?? stock.percentChange ?? stock.change,
    tone: stock.tone,
    history: listFromSource(historySource)
      .map((point) => ({
        time: point.time || point.label || point.timestamp || "",
        value: Number(point.value ?? point.price ?? point.close),
      }))
      .filter((point) => Number.isFinite(point.value)),
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

function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}

function Dashboard({ data }) {
  const navigate = useNavigate();
  const [runtimeData, setRuntimeData] = useState(() =>
    readDashboardDataFromRuntime()
  );
  const [simulatedData, setSimulatedData] = useState(() =>
    createDashboardScenarioData()
  );
  const [selectedMarketSymbol, setSelectedMarketSymbol] = useState("");
  const [spotlightPage, setSpotlightPage] = useState(0);
  const isResearchScenario = data == null && runtimeData == null;
  const dashboardData = useMemo(
    () => normalizeDashboardData(data ?? runtimeData ?? simulatedData),
    [data, runtimeData, simulatedData]
  );
  const selectableMarketStocks = uniqueStocks([
    ...dashboardData.marketStocks,
    ...dashboardData.topMovers,
    ...dashboardData.watchlistPreview,
  ]);
  const selectedMarketStock =
    selectableMarketStocks.find(
      (stock) => stock.symbol === selectedMarketSymbol
    ) ||
    selectableMarketStocks[0] ||
    null;
  const marketPulse = selectedMarketStock
    ? {
        label: `${selectedMarketStock.symbol} Price Trend`,
        description: selectedMarketStock.company,
        changePercent: selectedMarketStock.changePercent,
        points: selectedMarketStock.history,
      }
    : dashboardData.marketTrend;
  const trendTone = getChangeTone(marketPulse.changePercent);
  const TrendIcon = trendTone === "down" ? ArrowDownRight : ArrowUpRight;
  const goToStock = (symbol) => navigate(`/stock/${symbol}`);
  const selectMarketStock = (symbol) => setSelectedMarketSymbol(symbol);
  const spotlightPageSize = 4;
  const spotlightTotalPages = Math.max(
    1,
    Math.ceil(dashboardData.marketStocks.length / spotlightPageSize)
  );
  const currentSpotlightPage = spotlightPage % spotlightTotalPages;
  const spotlightStartIndex = currentSpotlightPage * spotlightPageSize;
  const visibleSpotlightStocks =
    dashboardData.marketStocks.length > 0
      ? Array.from(
          {
            length: Math.min(spotlightPageSize, dashboardData.marketStocks.length),
          },
          (_, index) =>
            dashboardData.marketStocks[
              (spotlightStartIndex + index) % dashboardData.marketStocks.length
            ]
        )
      : [];
  const goToNextSpotlightPage = () => {
    setSpotlightPage((currentPage) => (currentPage + 1) % spotlightTotalPages);
  };
  const goToPreviousSpotlightPage = () => {
    setSpotlightPage(
      (currentPage) =>
        (currentPage - 1 + spotlightTotalPages) % spotlightTotalPages
    );
  };
  const aiReadItems =
    dashboardData.aiHighlights.length > 0
      ? dashboardData.aiHighlights
      : defaultAiHighlights;
  const primaryAiRead = aiReadItems[0] || defaultAiHighlights[0];
  const aiCoverageCount =
    selectableMarketStocks.length || dashboardData.marketIndexes.length || 4;
  const indexMoves = dashboardData.marketIndexes
    .map((index) => Number(index.changePercent))
    .filter(Number.isFinite);
  const averageIndexMove =
    indexMoves.length > 0
      ? indexMoves.reduce((total, value) => total + value, 0) / indexMoves.length
      : Number(marketPulse.changePercent) || 0;
  const positiveIndexCount = indexMoves.filter((value) => value >= 0).length;
  const marketSignalScore = Math.round(
    Math.min(94, Math.max(42, 72 + averageIndexMove * 8))
  );
  const momentumScore = Math.round(
    Math.min(96, Math.max(38, 68 + (Number(marketPulse.changePercent) || 0) * 7))
  );
  const riskScore = Math.round(
    Math.min(90, Math.max(34, 42 + Math.abs(Number(marketPulse.changePercent) || 0) * 9))
  );
  const focusStock = selectedMarketStock || dashboardData.watchlistPreview[0];
  const signalLeaders = (
    dashboardData.topMovers.length > 0
      ? dashboardData.topMovers
      : selectableMarketStocks
  ).slice(0, 3);
  const commandCards = [
    {
      title: "Market Mode",
      label: "Signal",
      value: marketSignalScore,
      valueText: `${marketSignalScore}/100`,
      text:
        marketSignalScore >= 70
          ? "Constructive tape. Stay focused on leaders that are holding trend support."
          : "Mixed tape. Keep entries smaller and wait for stronger confirmation.",
      action: "Track breadth",
      icon: TrendingUp,
      route: "/search",
    },
    {
      title: "Opportunity Queue",
      label: "Priority",
      value: momentumScore,
      valueText: focusStock?.symbol || "Watchlist",
      text:
        focusStock
          ? `${focusStock.symbol} is the active chart focus. Compare momentum, price trend, and alert levels before entry.`
          : "Build a focused list of liquid leaders before planning new trades.",
      action: "Review leaders",
      icon: Star,
      route: "/watchlist",
    },
    {
      title: "Risk Control",
      label: "Guardrail",
      value: riskScore,
      valueText: `${riskScore}/100`,
      text:
        "Use pre-set alerts, catalyst dates, and position sizing rules before reacting to price movement.",
      action: "Set alerts",
      icon: ShieldCheck,
      route: "/alerts",
    },
  ];
  const playbookSteps = [
    {
      title: "Confirm trend",
      text: focusStock
        ? `${focusStock.symbol} should stay above short-term support before adding exposure.`
        : "Wait for a clean higher-low pattern before increasing exposure.",
      tag: "Entry quality",
    },
    {
      title: "Control downside",
      text: "Define invalidation first, then size the trade so one move does not damage the full watchlist.",
      tag: "Risk first",
    },
    {
      title: "Watch catalyst",
      text: "Earnings, inflation data, and rate commentary can change the market tone quickly.",
      tag: "Timing",
    },
  ];
  const catalystItems = [
    { label: "Now", title: "Breadth check", text: "Confirm whether index gains are supported by multiple sectors." },
    { label: "Next", title: "Alert review", text: "Move alerts near support, breakout zones, and high-volume levels." },
    { label: "Later", title: "Catalyst scan", text: "Review earnings and macro events before holding risk overnight." },
  ];
  const dashboardBriefItems = [
    {
      icon: TrendingUp,
      label: "Market score",
      value: `${marketSignalScore}/100`,
      note: marketSignalScore >= 70 ? "Constructive tape" : "Selective entries",
    },
    {
      icon: Activity,
      label: "Index breadth",
      value: `${positiveIndexCount}/${Math.max(indexMoves.length, 1)}`,
      note: "Major benchmarks positive",
    },
    {
      icon: Star,
      label: "Active focus",
      value: focusStock?.symbol || "Build",
      note: focusStock?.name || "Select a watchlist leader",
    },
    {
      icon: ShieldCheck,
      label: "Risk heat",
      value: `${riskScore}%`,
      note: riskScore > 65 ? "Use tighter guardrails" : "Risk remains controlled",
    },
  ];

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

  useEffect(() => {
    if (!isResearchScenario) return undefined;

    const simulationTimer = window.setInterval(() => {
      setSimulatedData((currentData) => simulateDashboardTick(currentData));
    }, DASHBOARD_SIMULATION_INTERVAL);

    return () => window.clearInterval(simulationTimer);
  }, [isResearchScenario]);

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

      <div className="dashboard-briefing" aria-label="Dashboard briefing">
        {dashboardBriefItems.map((item) => {
          const BriefIcon = item.icon;

          return (
            <article className="briefing-card" key={item.label}>
              <span><BriefIcon size={17} /></span>
              <div>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </div>
            </article>
          );
        })}
      </div>

      <article className="market-spotlight" aria-label="Featured stock market stream">
        <div className="spotlight-heading">
          <div>
            <span className="dashboard-kicker">
              <Activity size={16} />
              Stock market spotlight
            </span>
            <h2>Market Movers</h2>
            <p>
              {isResearchScenario
                ? "Rotating coverage across 50 actively watched securities with continuously refreshed price movement."
                : "Latest securities received from the connected market data source."}
            </p>
          </div>
          <div className="spotlight-toolbar">
            <div className={`stream-chip ${isResearchScenario ? "simulated" : "connected"}`}>
              <span className="stream-dot"></span>
              {isResearchScenario
                ? "Research model updating"
                : dashboardData.status.isLive
                  ? "Live feed"
                  : dashboardData.status.label}
              <strong>{dashboardData.marketStocks.length} securities</strong>
            </div>
            <div className="spotlight-controls" aria-label="Market mover navigation">
              <button
                type="button"
                onClick={goToPreviousSpotlightPage}
                disabled={dashboardData.marketStocks.length <= spotlightPageSize}
                aria-label="Show previous market movers"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goToNextSpotlightPage}
                disabled={dashboardData.marketStocks.length <= spotlightPageSize}
                aria-label="Show next market movers"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="spotlight-grid">
          {visibleSpotlightStocks.map((stock) => {
            const tone = getChangeTone(stock.changePercent, stock.tone);
            const ChangeIcon = tone === "down" ? ArrowDownRight : ArrowUpRight;

            return (
              <button
                className={`spotlight-stock ${
                  selectedMarketStock?.symbol === stock.symbol ? "selected" : ""
                }`}
                type="button"
                key={stock.symbol}
                aria-pressed={selectedMarketStock?.symbol === stock.symbol}
                onClick={() => selectMarketStock(stock.symbol)}
              >
                <span className="spotlight-symbol">{stock.symbol}</span>
                <strong>{formatPrice(stock.price)}</strong>
                <span className={toneClass(tone)}>
                  <ChangeIcon size={15} />
                  {formatPercent(stock.changePercent)}
                </span>
                <small>{stock.company}</small>
              </button>
            );
          })}
        </div>
      </article>

      <section className="ai-command-center" aria-label="AI signal board">
        <div className="command-heading">
          <div>
            <span className="section-label">AI signal board</span>
            <h2>Decision Center</h2>
            <p>
              A compact market read that turns price movement, breadth, and watchlist
              behavior into clear next steps.
            </p>
          </div>
          <div className="command-status">
            <span>{dashboardData.status.label}</span>
            <strong>{dashboardData.status.updatedAt}</strong>
          </div>
        </div>

        <div className="command-layout">
          <article className="command-score-panel">
            <div className="score-ring">
              <strong>{marketSignalScore}</strong>
              <span>AI score</span>
            </div>
            <div>
              <h3>
                {marketSignalScore >= 70 ? "Constructive setup" : "Selective setup"}
              </h3>
              <p>
                {positiveIndexCount}/{Math.max(indexMoves.length, 1)} indexes are
                positive. Momentum is strongest in the current leadership list,
                while risk controls should stay active around catalysts.
              </p>
            </div>
            <div className="signal-bars">
              <div>
                <span>Breadth</span>
                <strong>{Math.max(positiveIndexCount, 1)}/{Math.max(indexMoves.length, 1)}</strong>
                <em><i style={{ width: `${marketSignalScore}%` }}></i></em>
              </div>
              <div>
                <span>Momentum</span>
                <strong>{momentumScore}%</strong>
                <em><i style={{ width: `${momentumScore}%` }}></i></em>
              </div>
              <div>
                <span>Risk heat</span>
                <strong>{riskScore}%</strong>
                <em><i style={{ width: `${riskScore}%` }}></i></em>
              </div>
            </div>
          </article>

          <div className="command-card-grid">
            {commandCards.map((card) => {
              const CommandIcon = card.icon;

              return (
                <button
                  className="command-card"
                  key={card.title}
                  type="button"
                  onClick={() => navigate(card.route)}
                >
                  <span className="command-icon"><CommandIcon size={18} /></span>
                  <div>
                    <small>{card.label}</small>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                    <div className="command-progress">
                      <strong>{card.valueText}</strong>
                      <span>{card.action}</span>
                    </div>
                    <em><i style={{ width: `${card.value}%` }}></i></em>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {signalLeaders.length > 0 && (
          <div className="leader-strip">
            <span>Leadership queue</span>
            {signalLeaders.map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => selectMarketStock(stock.symbol)}
              >
                <strong>{stock.symbol}</strong>
                <small>{formatPercent(stock.changePercent)}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="dashboard-layout">
        <article className="dashboard-panel hero-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Market pulse</span>
              <h2>{marketPulse.label}</h2>
              {selectedMarketStock && (
                <p className="pulse-company">{marketPulse.description}</p>
              )}
            </div>
            <div className="panel-actions">
              <span className={`pill ${toneClass(trendTone)}`}>
                <TrendIcon size={16} />
                {formatPercent(marketPulse.changePercent)} session
              </span>
              {selectedMarketStock && (
                <button
                  className="panel-action"
                  type="button"
                  onClick={() => goToStock(selectedMarketStock.symbol)}
                >
                  Details
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="chart-wrap">
            {marketPulse.points.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={marketPulse.points}
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
              <EmptyState>
                Select a security with price history to review trend structure.
              </EmptyState>
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
              <EmptyState>Portfolio metrics populate after account data is connected.</EmptyState>
            )}
          </div>
        </aside>
      </div>

      <div className="dashboard-columns">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Today</span>
              <h2>Movement Ranking</h2>
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
                    className={`stock-row interactive-row ${
                      selectedMarketStock?.symbol === stock.symbol
                        ? "selected-stock"
                        : ""
                    }`}
                    key={stock.symbol}
                    type="button"
                    onClick={() => selectMarketStock(stock.symbol)}
                    aria-label={`Show ${stock.symbol} in market pulse`}
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
              <EmptyState>Movement ranking populates when securities are available.</EmptyState>
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Saved</span>
              <h2>Watchlist Focus</h2>
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
                    className={`stock-row interactive-row ${
                      selectedMarketStock?.symbol === stock.symbol
                        ? "selected-stock"
                        : ""
                    }`}
                    key={stock.symbol}
                    type="button"
                    onClick={() => selectMarketStock(stock.symbol)}
                    aria-label={`Show ${stock.symbol} in market pulse`}
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
              <EmptyState>Saved watchlist securities populate here after selection.</EmptyState>
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
              <EmptyState>Sector strength populates when breadth data is available.</EmptyState>
            )}
          </div>
        </article>
      </div>

      <div className="analyst-workbench">
        <article className="dashboard-panel playbook-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">AI playbook</span>
              <h2>Next Best Move</h2>
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

          <div className="playbook-layout">
            <div className="trade-plan">
              <span>Primary setup</span>
              <h3>{focusStock?.symbol || "Build watchlist"} trend plan</h3>
              <p>{primaryAiRead.text}</p>
              <div className="trade-plan-grid">
                <span>
                  <strong>{aiReadItems.length}</strong>
                  Signals
                </span>
                <span>
                  <strong>{aiCoverageCount}</strong>
                  Scanned
                </span>
                <span>
                  <strong>{primaryAiRead.confidence || "High"}</strong>
                  Confidence
                </span>
              </div>
            </div>

            <div className="playbook-steps">
              {playbookSteps.map((step, index) => (
                <div className="playbook-step" key={step.title}>
                  <span>{index + 1}</span>
                  <div>
                    <small>{step.tag}</small>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="dashboard-panel intel-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Market intel</span>
              <h2>Catalyst Radar</h2>
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

          <div className="intel-timeline">
            {catalystItems.map((item) => (
              <div className="intel-event" key={item.title}>
                <span>{item.label}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="intel-news">
            <span>News brief</span>
            {dashboardData.newsItems.length > 0 ? (
              dashboardData.newsItems.slice(0, 3).map((item) => {
                const newsItem =
                  typeof item === "string" ? { headline: item } : item;

                return (
                  <button
                    key={newsItem.headline}
                    type="button"
                    onClick={() => navigate("/news")}
                  >
                    <strong>{newsItem.headline}</strong>
                    {(newsItem.source || newsItem.time) && (
                      <small>
                        {[newsItem.source, newsItem.time]
                          .filter(Boolean)
                          .join(" - ")}
                      </small>
                    )}
                  </button>
                );
              })
            ) : (
              <EmptyState>Market headlines populate when the news feed is connected.</EmptyState>
            )}
          </div>
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

  .market-spotlight {
    position: relative;
    overflow: hidden;
    padding: 25px;
    border: 1px solid rgba(34, 230, 168, 0.38);
    border-radius: 16px;
    background:
      radial-gradient(circle at 86% 8%, rgba(34, 230, 168, 0.2), transparent 28%),
      linear-gradient(130deg, rgba(15, 37, 48, 0.98), rgba(5, 11, 18, 0.96));
    box-shadow:
      0 20px 58px rgba(0, 0, 0, 0.32),
      inset 0 1px 0 rgba(34, 230, 168, 0.18);
  }

  .market-spotlight::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
  }

  .spotlight-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 22px;
    margin-bottom: 22px;
  }

  .spotlight-heading h2 {
    margin: 8px 0 6px;
    font-size: 28px;
  }

  .spotlight-heading p {
    max-width: 700px;
    color: var(--text-muted);
    line-height: 1.55;
  }

  .spotlight-toolbar {
    min-width: 260px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .stream-chip {
    min-width: 214px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(34, 230, 168, 0.3);
    border-radius: 999px;
    padding: 10px 13px;
    background: rgba(34, 230, 168, 0.08);
    color: var(--green);
    font-size: 13px;
    font-weight: 700;
  }

  .stream-chip strong {
    width: 100%;
    margin-left: 17px;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 600;
  }

  .stream-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 14px rgba(34, 230, 168, 0.78);
    animation: spotlightPulse 1.8s infinite ease-in-out;
  }

  .stream-chip.simulated .stream-dot {
    background: #f8bc57;
    box-shadow: 0 0 14px rgba(248, 188, 87, 0.66);
  }

  .stream-chip.simulated {
    border-color: rgba(248, 188, 87, 0.3);
    background: rgba(248, 188, 87, 0.08);
    color: #f8bc57;
  }

  .spotlight-controls {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(34, 230, 168, 0.2);
    border-radius: 999px;
    padding: 6px;
    background: rgba(5, 11, 18, 0.42);
  }

  .spotlight-controls button {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(34, 230, 168, 0.24);
    border-radius: 50%;
    background: rgba(34, 230, 168, 0.08);
    color: var(--green);
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  }

  .spotlight-controls button:hover:not(:disabled) {
    border-color: rgba(34, 230, 168, 0.5);
    background: rgba(34, 230, 168, 0.16);
    transform: translateY(-1px);
  }

  .spotlight-controls button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .spotlight-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(155px, 1fr));
    gap: 12px;
  }

  .spotlight-stock {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 7px;
    border: 1px solid rgba(34, 230, 168, 0.12);
    border-radius: 12px;
    padding: 14px;
    background: rgba(5, 11, 18, 0.45);
    color: var(--text-main);
    text-align: left;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  }

  .spotlight-stock:hover {
    border-color: rgba(34, 230, 168, 0.48);
    background: rgba(34, 230, 168, 0.07);
    transform: translateY(-2px);
  }

  .spotlight-stock.selected {
    border-color: rgba(34, 230, 168, 0.58);
    background:
      linear-gradient(140deg, rgba(34, 230, 168, 0.16), rgba(34, 230, 168, 0.04));
    box-shadow: inset 0 0 0 1px rgba(34, 230, 168, 0.12);
  }

  .spotlight-stock:focus-visible {
    outline: 2px solid rgba(34, 230, 168, 0.82);
    outline-offset: 3px;
  }

  .spotlight-symbol {
    color: var(--green);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.06em;
  }

  .spotlight-stock strong {
    font-size: 21px;
  }

  .spotlight-stock span:nth-of-type(2) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 700;
  }

  .spotlight-stock small {
    width: 100%;
    overflow: hidden;
    color: var(--text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @keyframes spotlightPulse {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(0.92);
    }
    50% {
      opacity: 1;
      transform: scale(1.12);
    }
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

  .dashboard-briefing {
    display: grid;
    grid-template-columns: repeat(4, minmax(150px, 1fr));
    gap: 14px;
  }

  .briefing-card {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    border: 1px solid rgba(27, 47, 66, 0.88);
    border-radius: 8px;
    padding: 15px;
    background:
      linear-gradient(145deg, rgba(16, 31, 46, 0.94), rgba(7, 17, 29, 0.9));
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }

  .briefing-card > span {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(34, 230, 168, 0.2);
    border-radius: 8px;
    background: rgba(34, 230, 168, 0.1);
    color: var(--green);
  }

  .briefing-card small,
  .briefing-card p {
    color: var(--text-muted);
  }

  .briefing-card small {
    display: block;
    margin-bottom: 5px;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .briefing-card strong {
    display: block;
    color: var(--text-main);
    font-size: 22px;
  }

  .briefing-card p {
    margin-top: 5px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .index-grid,
  .dashboard-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .ai-command-center {
    border: 1px solid rgba(34, 230, 168, 0.22);
    border-radius: 8px;
    padding: 22px;
    background:
      linear-gradient(145deg, rgba(10, 24, 37, 0.98), rgba(5, 11, 18, 0.94)),
      radial-gradient(circle at 94% 12%, rgba(120, 166, 255, 0.14), transparent 28%);
    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.24);
  }

  .command-heading,
  .command-layout,
  .analyst-workbench {
    display: grid;
    gap: 16px;
  }

  .command-heading {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }

  .command-heading h2 {
    margin: 6px 0 7px;
    font-size: 24px;
  }

  .command-heading p,
  .command-score-panel p,
  .command-card p,
  .trade-plan p,
  .playbook-step p,
  .intel-event p {
    color: var(--text-muted);
    line-height: 1.55;
  }

  .command-status {
    min-width: 190px;
    border: 1px solid rgba(120, 166, 255, 0.24);
    border-radius: 8px;
    padding: 11px 13px;
    background: rgba(120, 166, 255, 0.08);
    color: #bcd1ff;
    text-align: right;
  }

  .command-status span,
  .command-status strong {
    display: block;
  }

  .command-status span {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .command-status strong {
    margin-top: 5px;
    color: var(--text-muted);
    font-size: 12px;
  }

  .command-layout {
    grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1.22fr);
    align-items: stretch;
  }

  .command-score-panel,
  .command-card,
  .trade-plan,
  .playbook-step,
  .intel-event,
  .intel-news button {
    border: 1px solid rgba(27, 47, 66, 0.88);
    border-radius: 8px;
    background: rgba(5, 11, 18, 0.42);
  }

  .command-score-panel {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 16px;
    padding: 16px;
  }

  .score-ring {
    width: 104px;
    height: 104px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(34, 230, 168, 0.36);
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(34, 230, 168, 0.14), rgba(34, 230, 168, 0.03));
  }

  .score-ring strong {
    color: var(--green);
    font-size: 32px;
    line-height: 1;
  }

  .score-ring span,
  .signal-bars span,
  .command-card small,
  .trade-plan > span,
  .playbook-step small,
  .intel-news > span {
    color: #bcd1ff;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .command-score-panel h3,
  .command-card h3,
  .trade-plan h3 {
    margin-bottom: 8px;
    font-size: 20px;
  }

  .signal-bars {
    grid-column: 1 / -1;
    display: grid;
    gap: 12px;
    margin-top: 6px;
  }

  .signal-bars div,
  .command-progress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .signal-bars strong {
    color: var(--text-main);
    font-size: 13px;
  }

  .signal-bars em,
  .command-card em {
    display: block;
    width: 100%;
    height: 6px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(120, 166, 255, 0.12);
  }

  .signal-bars i,
  .command-card i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--green), #78a6ff);
  }

  .command-card-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .command-card {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 15px;
    color: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.18s ease, transform 0.18s ease, background 0.18s ease;
  }

  .command-card:hover {
    border-color: rgba(34, 230, 168, 0.48);
    background: rgba(34, 230, 168, 0.06);
    transform: translateY(-2px);
  }

  .command-icon {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(34, 230, 168, 0.2);
    border-radius: 8px;
    background: rgba(34, 230, 168, 0.1);
    color: var(--green);
  }

  .command-progress {
    margin: 12px 0 8px;
  }

  .command-progress strong {
    color: var(--green);
    font-size: 16px;
  }

  .command-progress span {
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 800;
  }

  .leader-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(27, 47, 66, 0.88);
  }

  .leader-strip > span {
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .leader-strip button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(34, 230, 168, 0.18);
    border-radius: 999px;
    background: rgba(34, 230, 168, 0.07);
    color: var(--text-main);
    padding: 8px 10px;
    cursor: pointer;
  }

  .leader-strip small {
    color: var(--green);
    font-weight: 800;
  }

  .beginner-overview {
    margin-top: 2px;
  }

  .foundation-card {
    position: relative;
    min-height: 230px;
    display: flex;
    flex-direction: column;
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

  .foundation-card p {
    margin-top: 10px;
    color: var(--text-muted);
    line-height: 1.55;
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

  .overview-metric-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
    padding-top: 18px;
  }

  .overview-metric-row strong {
    margin-top: 0;
  }

  .overview-metric-row span {
    max-width: 128px;
    border: 1px solid rgba(120, 166, 255, 0.24);
    border-radius: 999px;
    padding: 6px 9px;
    background: rgba(120, 166, 255, 0.08);
    color: #bcd1ff;
    font-size: 12px;
    font-weight: 800;
    text-align: right;
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

  .analyst-workbench {
    grid-template-columns: minmax(0, 1.24fr) minmax(320px, 0.76fr);
  }

  .playbook-panel {
    background:
      linear-gradient(145deg, rgba(16, 31, 46, 0.98), rgba(7, 17, 29, 0.94)),
      radial-gradient(circle at top left, rgba(34, 230, 168, 0.12), transparent 34%);
  }

  .playbook-layout {
    display: grid;
    grid-template-columns: minmax(260px, 0.78fr) minmax(0, 1.22fr);
    gap: 14px;
  }

  .trade-plan {
    display: flex;
    flex-direction: column;
    min-height: 315px;
    padding: 18px;
    border-color: rgba(34, 230, 168, 0.24);
    background:
      linear-gradient(160deg, rgba(34, 230, 168, 0.12), rgba(5, 11, 18, 0.22)),
      rgba(5, 11, 18, 0.28);
  }

  .trade-plan-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: auto;
    padding-top: 20px;
  }

  .trade-plan-grid span {
    border-left: 1px solid rgba(120, 166, 255, 0.3);
    color: var(--text-muted);
    padding-left: 10px;
    font-size: 12px;
    line-height: 1.35;
  }

  .trade-plan-grid strong {
    display: block;
    color: var(--green);
    font-size: 17px;
  }

  .playbook-steps {
    display: grid;
    gap: 12px;
  }

  .playbook-step {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 13px;
    padding: 14px;
  }

  .playbook-step > span {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(34, 230, 168, 0.1);
    color: var(--green);
    border: 1px solid rgba(34, 230, 168, 0.18);
    font-weight: 900;
  }

  .playbook-step strong {
    display: block;
    margin: 5px 0;
  }

  .intel-panel {
    background:
      linear-gradient(145deg, rgba(16, 31, 46, 0.96), rgba(7, 17, 29, 0.94));
  }

  .intel-timeline,
  .intel-news {
    display: grid;
    gap: 12px;
  }

  .intel-event {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 12px;
    padding: 13px;
  }

  .intel-event > span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    border-radius: 999px;
    background: rgba(120, 166, 255, 0.1);
    color: #bcd1ff;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .intel-event strong,
  .intel-news button strong {
    display: block;
    margin-bottom: 5px;
  }

  .intel-news {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(27, 47, 66, 0.88);
  }

  .intel-news button {
    width: 100%;
    padding: 12px;
    color: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.18s ease, transform 0.18s ease, background 0.18s ease;
  }

  .intel-news button:hover {
    border-color: rgba(34, 230, 168, 0.48);
    background: rgba(34, 230, 168, 0.06);
    transform: translateY(-1px);
  }

  .intel-news small {
    color: var(--text-muted);
    font-size: 12px;
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

  .pulse-company {
    margin-top: 6px;
    color: var(--text-muted);
    font-size: 13px;
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

  .interactive-row.selected-stock {
    border-color: rgba(34, 230, 168, 0.46);
    background: rgba(34, 230, 168, 0.08);
  }

  .ai-panel {
    background:
      linear-gradient(145deg, rgba(16, 31, 46, 0.98), rgba(7, 17, 29, 0.94)),
      radial-gradient(circle at top right, rgba(34, 230, 168, 0.12), transparent 34%);
  }

  .ai-panel-content {
    display: grid;
    grid-template-columns: minmax(240px, 0.82fr) minmax(0, 1.18fr);
    gap: 14px;
    align-items: stretch;
  }

  .ai-brief-block {
    display: flex;
    flex-direction: column;
    min-width: 0;
    border: 1px solid rgba(34, 230, 168, 0.18);
    border-radius: 8px;
    padding: 16px;
    background:
      linear-gradient(160deg, rgba(34, 230, 168, 0.11), rgba(5, 11, 18, 0.2)),
      rgba(5, 11, 18, 0.26);
  }

  .ai-brief-label {
    color: #bcd1ff;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .ai-brief-block h3 {
    margin: 10px 0 8px;
    font-size: 21px;
  }

  .ai-brief-block p {
    color: var(--text-muted);
    line-height: 1.58;
  }

  .ai-brief-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: auto;
    padding-top: 18px;
  }

  .ai-brief-metrics span {
    min-width: 0;
    border-left: 1px solid rgba(120, 166, 255, 0.3);
    padding-left: 10px;
  }

  .ai-brief-metrics strong,
  .ai-brief-metrics small {
    display: block;
  }

  .ai-brief-metrics strong {
    color: var(--green);
    font-size: 16px;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .ai-brief-metrics small {
    margin-top: 5px;
    color: var(--text-muted);
    font-size: 11px;
    line-height: 1.3;
  }

  .insight-item {
    align-items: flex-start;
  }

  .insight-copy {
    min-width: 0;
  }

  .insight-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 5px;
  }

  .insight-title-row strong {
    display: block;
  }

  .insight-title-row em {
    flex: 0 0 auto;
    border: 1px solid rgba(34, 230, 168, 0.22);
    border-radius: 999px;
    padding: 4px 7px;
    color: var(--green);
    font-size: 11px;
    font-style: normal;
    font-weight: 800;
    white-space: nowrap;
  }

  .insight-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 10px;
  }

  .insight-meta small {
    border: 1px solid rgba(120, 166, 255, 0.22);
    border-radius: 999px;
    padding: 5px 8px;
    background: rgba(120, 166, 255, 0.07);
    color: #bcd1ff;
    font-size: 11px;
    font-weight: 800;
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
    .dashboard-briefing {
      grid-template-columns: repeat(2, minmax(180px, 1fr));
    }

    .dashboard-layout,
    .dashboard-bottom,
    .analyst-workbench,
    .command-layout,
    .playbook-layout {
      grid-template-columns: 1fr;
    }

    .spotlight-grid {
      grid-template-columns: repeat(2, minmax(160px, 1fr));
    }

    .command-card-grid {
      grid-template-columns: repeat(3, minmax(180px, 1fr));
    }

    .ai-panel-content {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .dashboard-briefing {
      grid-template-columns: 1fr;
    }

    .dashboard-header,
    .spotlight-heading,
    .command-heading,
    .panel-heading,
    .card-topline {
      flex-direction: column;
      align-items: flex-start;
    }

    .market-status {
      width: 100%;
    }

    .command-heading {
      display: flex;
    }

    .command-status {
      width: 100%;
      text-align: left;
    }

    .command-score-panel {
      grid-template-columns: 1fr;
    }

    .score-ring {
      width: 96px;
      height: 96px;
    }

    .command-card-grid,
    .trade-plan-grid {
      grid-template-columns: 1fr;
    }

    .market-status strong {
      margin-left: 0;
    }

    .panel-actions {
      justify-content: flex-start;
    }

    .stream-chip {
      min-width: 0;
      width: 100%;
    }

    .spotlight-toolbar {
      width: 100%;
      min-width: 0;
      align-items: stretch;
    }

    .spotlight-controls {
      align-self: flex-start;
    }

    .spotlight-grid {
      grid-template-columns: 1fr;
    }

    .overview-metric-row {
      align-items: flex-start;
      flex-direction: column;
    }

    .overview-metric-row span {
      max-width: none;
      text-align: left;
    }

    .ai-brief-metrics {
      grid-template-columns: 1fr;
    }

    .insight-title-row {
      align-items: flex-start;
      flex-direction: column;
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
