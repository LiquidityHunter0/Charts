import { publish } from "./bus.ts";
import { mark } from "./engine.ts";
import { getDemoSymbol } from "./instruments.ts";
import { startTickStream, stopTickStream } from "./binance.ts";

/**
 * Live market-data feed. Streams REAL, real-time trade ticks from Binance for
 * every demo symbol, publishes them on the "market-data" channel (so the
 * watchlist, header and chart's forming candle update live), and marks the
 * paper-trading engine to market on every tick.
 */

export function startDemoFeed(): void {
  startTickStream((symbol, price) => {
    if (!Number.isFinite(price) || price <= 0) return;
    const sym = getDemoSymbol(symbol);
    const spread = Math.max(sym?.tickSize ?? 0.01, price * 0.0001);
    const half = spread / 2;
    publish("market-data", {
      eventType: "MarketTick",
      symbol,
      bid: price - half,
      ask: price + half,
      occurredAt: Date.now(),
    });
    mark(symbol, price);
  });
}

export function stopDemoFeed(): void {
  stopTickStream();
}
