import { useEffect, useRef, useState } from "react";
import { X, Download } from "lucide-react";
import { getNickname } from "../services/profile.ts";

export type ShareTrade = {
  symbolName: string;
  side: string;
  entryPrice: number;
  currentPrice?: number | null;
  pnl: number;
  leverage?: number;
  closed?: boolean;
};

const GREEN = "#10b981";
const RED = "#ef4444";
const MUTED = "#8b8b93";

export function ShareCard({ trade, onClose }: { trade: ShareTrade; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showPnl, setShowPnl] = useState(true);
  const [showPosition, setShowPosition] = useState(true);
  const [showNickname, setShowNickname] = useState(true);
  const [nickname, setNickname] = useState("");
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);

  const side = trade.side === "LONG" || trade.side === "BUY" ? "LONG" : "SHORT";
  const lev = trade.leverage && trade.leverage > 0 ? trade.leverage : 1;
  const cur = trade.currentPrice ?? trade.entryPrice;
  const dir = side === "LONG" ? 1 : -1;
  const pnlPct = trade.entryPrice > 0 ? ((cur - trade.entryPrice) / trade.entryPrice) * 100 * lev * dir : 0;
  const up = trade.pnl >= 0;
  const color = up ? GREEN : RED;

  useEffect(() => {
    getNickname().then(setNickname);
  }, []);

  // Load the hooded-wolf logo — green eyes for profit, red eyes for loss.
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogo(img);
    img.onerror = () => setLogo(null);
    img.src = up ? "/hunter-green.png" : "/hunter-red.png";
  }, [up]);

  function fmtPrice(n: number) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 600;
    const H = 680;
    const scale = 2;
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#111214");
    grad.addColorStop(1, "#0a0a0b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#26272b";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    const PAD = 44;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // ── brand: wolf logo, name, tagline ──
    if (logo) {
      ctx.drawImage(logo, PAD, 30, 104, 104);
    }
    ctx.font = "700 24px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Liquidity", PAD, 164);
    const lqw = ctx.measureText("Liquidity").width;
    ctx.fillStyle = GREEN;
    ctx.fillText("Hunter", PAD + lqw, 164);
    ctx.font = "500 15px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.fillText("We don't chase we hunt", PAD, 190);

    // nickname pill (top-right)
    if (showNickname && nickname) {
      ctx.font = "600 15px Inter, system-ui, sans-serif";
      const tw = ctx.measureText(nickname).width;
      const pillW = tw + 28;
      const pillX = W - PAD - pillW;
      ctx.fillStyle = "#1c1d21";
      roundRect(ctx, pillX, 46, pillW, 32, 16);
      ctx.fill();
      ctx.fillStyle = "#d4d4d8";
      ctx.textAlign = "center";
      ctx.fillText(nickname, pillX + pillW / 2, 62);
      ctx.textAlign = "left";
    }

    let y = 246;

    // ── symbol · Perpetual (measured with the big font so it never overlaps) ──
    ctx.font = "700 34px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(trade.symbolName, PAD, y);
    const symW = ctx.measureText(trade.symbolName).width;
    ctx.font = "500 18px Inter, system-ui, sans-serif";
    ctx.fillStyle = MUTED;
    ctx.fillText("Perpetual", PAD + symW + 18, y + 3);
    y += 46;

    // ── side | leverage ──
    ctx.font = "600 20px Inter, system-ui, sans-serif";
    ctx.fillStyle = side === "LONG" ? GREEN : RED;
    ctx.fillText(side, PAD, y);
    const sw = ctx.measureText(side).width;
    ctx.fillStyle = MUTED;
    ctx.fillText(`  |  ${lev}x`, PAD + sw, y);
    y += 58;

    // ── big PNL % + amount ──
    if (showPnl) {
      ctx.font = "800 66px Inter, system-ui, sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`, PAD, y);
      y += 50;
      ctx.font = "600 26px Inter, system-ui, sans-serif";
      ctx.fillText(`${trade.pnl >= 0 ? "+" : ""}${fmtPrice(trade.pnl)} USD`, PAD, y);
      y += 54;
    }

    // ── position details ──
    if (showPosition) {
      y += 8;
      const rows: Array<[string, string]> = [
        ["Entry Price", fmtPrice(trade.entryPrice)],
        [trade.closed ? "Exit Price" : "Current Price", fmtPrice(cur)],
      ];
      for (const [label, val] of rows) {
        ctx.font = "500 21px Inter, system-ui, sans-serif";
        ctx.fillStyle = MUTED;
        ctx.fillText(label, PAD, y);
        ctx.font = "700 26px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "right";
        ctx.fillText(val, W - PAD, y);
        ctx.textAlign = "left";
        y += 48;
      }
    }

    // ── footer ──
    ctx.font = "600 15px Inter, system-ui, sans-serif";
    ctx.fillStyle = MUTED;
    ctx.fillText("www.liquidityhunter.org", PAD, H - 36);
  }, [showPnl, showPosition, showNickname, nickname, trade, color, cur, lev, pnlPct, side, up, logo]);

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    const link = document.createElement("a");
    link.download = `${trade.symbolName}-liquidityhunter.png`;
    link.href = c.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-[#111] p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Share P/L</span>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <canvas ref={canvasRef} className="w-full rounded-lg border border-neutral-800" />

        <div className="mt-4 space-y-2">
          <Toggle label="Show PNL" on={showPnl} set={setShowPnl} />
          <Toggle label="Show Position" on={showPosition} set={setShowPosition} />
          <Toggle label="Nickname" on={showNickname} set={setShowNickname} />
        </div>

        <button
          onClick={download}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
        >
          <Download className="h-4 w-4" /> Download
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      onClick={() => set(!on)}
      className="flex w-full items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-neutral-200"
    >
      <span>{label}</span>
      <span className={"relative h-5 w-9 rounded-full transition " + (on ? "bg-emerald-500" : "bg-neutral-700")}>
        <span className={"absolute top-0.5 h-4 w-4 rounded-full bg-white transition " + (on ? "left-[18px]" : "left-0.5")} />
      </span>
    </button>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
