import type { Candle } from "../schemas.ts";
import { DEMO_SYMBOLS } from "./instruments.ts";

/**
 * Live market data from Binance's public (unauthenticated) endpoints.
 *
 *  - REST  https://data-api.binance.vision  -> historical OHLC klines
 *  - WS    wss://data-stream.binance.vision -> real-time best bid/ask stream
 *
 * No API key is required. The best bid/ask (@bookTicker) stream updates on
 * every top-of-book change — many times per second for liquid pairs — giving a
 * genuine fast "live" feel, and provides the real bid/ask (not synthetic).
 */

const REST_URL = "https://data-api.binance.vision/api/v3/klines";
const WS_URL = "wss://data-stream.binance.vision/stream";

/** LGFX symbol ("BTCUSD") -> Binance symbol ("BTCUSDT"). USD is quoted as USDT. */
export function toBinance(symbol: string): string {
  return symbol.endsWith("USD") ? `${symbol.slice(0, -3)}USDT` : symbol;
}

/** Binance symbol ("BTCUSDT") -> LGFX symbol ("BTCUSD"). */
function fromBinance(bsym: string): string {
  return bsym.endsWith("USDT") ? `${bsym.slice(0, -4)}USD` : bsym;
}

/** App timeframe keys map 1:1 onto Binance kline intervals. */
const INTERVALS: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
  "1w": "1w",
};

/** Fetch real historical candles for a symbol/timeframe from Binance. */
export async function fetchKlines(
  symbol: string,
  timeframe: string,
  limit = 500,
): Promise<Candle[]> {
  const interval = INTERVALS[timeframe] ?? "1m";
  const capped = Math.min(Math.max(limit ?? 500, 1), 1000);
  const url = `${REST_URL}?symbol=${toBinance(symbol)}&interval=${interval}&limit=${capped}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const rows = (await res.json()) as unknown[][];
    return rows.map((r) => ({
      time: Math.floor(Number(r[0]) / 1000), // openTime ms -> sec
      open: Number(r[1]),
      high: Number(r[2]),
      low: Number(r[3]),
      close: Number(r[4]),
      volume: Number(r[5]),
    }));
  } catch {
    return [];
  }
}

// ── Live best bid/ask stream (one combined socket for all demo symbols) ────

type TickHandler = (symbol: string, bid: number, ask: number) => void;

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let manuallyStopped = false;

export function startTickStream(onTick: TickHandler): void {
  manuallyStopped = false;
  stopTickStream(true);

  const streams = DEMO_SYMBOLS.map(
    (s) => `${toBinance(s.name).toLowerCase()}@bookTicker`,
  ).join("/");

  const connect = () => {
    if (manuallyStopped) return;
    ws = new WebSocket(`${WS_URL}?streams=${streams}`);

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string);
        const d = msg?.data;
        // bookTicker payload: { s: symbol, b: bestBid, a: bestAsk, ... }
        if (d && d.s && d.b && d.a) {
          const bid = Number(d.b);
          const ask = Number(d.a);
          if (Number.isFinite(bid) && Number.isFinite(ask)) {
            onTick(fromBinance(d.s), bid, ask);
          }
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    ws.onclose = () => {
      ws = null;
      if (!manuallyStopped) reconnectTimer = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      try {
        ws?.close();
      } catch {
        /* no-op */
      }
    };
  };

  connect();
}

export function stopTickStream(internal = false): void {
  if (!internal) manuallyStopped = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.onclose = null;
    try {
      ws.close();
    } catch {
      /* no-op */
    }
    ws = null;
  }
}
