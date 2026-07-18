/**
 * Liquidity Hunter brand mark — an inline SVG target/crosshair with candlesticks
 * plus the wordmark. Used on the loading, login and onboarding screens.
 * (Swap the SVG for a real logo image later if you have one.)
 */
export function Logo({
  size = "md",
  showTagline = false,
}: {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}) {
  const dim = size === "lg" ? 52 : size === "sm" ? 30 : 40;
  const title =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" stroke="#10b981" strokeWidth="2.5" fill="none" opacity="0.9" />
        <line x1="24" y1="2" x2="24" y2="9" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="39" x2="24" y2="46" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="2" y1="24" x2="9" y2="24" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="39" y1="24" x2="46" y2="24" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="18" y="22" width="3.5" height="9" rx="1" fill="#ef4444" />
        <line x1="19.75" y1="18" x2="19.75" y2="22" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="19.75" y1="31" x2="19.75" y2="34" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="26.5" y="17" width="3.5" height="12" rx="1" fill="#10b981" />
        <line x1="28.25" y1="14" x2="28.25" y2="17" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="28.25" y1="29" x2="28.25" y2="32" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className={`${title} font-bold tracking-tight text-white`}>
          Liquidity<span className="text-emerald-500">Hunter</span>
        </span>
        {showTagline && (
          <span className="text-[11px] tracking-wide text-neutral-400">
            Hunt the liquidity · Trade with precision
          </span>
        )}
      </div>
    </div>
  );
}
