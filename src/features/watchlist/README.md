# Watchlist Data Integration

The watchlist is functional without a quote provider and shows missing market values as
pending. A future API client can supply a complete snapshot in any of these ways:

- Pass a `data` prop to `Watchlist`.
- Assign `window.stockSenseWatchlistData`.
- Store JSON under `localStorage.stocksenseWatchlistData`.
- Dispatch a `stocksense:watchlist-data` `CustomEvent` with the payload as `detail`.

## Snapshot Shape

```js
{
  status: {
    isLive: true,
    label: "Live market feed connected",
    provider: "Market Provider",
    updatedAt: "2026-05-26T14:31:00Z"
  },
  items: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      exchange: "NASDAQ",
      sector: "Technology",
      quote: {
        price: 198.42,
        change: 2.10,
        changePercent: 1.07,
        previousClose: 196.32,
        dayHigh: 199.02,
        dayLow: 195.88,
        volume: 52740231,
        marketCap: 3050000000000,
        updatedAt: "2026-05-26T14:31:00Z"
      },
      history: {
        "1D": [{ label: "10:00", value: 196.9 }],
        "1M": [{ label: "May 01", value: 189.2 }]
      }
    }
  ]
}
```

Flat quote fields such as `price`, `latestPrice`, `close`, `percentChange`, and
`volume` are also normalized. A provider may send `quotes` and `histories` maps keyed
by ticker instead of nesting values inside `items`.

## Live Update Example

```js
window.dispatchEvent(
  new CustomEvent("stocksense:watchlist-data", {
    detail: watchlistSnapshot,
  })
);
```

User actions emit `stocksense:watchlist-action` with types `add-symbol`,
`remove-symbol`, `save-alert`, and `remove-alert`, allowing a future backend client to
synchronize local actions with an authenticated account.
