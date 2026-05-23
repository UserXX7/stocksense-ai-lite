function Dashboard() {
  return (
    <section className="page">
      <h1>Dashboard</h1>
      <p>Market overview, top movers, watchlist, and AI market summary.</p>

      <div className="card-grid">
        <div className="card">
          <h3>Market Overview</h3>
          <p>S&P 500, NASDAQ, DOW, and major market indexes.</p>
        </div>

        <div className="card">
          <h3>AI Market Summary</h3>
          <p>Markets are showing positive momentum with strong tech movement.</p>
        </div>

        <div className="card">
          <h3>Watchlist</h3>
          <p>Track your favorite stocks in one place.</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;