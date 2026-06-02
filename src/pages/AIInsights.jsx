import { useState } from "react";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Search,
} from "lucide-react";
import "./AIInsights.css";

/* ─── Data ───────────────────────────────────────────────────────── */

const insights = [
  {
    id: "i1",
    symbol: "AAPL",
    company: "Apple Inc.",
    sector: "Technology",
    currentPrice: 197.32,
    change: 2.4,
    sentiment: "positive",
    confidence: "High",
    risk: "Low",
    tags: ["Trending Up", "Strong Earnings", "Stable Business"],

    stockSummary:
      "Apple has had a strong week, driven by better-than-expected iPhone sales and growing momentum in its services business. The company continues to show that it earns money from many different sources, not just hardware. Most analysts are optimistic, though some feel the stock may now be slightly overvalued compared to similar companies.",

    whyMoving:
      "Apple's stock is moving up mainly because its latest quarterly results came in better than what the market expected. Strong demand for iPhones and record revenue from services like iCloud, Apple Music, and the App Store are the main drivers.",

    sentimentReason:
      "The overall mood around Apple is positive. Earnings beat expectations, the services business is growing steadily, and there are no major negative news events affecting the company right now.",

    riskReason:
      "Apple is one of the largest and most established companies in the world. It has a loyal customer base, strong cash reserves, and earns money from many different areas. This makes it less risky than smaller or newer companies.",

    beginnerExplanation:
      "Think of Apple like a giant shop that sells phones, music, apps, and storage. When more people buy from their shop than anyone expected, investors get excited — because more sales means more profit. A rising stock price means investors believe the business is doing well.",

    keyInsight:
      "Apple's services business — things like the App Store and subscriptions — is growing faster than its hardware. This makes the company less dependent on iPhone sales alone, which is a sign of a more stable business long-term.",

    keyTerms: [
      { term: "momentum", explanation: "Momentum means the stock has been moving in one direction consistently. High momentum = the trend is strong and likely to continue for a while." },
      { term: "analysts", explanation: "Analysts are finance professionals whose job is to study companies and predict whether a stock will go up or down. Think of them like expert reviewers — but they can still be wrong." },
      { term: "overvalued", explanation: "Overvalued means the stock price may be higher than what the company is actually worth. It can still go up, but the risk of a price drop is higher." },
    ],
    updatedAt: "2 hr ago",
  },
  {
    id: "i2",
    symbol: "TSLA",
    company: "Tesla Inc.",
    sector: "Electric Vehicles",
    currentPrice: 248.76,
    change: -5.1,
    sentiment: "negative",
    confidence: "Medium",
    risk: "High",
    tags: ["Under Pressure", "High Volatility", "Competitive Market"],

    stockSummary:
      "Tesla's stock has been falling this week. The company is facing growing competition from cheaper electric vehicles made by Chinese manufacturers, and it recently cut prices to compete. This has raised concerns among investors about how much profit Tesla is actually making per car sold.",

    whyMoving:
      "Tesla is moving down mainly because of two things: profit margins are shrinking as the company cuts prices to stay competitive, and demand for electric vehicles in key markets is growing more slowly than expected.",

    sentimentReason:
      "The overall mood around Tesla is negative right now. Price cuts, slowing demand, and increasing competition are creating doubt about whether Tesla can grow as fast as investors previously believed.",

    riskReason:
      "Tesla's stock price can swing dramatically in a single day. The company operates in a fast-moving, competitive industry and is sensitive to news about sales numbers, interest rates, and actions by its CEO. This combination makes it a higher-risk investment.",

    beginnerExplanation:
      "Imagine a company that makes electric cars and used to be the only major player. Now, many other companies are making cheaper electric cars. To stay competitive, Tesla keeps lowering its prices — but lower prices also mean less profit per car. When profits shrink, investors get nervous and the stock price tends to fall.",

    keyInsight:
      "Tesla's challenge right now is not whether people want electric cars — it is whether Tesla can make them profitably when competitors are selling similar products for less money.",

    keyTerms: [
      { term: "volatile", explanation: "Volatile means the stock price moves a lot — sometimes dramatically — in a short time. High volatility = higher risk, but also the chance of bigger gains." },
      { term: "profit margins", explanation: "Profit margin is the percentage of money a company keeps after all its costs. If Tesla sells a car for $50,000 and it costs $45,000 to make, the profit margin is 10%. Lower margins = less money kept per sale." },
      { term: "competition", explanation: "When other companies make similar products for less money, it puts pressure on a company's sales and profits, which can push the stock price down." },
    ],
    updatedAt: "1 hr ago",
  },
  {
    id: "i3",
    symbol: "NVDA",
    company: "Nvidia Corp.",
    sector: "Semiconductors",
    currentPrice: 1124.50,
    change: 8.7,
    sentiment: "positive",
    confidence: "High",
    risk: "Medium",
    tags: ["AI Boom", "Record Revenue", "Sector Leader"],

    stockSummary:
      "Nvidia has been one of the best-performing stocks this year, and it continues to rise. The company makes the computer chips that power artificial intelligence systems, and demand for these chips is growing faster than Nvidia can produce them. The company recently reported record revenue, which sent the stock surging higher.",

    whyMoving:
      "Nvidia is moving up because of the global boom in artificial intelligence. Every major technology company — from Microsoft to Google to Amazon — is spending billions to buy Nvidia's chips to build and run AI systems. This extraordinary demand is pushing revenue and profits to record levels.",

    sentimentReason:
      "Sentiment around Nvidia is very positive. Record earnings, strong demand that exceeds supply, and a dominant position in the AI chip market have created enormous investor confidence. Most analysts have raised their expectations for the company.",

    riskReason:
      "Despite the positive outlook, Nvidia carries medium risk because the stock price has already risen so much. If AI spending slows down, or if competitors develop better chips, the stock could drop sharply. The higher a stock rises, the further it can fall.",

    beginnerExplanation:
      "Think of Nvidia as the company that makes the engines for the AI revolution. Just like every car needs an engine, almost every major AI system needs Nvidia's chips. Right now, demand for these chips is so high that companies are paying huge sums just to get them — which means Nvidia is making enormous amounts of money.",

    keyInsight:
      "Nvidia's position in AI is similar to how companies that made picks and shovels profited during a gold rush — regardless of which AI products ultimately succeed, almost all of them need Nvidia's chips to run.",

    keyTerms: [
      { term: "revenue", explanation: "Revenue is the total money a company earns from selling its products, before any expenses are taken out. Record revenue = the company is making more money than ever." },
      { term: "semiconductors", explanation: "Semiconductors are the tiny chips inside computers, phones, and AI systems that process information. Nvidia makes the most powerful ones used in artificial intelligence." },
      { term: "demand exceeds supply", explanation: "This means more people want to buy the product than there are products available. When this happens, companies can charge higher prices, which increases their profits." },
    ],
    updatedAt: "3 hr ago",
  },
  {
    id: "i4",
    symbol: "META",
    company: "Meta Platforms",
    sector: "Social Media",
    currentPrice: 512.30,
    change: -0.4,
    sentiment: "neutral",
    confidence: "Low",
    risk: "Medium",
    tags: ["Mixed Signals", "AI Investment Phase", "Awaiting Results"],

    stockSummary:
      "Meta's stock has been relatively flat this week, with no strong movement in either direction. The company is in a period where it is spending enormous amounts of money on artificial intelligence and virtual reality, but investors are still waiting to see whether these investments will generate strong returns. There is genuine disagreement among experts about where the stock is headed.",

    whyMoving:
      "Meta is not moving much because investors are in a wait-and-see mode. The core advertising business is still profitable and growing, but the company is spending so heavily on AI and the metaverse that it is hard to predict what profits will look like in the next few quarters.",

    sentimentReason:
      "Sentiment is neutral because there are valid positive and negative arguments. On one side, Meta's advertising business is resilient and AI tools are growing fast. On the other side, massive spending on uncertain future projects is creating doubt.",

    riskReason:
      "Meta is a large, profitable company which reduces risk. However, the uncertainty around whether its AI and metaverse investments will pay off introduces medium-level risk. The stock could move significantly in either direction depending on upcoming earnings reports.",

    beginnerExplanation:
      "Meta owns Facebook, Instagram, and WhatsApp. The company still makes a lot of money from advertising, but it is now spending billions on building AI tools and virtual reality products. Investors are unsure whether these new bets will pay off — so the stock is just sitting still while everyone waits for more information.",

    keyInsight:
      "Meta's near-term stock direction will likely be decided by its next earnings report, which will show whether AI investments are starting to generate revenue or just adding costs.",

    keyTerms: [
      { term: "earnings report", explanation: "An earnings report is a document companies publish every three months showing how much money they made. It is one of the biggest events that can move a stock price up or down." },
      { term: "advertising revenue", explanation: "Money companies like Meta earn when businesses pay to show ads on Facebook, Instagram, or WhatsApp. The more people use these apps, the more Meta can charge for advertising." },
      { term: "metaverse", explanation: "The metaverse is Meta's vision of a virtual world where people work, socialise, and play using devices like VR headsets. It has required huge investment but has not yet become widely popular." },
    ],
    updatedAt: "5 hr ago",
  },
  {
    id: "i5",
    symbol: "AMZN",
    company: "Amazon.com Inc.",
    sector: "E-Commerce / Cloud",
    currentPrice: 193.45,
    change: 3.6,
    sentiment: "positive",
    confidence: "Medium",
    risk: "Low",
    tags: ["Cloud Growth", "Multiple Revenue Streams", "Steady Performer"],

    stockSummary:
      "Amazon has been performing well across both its shopping and cloud computing businesses. AWS, Amazon's cloud division, is growing rapidly and generating most of the company's profits. The retail side is also recovering strongly after a difficult period. Overall, the company is showing signs of consistent, broad-based strength.",

    whyMoving:
      "Amazon is rising because its cloud business, AWS, reported stronger-than-expected growth. Cloud computing is a highly profitable business, and Amazon is the market leader. Additionally, advertising revenue — money brands pay to appear on Amazon's platform — is growing quickly.",

    sentimentReason:
      "Sentiment is positive because Amazon is growing profitably across multiple business lines. Unlike some tech companies that rely on one revenue source, Amazon earns money from shopping, cloud services, subscriptions, and advertising — which gives investors more confidence.",

    riskReason:
      "Amazon is considered lower risk because of its size, its dominant market positions, and the diversity of its income sources. If the shopping business slows down, the cloud and advertising businesses can compensate — and vice versa.",

    beginnerExplanation:
      "Amazon is like a company that runs several different businesses at once: an online shopping mall, a storage service for other companies' data, a streaming service, and an advertising platform. Because it earns money from so many sources, it is less vulnerable if one area slows down — which makes it more stable than companies that only do one thing.",

    keyInsight:
      "Amazon's most profitable business is not its famous online store — it is AWS, its cloud computing division, which earns far higher profit margins. This is why investors often watch cloud growth numbers more closely than shopping figures.",

    keyTerms: [
      { term: "cloud computing", explanation: "Cloud computing means storing and processing data on remote servers over the internet. Amazon rents this infrastructure to thousands of businesses, from small startups to global corporations." },
      { term: "profit margins", explanation: "Profit margin is the percentage of money kept after all costs. Amazon's cloud business has very high margins — meaning it keeps a large portion of every dollar earned." },
      { term: "revenue streams", explanation: "Revenue streams are the different ways a company earns money. Having multiple streams reduces risk — if one slows down, others can make up for it." },
    ],
    updatedAt: "4 hr ago",
  },
  {
    id: "i6",
    symbol: "GOOGL",
    company: "Alphabet Inc.",
    sector: "Technology",
    currentPrice: 178.20,
    change: -2.1,
    sentiment: "negative",
    confidence: "Medium",
    risk: "Medium",
    tags: ["Competitive Pressure", "AI Transition", "Market Share Risk"],

    stockSummary:
      "Alphabet, the company that owns Google, has been under some pressure this week. For the first time in decades, Google's dominance in internet search is being challenged by AI-powered alternatives. At the same time, its advertising business is growing more slowly than expected. The company is investing heavily in AI to respond, but results are mixed so far.",

    whyMoving:
      "Alphabet is moving down because investors are concerned about Google losing search market share to AI-powered tools. Search advertising is still Google's biggest source of income, so any threat to that business gets significant attention from investors.",

    sentimentReason:
      "Sentiment is negative not because Google is failing, but because investors are worried about its future. The company has faced no serious competition in search for over 20 years — and the arrival of AI chatbots that can answer questions directly is seen as the first real threat to its business model.",

    riskReason:
      "Alphabet carries medium risk. It is a profitable, cash-rich company with strong businesses in cloud and advertising. However, the uncertainty about whether AI will disrupt its core search business introduces meaningful risk that did not exist a few years ago.",

    beginnerExplanation:
      "Google's main way of making money is showing advertisements when people search online. For years, almost everyone used Google to search the internet. But now, AI tools like ChatGPT can answer questions directly — without people needing to go to Google at all. If fewer people use Google Search, fewer people see Google ads, and the company earns less money. That concern is why investors are a little nervous right now.",

    keyInsight:
      "The key question for Google is not whether AI is a threat — it clearly is — but whether Google's own AI tools (like Gemini) can keep users within Google's ecosystem rather than switching to competitors.",

    keyTerms: [
      { term: "market share", explanation: "Market share is the percentage of a total market that one company controls. If Google handles 90% of all searches, its search market share is 90%. Losing even a few percentage points can mean billions in lost revenue." },
      { term: "advertising revenue", explanation: "Google makes most of its money by showing ads to people who search online. Companies pay Google every time someone clicks on their ad." },
      { term: "ecosystem", explanation: "An ecosystem is a connected set of products and services that work together and keep users engaged. Google's ecosystem includes Search, Gmail, Maps, YouTube, and Android — all linked to keep users within Google's world." },
    ],
    updatedAt: "6 hr ago",
  },
];

/* ─── Config ─────────────────────────────────────────────────────── */

const FILTERS = [
  { label: "All",      value: "all"      },
  { label: "Positive", value: "positive" },
  { label: "Negative", value: "negative" },
  { label: "Neutral",  value: "neutral"  },
];

const sentimentCfg = {
  positive: { label: "Positive", emoji: "📈", color: "#22e6a8", Icon: TrendingUp  },
  negative: { label: "Negative", emoji: "📉", color: "#ff4d5e", Icon: TrendingDown },
  neutral:  { label: "Neutral",  emoji: "➡️", color: "#f0b429", Icon: Minus       },
};

const riskColor = { Low: "#22e6a8", Medium: "#f0b429", High: "#ff4d5e" };
const confColor = { High: "#22e6a8", Medium: "#f0b429", Low: "#ff4d5e" };

/* ─── Inline Term Tooltip ────────────────────────────────────────── */

function InlineTerm({ word, explanation }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="it-wrap">
      <span className={`it-word ${open ? "it-open" : ""}`} onClick={() => setOpen((o) => !o)}>
        {word}
      </span>
      {open && (
        <span className="it-box">
          <strong>{word}</strong> — {explanation}
        </span>
      )}
    </span>
  );
}

/* ─── Highlighted Summary ────────────────────────────────────────── */

function HighlightedText({ text, keyTerms }) {
  if (!keyTerms || keyTerms.length === 0) return <>{text}</>;
  const sorted = [...keyTerms].sort((a, b) => b.term.length - a.term.length);
  const escaped = sorted.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const termMap = {};
  sorted.forEach((t) => { termMap[t.term.toLowerCase()] = t.explanation; });
  const parts = [];
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", value: text.slice(last, match.index) });
    parts.push({ type: "term", value: match[0], explanation: termMap[match[0].toLowerCase()] });
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return (
    <>
      {parts.map((part, i) =>
        part.type === "text" ? part.value : (
          <InlineTerm key={i} word={part.value} explanation={part.explanation} />
        )
      )}
    </>
  );
}

/* ─── Section Label ──────────────────────────────────────────────── */

function SectionLabel({ children }) {
  return <p className="ic-section-label">{children}</p>;
}

/* ─── How To Guide ───────────────────────────────────────────────── */

function HowToGuide() {
  const [open, setOpen] = useState(true);
  return (
    <div className="how-to-guide">
      <button className="how-to-toggle" onClick={() => setOpen((o) => !o)}>
        <HelpCircle size={15} />
        How to read these cards
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <ol className="how-to-steps">
          <li>
            <span className="step-num">1</span>
            Each card gives an AI-generated analysis of a stock: what is happening, why, and what it means — in plain English.
          </li>
          <li>
            <span className="step-num">2</span>
            Tap any <span className="subtitle-term-example">underlined word</span> in a card to instantly see what that finance term means.
          </li>
          <li>
            <span className="step-num">3</span>
            These cards are for <strong>education only</strong>. They do not tell you to buy or sell anything. Always do your own research.
          </li>
        </ol>
      )}
    </div>
  );
}

/* ─── Status Dot ─────────────────────────────────────────────────── */

function StatusDot({ color }) {
  return <span className="status-dot" style={{ background: color }} />;
}

/* ─── Insight Card ───────────────────────────────────────────────── */

function InsightCard({ insight, isFirst = false }) {
  const [showFull, setShowFull] = useState(isFirst);
  const { label, emoji, color, Icon } = sentimentCfg[insight.sentiment];
  const isUp = insight.change >= 0;

  return (
    <div className={`insight-card s-${insight.sentiment}`}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="ic-top">
        <div className="ic-identity">
          <span className="ic-symbol">{insight.symbol}</span>
          <span className="ic-company">{insight.company}</span>
          <span className="ic-sector">{insight.sector}</span>
        </div>
        <div className="ic-meta">
          <span className={`ic-change ${isUp ? "c-up" : "c-down"}`}>
            {isUp ? "+" : ""}{insight.change.toFixed(1)}% today
          </span>
          <span className="ic-sentiment" style={{ color, borderColor: color, background: `${color}1a` }}>
            {emoji} {label}
          </span>
        </div>
      </div>

      {/* ── Tags ─────────────────────────────────────────────────── */}
      <div className="ic-tags">
        {insight.tags.map((t) => (
          <span key={t} className={`ic-tag t-${insight.sentiment}`}>{t}</span>
        ))}
      </div>

      {/* ── Stock Summary ─────────────────────────────────────────── */}
      <div className="ic-section">
        <SectionLabel>📋 Stock Summary</SectionLabel>
        <p className="ic-summary">
          <HighlightedText text={insight.stockSummary} keyTerms={insight.keyTerms} />
        </p>
        <p className="ic-tap-hint">Tap underlined words to see definitions.</p>
      </div>

      {/* ── Why It's Moving + Beginner Explanation (expandable) ───── */}
      <div className="ic-expand">
        <button className="expand-btn" onClick={() => setShowFull((o) => !o)}>
          {showFull ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showFull ? "Hide full analysis" : "See full analysis"}
        </button>

        {showFull && (
          <div className="ic-full-analysis">
            {/* Why it's moving */}
            <div className="ic-section">
              <SectionLabel>🔍 Why It's Moving</SectionLabel>
              <p className="ic-body-text">{insight.whyMoving}</p>
            </div>

            {/* Sentiment + Risk */}
            <div className="ic-sentiment-risk-row">
              <div className="ic-sr-block">
                <p className="ic-sr-label">
                  <StatusDot color={color} />
                  Sentiment: <strong style={{ color }}>{label}</strong>
                </p>
                <p className="ic-sr-reason">{insight.sentimentReason}</p>
              </div>
              <div className="ic-sr-block">
                <p className="ic-sr-label">
                  <StatusDot color={riskColor[insight.risk]} />
                  Risk: <strong style={{ color: riskColor[insight.risk] }}>{insight.risk}</strong>
                </p>
                <p className="ic-sr-reason">{insight.riskReason}</p>
              </div>
            </div>

            {/* Beginner Explanation */}
            <div className="ic-beginner-box">
              <div className="ic-beginner-header">
                <GraduationCap size={15} />
                <span>For Complete Beginners</span>
              </div>
              <p className="ic-body-text">{insight.beginnerExplanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Key Insight ───────────────────────────────────────────── */}
      <div className="ic-key-insight">
        <Lightbulb size={14} />
        <p>{insight.keyInsight}</p>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="ic-footer">
        <span className="ic-fp">
          <StatusDot color={confColor[insight.confidence]} />
          {insight.confidence} confidence
        </span>
        <span className="ic-updated">Updated {insight.updatedAt}</span>
      </div>

    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

function AIInsights() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = insights.filter(
    (i) => activeFilter === "all" || i.sentiment === activeFilter
  );

  return (
    <section className="ai-page">

      {/* Disclaimer */}
      <div className="ai-disclaimer">
        <AlertCircle size={15} />
        <span>
          AI analysis is for <strong>educational purposes only</strong>. This is{" "}
          <strong>not financial advice</strong>. We do not recommend buying or
          selling any stock. Always do your own research before investing.
        </span>
      </div>

      {/* Header */}
      <div className="ai-header">
        <div className="ai-title-row">
          <Brain size={22} />
          <h1>AI Insights</h1>
        </div>
        <p className="ai-subtitle">
          AI-powered stock analysis in plain English — what is happening, why, and what it means.
          Tap any <span className="subtitle-term-example">underlined word</span> for a definition.
        </p>
      </div>

      {/* Guide */}
      <HowToGuide />

      {/* Filters */}
      <div className="ai-filters">
        {FILTERS.map((f) => {
          const count =
            f.value === "all"
              ? insights.length
              : insights.filter((i) => i.sentiment === f.value).length;
          return (
            <button
              key={f.value}
              className={`af-pill ${activeFilter === f.value ? `af-active af-${f.value}` : ""}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.value !== "all" && sentimentCfg[f.value]?.emoji} {f.label}
              <span className="af-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="insights-grid">
        {filtered.map((insight, idx) => (
          <InsightCard key={insight.id} insight={insight} isFirst={idx === 0} />
        ))}
      </div>

    </section>
  );
}

export default AIInsights;
