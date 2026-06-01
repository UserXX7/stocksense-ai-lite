// ─────────────────────────────────────────────────────────────────────────────
// News.jsx — Person 3 Task File
// This page has two sections:
//   1. A hero carousel at the top showing breaking news that affects the
//      stocks on the user's watchlist (AAPL, TSLA, NVDA, etc.)
//   2. A scrollable news feed below showing broader stock market news
//
// Both sections use static (hardcoded) sample data for now.
// When a real news API is connected later, replace the carouselNews and
// feedNews arrays with live API data — the component logic stays the same.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, Info, Rss } from "lucide-react";
import "./News.css";

// ─── Watchlist Tickers ────────────────────────────────────────────────────────
// These are the stocks the user is watching (matches the Alerts page watchlist).
// They are displayed in the carousel header bar so users know which stocks
// the top news applies to.
const WATCHLIST = ["AAPL", "TSLA", "NVDA", "GOOGL", "META", "MSFT", "AMZN"];

// ─── Carousel Data ────────────────────────────────────────────────────────────
// 5 featured news items shown in the full-screen sliding carousel at the top.
// Each item must have:
//   id         - unique identifier
//   source     - the news outlet (e.g. "Reuters", "Bloomberg")
//   category   - one of: "Earnings", "Fed & Rates", "Market", "Company"
//   tickers    - array of stock symbols this news affects (can be empty [])
//   impact     - "Positive", "Negative", or "Neutral" — shown as a coloured badge
//   title      - the main headline
//   description - a slightly longer version of the headline (shown on slide)
//   simpleSummary - plain English explanation for beginners (shown with 💡 icon)
//   publishedAt - how long ago the article was published (e.g. "8 min ago")
//   imageUrl   - background image for the slide (from Unsplash)
//   articleUrl - where clicking the slide takes the user (real news source URL)
const carouselNews = [
  {
    id: "c1",
    source: "Reuters",
    category: "Fed & Rates",
    tickers: ["AAPL", "MSFT", "NVDA"],
    impact: "Positive",
    title: "Federal Reserve Signals Rate Pause — Tech Stocks Rally",
    description:
      "The Fed confirmed it will hold interest rates steady, triggering a broad rally across technology stocks. Lower rates reduce borrowing costs for companies, which boosts their valuations.",
    simpleSummary:
      "The central bank paused interest rate hikes — this is good news for tech stocks like Apple, Microsoft, and Nvidia because cheaper borrowing makes companies worth more.",
    publishedAt: "8 min ago",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80",
    articleUrl: "https://www.reuters.com/site-search/?query=Federal+Reserve+rate+pause",
  },
  {
    id: "c2",
    source: "Bloomberg",
    category: "Earnings",
    tickers: ["NVDA", "MSFT", "GOOGL"],
    impact: "Positive",
    title: "Nvidia Reports Record Revenue — AI Chip Demand Hits All-Time High",
    description:
      "Nvidia's quarterly earnings shattered expectations as AI chip orders from Microsoft, Google, and Meta surge. The company raised its full-year guidance significantly.",
    simpleSummary:
      "Nvidia just posted its best financial results ever, driven by huge demand for AI chips from companies like Microsoft and Google. This is excellent news for Nvidia shareholders.",
    publishedAt: "22 min ago",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
    articleUrl: "https://www.bloomberg.com/search?query=Nvidia+AI+chip+revenue",
  },
  {
    id: "c3",
    source: "CNBC",
    category: "Company",
    tickers: ["TSLA"],
    impact: "Negative",
    title: "Tesla Cuts Prices Again as EV Competition Intensifies",
    description:
      "Tesla announced a further 7% price reduction across its model lineup to defend market share against aggressive pricing from BYD and other Chinese EV manufacturers.",
    simpleSummary:
      "Tesla is cutting prices to compete with cheaper electric cars from China. While this could attract buyers, it squeezes Tesla's profit margins — which is not great for the stock.",
    publishedAt: "45 min ago",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1600&q=80",
    articleUrl: "https://www.cnbc.com/search/?query=Tesla+price+cut+EV+competition",
  },
  {
    id: "c4",
    source: "Financial Times",
    category: "Company",
    tickers: ["GOOGL", "META", "AMZN"],
    impact: "Neutral",
    title: "EU Regulators Launch New Antitrust Probe Into Big Tech Ad Markets",
    description:
      "European regulators have opened investigations into the digital advertising practices of Google, Meta, and Amazon, raising concerns about market dominance and fair competition.",
    simpleSummary:
      "European regulators are investigating whether Google, Meta, and Amazon have too much power over online advertising. This creates legal uncertainty for all three companies.",
    publishedAt: "1 hr ago",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1600&q=80",
    articleUrl: "https://www.ft.com/search?q=EU+antitrust+Google+Meta+Amazon",
  },
  {
    id: "c5",
    source: "MarketWatch",
    category: "Earnings",
    tickers: ["AAPL"],
    impact: "Positive",
    title: "Apple Services Revenue Hits $25B Quarter — Analysts Upgrade Target",
    description:
      "Apple's services division — including the App Store, Apple TV+, and iCloud — generated record quarterly revenue, prompting several major analysts to raise their price targets.",
    simpleSummary:
      "Apple's subscription and app businesses are making record amounts of money. Analysts are now expecting the stock to go even higher as a result.",
    publishedAt: "2 hr ago",
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1600&q=80",
    articleUrl: "https://www.marketwatch.com/search?q=Apple+services+revenue+earnings",
  },
];

// ─── Feed Data ────────────────────────────────────────────────────────────────
// 10 general market news items shown in the scrollable list below the carousel.
// Same fields as carouselNews but with a thumbnailUrl instead of a full imageUrl.
// The "tickers" field can be an empty array [] if the news is market-wide.
const feedNews = [
  { id: "f1",  source: "Dow Jones",       category: "Earnings",   tickers: ["MSFT"],         impact: "Positive", publishedAt: "5 min ago",  title: "Microsoft Cloud Division Grows 28% YoY — Azure Dominance Continues",               thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&q=80", articleUrl: "https://www.wsj.com/search?query=Microsoft+Azure+cloud+earnings" },
  { id: "f2",  source: "Reuters",         category: "Fed & Rates",tickers: [],               impact: "Neutral",  publishedAt: "12 min ago", title: "US Jobless Claims Fall to 6-Month Low — Labour Market Remains Resilient",           thumbnailUrl: "https://images.unsplash.com/photo-1579532537902-1e50099a8aae?w=200&q=80", articleUrl: "https://www.reuters.com/site-search/?query=US+jobless+claims+labor+market" },
  { id: "f3",  source: "CNBC",            category: "Earnings",   tickers: ["AMZN"],         impact: "Positive", publishedAt: "28 min ago", title: "Amazon Prime Memberships Pass 250M Global — Advertising Revenue Soars",             thumbnailUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80", articleUrl: "https://www.cnbc.com/search/?query=Amazon+Prime+advertising+revenue" },
  { id: "f4",  source: "Bloomberg",       category: "Market",     tickers: [],               impact: "Positive", publishedAt: "34 min ago", title: "Bitcoin Spot ETF Inflows Hit Record $2.4B — Institutional Demand Surges",           thumbnailUrl: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=200&q=80", articleUrl: "https://www.bloomberg.com/search?query=Bitcoin+ETF+inflows" },
  { id: "f5",  source: "Yahoo Finance",   category: "Company",    tickers: ["META"],         impact: "Negative", publishedAt: "51 min ago", title: "Meta Faces $3B Fine as EU Rules AI Data Practices Violated Privacy Laws",           thumbnailUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&q=80", articleUrl: "https://finance.yahoo.com/search?q=Meta+EU+fine+AI+privacy" },
  { id: "f6",  source: "MarketWatch",     category: "Market",     tickers: [],               impact: "Neutral",  publishedAt: "1 hr ago",   title: "S&P 500 Holds Near Record High as Investors Digest Earnings Season Data",           thumbnailUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=80", articleUrl: "https://www.marketwatch.com/search?q=SP500+earnings+season" },
  { id: "f7",  source: "Financial Times", category: "Company",    tickers: ["GOOGL"],        impact: "Negative", publishedAt: "1 hr ago",   title: "Google Search Market Share Drops Below 88% for First Time in a Decade",            thumbnailUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=200&q=80", articleUrl: "https://www.ft.com/search?q=Google+search+market+share" },
  { id: "f8",  source: "Business Wire",   category: "Company",    tickers: ["AAPL"],         impact: "Positive", publishedAt: "2 hr ago",   title: "Apple Announces $90B Share Buyback Programme — Largest in Company History",         thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&q=80", articleUrl: "https://www.businesswire.com/news/home/search?term=Apple+buyback" },
  { id: "f9",  source: "PR Newswire",     category: "Company",    tickers: ["NVDA", "MSFT"], impact: "Positive", publishedAt: "3 hr ago",   title: "Microsoft and Nvidia Partner on Next-Gen AI Supercomputing Infrastructure",         thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80", articleUrl: "https://www.prnewswire.com/news-releases/news-releases-list.html" },
  { id: "f10", source: "GlobeNewswire",   category: "Fed & Rates",tickers: [],               impact: "Negative", publishedAt: "4 hr ago",   title: "IMF Warns Fed Rate Cuts May Fuel Renewed Inflation if Cut Too Soon",               thumbnailUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=200&q=80", articleUrl: "https://www.globenewswire.com/search/keyword/Federal%20Reserve%20inflation" },
];

// ─── Category Filter Options ──────────────────────────────────────────────────
// Used to filter the news feed by type of financial news.
// "All" shows everything. The rest filter by the item's category field.
const CATEGORIES = ["All", "Earnings", "Fed & Rates", "Market", "Company"];

// Colour for each category pill when active
const CAT_COLORS = {
  "Earnings":    "#22e6a8", // green
  "Fed & Rates": "#63b3ed", // blue
  "Market":      "#f0b429", // amber
  "Company":     "#9f7aea", // purple
};

// ─── Impact Config ────────────────────────────────────────────────────────────
// Controls the colour and label for the Positive / Negative / Neutral badges
// shown on every news card and carousel slide.
const IMPACT_CFG = {
  Positive: { color: "#22e6a8", bg: "rgba(34,230,168,0.12)", label: "▲ Positive" },
  Negative: { color: "#ff4d5e", bg: "rgba(255,77,94,0.12)",  label: "▼ Negative" },
  Neutral:  { color: "#f0b429", bg: "rgba(240,180,41,0.12)", label: "● Neutral"  },
};

// ─────────────────────────────────────────────────────────────────────────────
// News Component
// ─────────────────────────────────────────────────────────────────────────────
function News() {
  // Tracks which carousel slide is currently visible (0 = first slide)
  const [activeSlide, setActiveSlide] = useState(0);

  // Tracks the text the user types in the search bar
  const [query, setQuery] = useState("");

  // Tracks which category filter button is selected ("All" by default)
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Go to the previous slide — wraps around to the last slide if at the start
  const prev = useCallback(() => {
    setActiveSlide((i) => (i === 0 ? carouselNews.length - 1 : i - 1));
  }, []);

  // Go to the next slide — wraps around to the first slide if at the end
  const next = useCallback(() => {
    setActiveSlide((i) => (i === carouselNews.length - 1 ? 0 : i + 1));
  }, []);

  // Auto-advance the carousel every 6 seconds
  // The cleanup function (return) clears the timer when the component unmounts
  // to avoid memory leaks
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  // Filter the feed list based on the search query AND the selected category.
  // The search checks: article title, source name, or any affected ticker symbol.
  const filtered = feedNews.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.source.toLowerCase().includes(query.toLowerCase()) ||
      item.tickers.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="news-page">

      {/* ── Info Strip ────────────────────────────────────────────────
          A subtle banner at the top listing all trusted news sources.
          This reassures users that the news comes from reputable outlets. */}
      <div className="news-info-strip">
        <Info size={13} />
        All news is sourced from Bloomberg, Reuters, CNBC, MarketWatch, Financial Times, Yahoo Finance, Dow Jones, Business Wire, PR Newswire, and GlobeNewswire.
      </div>

      {/* ── Hero Carousel ─────────────────────────────────────────────
          Full-width cinematic sliding banner showing 5 featured stories.
          Each slide is a clickable <a> tag that opens the article in a
          new tab. The carousel uses CSS cross-fade (opacity transition)
          between slides — only the active slide has opacity: 1. */}
      <div className="news-hero">

        {/* Label bar pinned to the top of the carousel.
            Shows "Watchlist Impact" + the user's watched ticker symbols
            + a pulsing LIVE badge so users know this section is relevant
            to stocks they are already tracking. */}
        <div className="carousel-label-bar">
          <div className="carousel-label-left">
            <Rss size={13} />
            <span>Watchlist Impact</span>
            <span className="carousel-tickers">
              {WATCHLIST.map((t) => (
                <span key={t} className="wl-ticker-chip">{t}</span>
              ))}
            </span>
          </div>
          <span className="live-badge">● LIVE</span>
        </div>

        {/* Render all 5 carousel slides.
            Only the slide matching activeSlide gets the "active" class,
            which sets its opacity to 1 (all others are opacity: 0).
            Each slide is a full <a> link to the real news source. */}
        {carouselNews.map((item, i) => {
          const imp = IMPACT_CFG[item.impact]; // get colour/label for this item's impact
          return (
            <a
              key={item.id}
              href={item.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`news-hero-slide${i === activeSlide ? " active" : ""}`}
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            >
              {/* Dark gradient overlay so the white text is readable
                  over any background image */}
              <div className="news-hero-overlay" />

              <div className="news-hero-content">
                {/* Source name badge + Positive/Negative/Neutral impact badge */}
                <div className="news-hero-badges">
                  <span className="news-hero-source-badge">{item.source}</span>
                  <span
                    className="news-hero-impact-badge"
                    style={{ color: imp.color, background: imp.bg, borderColor: `${imp.color}44` }}
                  >
                    {imp.label}
                  </span>
                </div>

                {/* Ticker chips — only shown if the article affects specific stocks */}
                {item.tickers.length > 0 && (
                  <div className="news-hero-tickers">
                    {item.tickers.map((t) => (
                      <span key={t} className="hero-ticker">{t}</span>
                    ))}
                  </div>
                )}

                <h2>{item.title}</h2>

                {/* Plain English summary with a 💡 icon — beginner-friendly
                    one-liner explaining why this news matters to investors */}
                <p className="news-hero-simple">💡 {item.simpleSummary}</p>

                {/* Source name + publish time at the bottom of the slide */}
                <div className="news-hero-meta">
                  <span className="news-hero-author">{item.source}</span>
                  <span className="news-hero-dot-sep">·</span>
                  <span>{item.publishedAt}</span>
                </div>
              </div>
            </a>
          );
        })}

        {/* Left and right arrow buttons to manually change slides.
            They are hidden by default and appear on hover (see News.css). */}
        <button className="hero-arrow hero-arrow-left" onClick={prev} aria-label="Previous">
          <ChevronLeft size={22} />
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={next} aria-label="Next">
          <ChevronRight size={22} />
        </button>

        {/* Pagination dots at the bottom centre of the carousel.
            Clicking a dot jumps directly to that slide.
            The active dot is wider and green (see News.css .hero-dot.active). */}
        <div className="hero-dots">
          {carouselNews.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === activeSlide ? " active" : ""}`}
              onClick={() => setActiveSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── More Market News (Scrollable Feed) ────────────────────────
          A vertically scrollable list of 10 general market news items.
          Users can filter by category and search by keyword or ticker. */}
      <div className="news-feed-section">
        <div className="news-feed-header">

          {/* Category filter row — clicking a pill filters the feed list */}
          <div className="news-category-row">
            <h3>More Market News</h3>
            <div className="news-cat-filters">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`news-cat-pill ${categoryFilter === cat ? "cat-pill-active" : ""}`}
                  // When the active pill is not "All", apply that category's colour
                  style={
                    categoryFilter === cat && cat !== "All"
                      ? { color: CAT_COLORS[cat], borderColor: CAT_COLORS[cat], background: `${CAT_COLORS[cat]}18` }
                      : {}
                  }
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar — filters the feed by headline, source, or ticker symbol */}
          <div className="news-search-bar">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by headline, source or ticker..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Feed list — renders the filtered news items.
            Each item is a clickable <a> link to the real news source.
            If nothing matches the search/filter, show a "no results" message. */}
        <div className="news-feed-list">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const imp = IMPACT_CFG[item.impact];
              return (
                <a
                  key={item.id}
                  href={item.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-feed-item"
                >
                  <div className="news-feed-text">
                    {/* Article headline — capped at 2 lines with ellipsis (see CSS) */}
                    <div className="news-feed-title">{item.title}</div>

                    {/* Meta row: impact badge, source, affected tickers, timestamp */}
                    <div className="news-feed-meta">
                      {/* Positive / Negative / Neutral coloured pill */}
                      <span
                        className="feed-impact-pill"
                        style={{ color: imp.color, background: imp.bg, borderColor: `${imp.color}44` }}
                      >
                        {imp.label}
                      </span>

                      {/* News outlet name */}
                      <span className="news-feed-source">{item.source}</span>

                      {/* Ticker chips — only rendered if the item has affected stocks */}
                      {item.tickers.length > 0 && (
                        <span className="feed-tickers">
                          {item.tickers.map((t) => (
                            <span key={t} className="feed-ticker-chip">{t}</span>
                          ))}
                        </span>
                      )}

                      {/* Publish time — right-aligned via margin-left: auto in CSS */}
                      <span className="feed-time">{item.publishedAt}</span>
                    </div>
                  </div>

                  {/* Thumbnail image — hidden automatically if it fails to load */}
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="news-feed-thumb"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </a>
              );
            })
          ) : (
            <p className="news-no-results">No results found for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default News;
