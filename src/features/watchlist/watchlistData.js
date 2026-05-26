export const WATCHLIST_DATA_EVENT = "stocksense:watchlist-data";
export const WATCHLIST_ACTION_EVENT = "stocksense:watchlist-action";
export const WATCHLIST_DATA_STORAGE_KEY = "stocksenseWatchlistData";
export const WATCHLIST_PREFERENCES_KEY = "stocksenseWatchlistPreferences";
export const WATCHLIST_ALERTS_KEY = "stocksenseWatchlistAlerts";
export const WATCHLIST_NOTES_KEY = "stocksenseWatchlistNotes";

const supportedRanges = ["1D", "1W", "1M", "3M", "1Y"];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

function parseStoredJson(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  return parseStoredJson(localStorage.getItem(key), fallback);
}

function writeStorage(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsedValue = Number(String(value).replace(/[$,%\s,]/g, ""));
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function normalizeSymbol(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9.-]/g, "")
    .slice(0, 12);
}

function normalizeHistoryPoint(point, index) {
  const source = typeof point === "number" ? { value: point } : point || {};
  const value = toNumber(source.value ?? source.close ?? source.price);

  if (value === null) return null;

  return {
    label:
      source.label ||
      source.time ||
      source.date ||
      source.timestamp ||
      String(index + 1),
    value,
  };
}

function normalizeHistory(historySource) {
  if (Array.isArray(historySource)) {
    return {
      "1M": historySource.map(normalizeHistoryPoint).filter(Boolean),
    };
  }

  const source = historySource || {};

  return supportedRanges.reduce((history, range) => {
    const points = asList(source[range] || source[range.toLowerCase()])
      .map(normalizeHistoryPoint)
      .filter(Boolean);

    if (points.length > 0) {
      history[range] = points;
    }

    return history;
  }, {});
}

function normalizeQuote(item) {
  const quote = item.quote || item.latestQuote || item;

  return {
    price: toNumber(quote.price ?? quote.latestPrice ?? quote.close),
    change: toNumber(quote.change ?? quote.priceChange),
    changePercent: toNumber(
      quote.changePercent ?? quote.percentChange ?? quote.changePercentage
    ),
    previousClose: toNumber(quote.previousClose ?? quote.prevClose),
    dayHigh: toNumber(quote.dayHigh ?? quote.high),
    dayLow: toNumber(quote.dayLow ?? quote.low),
    volume: toNumber(quote.volume),
    marketCap: toNumber(quote.marketCap),
    updatedAt: quote.updatedAt || quote.timestamp || item.updatedAt || null,
  };
}

function normalizeItem(item) {
  const symbol = normalizeSymbol(item.symbol || item.ticker);

  if (!symbol) return null;

  return {
    symbol,
    name: item.name || item.company || item.companyName || symbol,
    exchange: item.exchange || item.market || "",
    sector: item.sector || "",
    quote: normalizeQuote(item),
    history: normalizeHistory(
      item.history || item.histories || item.historicalPrices || item.prices
    ),
  };
}

export function normalizeWatchlistData(apiData) {
  const source = Array.isArray(apiData) ? { items: apiData } : apiData || {};
  const quotes = source.quotes || {};
  const histories = source.histories || source.history || source.priceHistory || {};
  const providedItems = asList(
    source.items || source.stocks || source.watchlist || source.symbols
  );
  const rawItems =
    providedItems.length > 0
      ? providedItems
      : Array.from(new Set([...Object.keys(quotes), ...Object.keys(histories)]));
  const items = rawItems
    .map((rawItem) => {
      const item = typeof rawItem === "string" ? { symbol: rawItem } : rawItem;
      const symbol = normalizeSymbol(item.symbol || item.ticker);
      const injectedQuote = quotes[symbol] || {};
      const injectedHistory = histories[symbol];

      return normalizeItem({
        ...item,
        quote: {
          ...injectedQuote,
          ...item,
          ...(item.quote || item.latestQuote || {}),
        },
        history:
          item.history ||
          item.histories ||
          item.historicalPrices ||
          injectedHistory,
      });
    })
    .filter(Boolean);
  const isLive = Boolean(source.status?.isLive ?? source.isLive);

  return {
    status: {
      isLive,
      label:
        source.status?.label ||
        (isLive ? "Live market feed connected" : "Market feed not connected"),
      updatedAt: source.status?.updatedAt || source.updatedAt || null,
      provider: source.status?.provider || source.provider || null,
    },
    items,
  };
}

export function readRuntimeWatchlistData() {
  if (typeof window === "undefined") return null;

  return (
    window.stockSenseWatchlistData ||
    readStorage(WATCHLIST_DATA_STORAGE_KEY, null)
  );
}

export function readWatchlistPreferences() {
  const source = readStorage(WATCHLIST_PREFERENCES_KEY, {});

  return {
    addedSymbols: asList(source.addedSymbols).map(normalizeSymbol).filter(Boolean),
    hiddenSymbols: asList(source.hiddenSymbols).map(normalizeSymbol).filter(Boolean),
  };
}

export function saveWatchlistPreferences(preferences) {
  writeStorage(WATCHLIST_PREFERENCES_KEY, preferences);
}

export function addTrackedSymbol(preferences, symbolValue) {
  const symbol = normalizeSymbol(symbolValue);

  if (!symbol) return preferences;

  return {
    addedSymbols: Array.from(new Set([...preferences.addedSymbols, symbol])),
    hiddenSymbols: preferences.hiddenSymbols.filter((item) => item !== symbol),
  };
}

export function removeTrackedSymbol(preferences, symbolValue) {
  const symbol = normalizeSymbol(symbolValue);

  return {
    addedSymbols: preferences.addedSymbols.filter((item) => item !== symbol),
    hiddenSymbols: Array.from(new Set([...preferences.hiddenSymbols, symbol])),
  };
}

function createAwaitingItem(symbol) {
  return {
    symbol,
    name: symbol,
    exchange: "",
    sector: "",
    quote: normalizeQuote({}),
    history: {},
  };
}

export function mergeTrackedItems(remoteItems, preferences) {
  const hiddenSymbols = new Set(preferences.hiddenSymbols);
  const mergedItems = new Map(
    remoteItems
      .filter((item) => !hiddenSymbols.has(item.symbol))
      .map((item) => [item.symbol, item])
  );

  preferences.addedSymbols.forEach((symbol) => {
    if (!mergedItems.has(symbol)) {
      mergedItems.set(symbol, createAwaitingItem(symbol));
    }
  });

  return Array.from(mergedItems.values());
}

export function readAlerts() {
  return readStorage(WATCHLIST_ALERTS_KEY, {});
}

export function saveAlerts(alerts) {
  writeStorage(WATCHLIST_ALERTS_KEY, alerts);
}

export function readNotes() {
  return readStorage(WATCHLIST_NOTES_KEY, {});
}

export function saveNotes(notes) {
  writeStorage(WATCHLIST_NOTES_KEY, notes);
}

export function announceWatchlistAction(type, detail) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(WATCHLIST_ACTION_EVENT, {
      detail: { type, ...detail },
    })
  );
}

export function formatCurrency(value) {
  return value === null || value === undefined
    ? "--"
    : currencyFormatter.format(value);
}

export function formatPercent(value) {
  if (value === null || value === undefined) return "--";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatCompactNumber(value) {
  return value === null || value === undefined ? "--" : compactFormatter.format(value);
}

export function getQuoteTone(value) {
  if (value === null || value === undefined || value === 0) return "neutral";
  return value > 0 ? "gain" : "loss";
}

export function isAlertTriggered(alert, price) {
  if (!alert?.enabled || price === null || price === undefined) return false;
  return alert.direction === "below" ? price <= alert.target : price >= alert.target;
}

export function downloadWatchlistCsv(items) {
  const headings = [
    "Symbol",
    "Name",
    "Exchange",
    "Last Price",
    "Change Percent",
    "Volume",
    "Updated At",
  ];
  const rows = items.map((item) => [
    item.symbol,
    item.name,
    item.exchange,
    item.quote.price ?? "",
    item.quote.changePercent ?? "",
    item.quote.volume ?? "",
    item.quote.updatedAt ?? "",
  ]);
  const csv = [headings, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
  const downloadUrl = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = "stocksense-watchlist.csv";
  link.click();
  URL.revokeObjectURL(downloadUrl);
}
