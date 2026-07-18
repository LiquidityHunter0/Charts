import type { Candle } from "../schemas.ts";
import { fetchKlines } from "./binance.ts";

/**
 * Real OHLC history, served live from Binance public market data.
 *
 * (Previously this replayed bundled JSON. It now returns genuine, up-to-date
 * candles for the requested symbol/timeframe. The returned Candle[] contract
 * is unchanged, so the chart and api layer consume it exactly as before.)
 */
export async function getHistory(
  symbol: string,
  timeframe: string,
  limit?: number,
): Promise<Candle[]> {
  return fetchKlines(symbol, timeframe, limit ?? 500);
}
