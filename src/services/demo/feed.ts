import { publish } from "./bus.ts";
import { mark } from "./engine.ts";
import { startTickStream, stopTickStream } from "./binance.ts";

/**
 * Live market-data feed. Streams REAL-TIME best bid/ask from Binance for every
 * demo symbol (updates many times per second), publishes them on the
 * "market-data" channel (watchlist, header and the chart's forming candle
 * update live), and marks the paper-trading engine to market on every tick.
 */

export function startDemoFeed(): void {
  startTickStream((symbol, bid, ask) => {
    publish("market-data", {
      eventType: "MarketTick",
      symbol,
      bid,
      ask,
      occurredAt: Date.now(),
    });
    mark(symbol, (bid + ask) / 2);
  });
}

export function stopDemoFeed(): void {
  stopTickStream();
}
