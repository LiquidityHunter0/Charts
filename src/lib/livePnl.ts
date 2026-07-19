import type { Position } from "../services/schemas";
import { getDemoSymbol } from "../services/demo/instruments.ts";

export interface LiveTick {
  bid: number;
  ask: number;
  timestamp: number;
}

/**
 * Live P/L for a position at the current tick — same formula as the engine
 * (price move × quantity × contract size × direction). LONG marks on the bid,
 * SHORT on the ask. This is the real dollar P/L; % ROE is P/L ÷ margin.
 */
export function computeLivePnl(p: Position, tick?: LiveTick): number {
  const livePrice = tick
    ? p.side === "LONG"
      ? tick.bid
      : tick.ask
    : p.currentPrice ?? p.entryPrice;
  const contractSize = getDemoSymbol(p.symbolName)?.contractSize ?? 1;
  const dir = p.side === "LONG" ? 1 : -1;
  return (livePrice - p.entryPrice) * p.quantity * contractSize * dir;
}

export function computeLivePrice(p: Position, tick?: LiveTick): number {
  if (!tick) return p.currentPrice ?? p.entryPrice;
  return p.side === "LONG" ? tick.bid : tick.ask;
}
