import { useState } from "react";
import * as engine from "../../services/demo/engine.ts";

/**
 * Leverage picker shown in the order panel next to Buy/Sell. Updates the demo
 * engine's leverage (used for margin on new positions) and persists it.
 */
const LEVERAGES = [1, 5, 10, 20, 50, 100];

export function LeverageSelect() {
  const [lev, setLev] = useState(() => engine.getLeverage());

  const pick = (l: number) => {
    engine.setLeverage(l);
    setLev(l);
  };

  return (
    <div>
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
        Leverage
      </label>
      <div className="mt-1 grid grid-cols-6 gap-1">
        {LEVERAGES.map((l) => (
          <button
            key={l}
            onClick={() => pick(l)}
            className={
              "rounded px-1 py-1 text-[11px] font-medium border transition " +
              (lev === l
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary")
            }
          >
            {l}x
          </button>
        ))}
      </div>
    </div>
  );
}
