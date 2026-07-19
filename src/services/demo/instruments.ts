import type { Symbol } from "../schemas.ts";

/**
 * Tradable instruments. All are live USDT pairs on Binance (quoted here in USD);
 * history + real-time bid/ask come from Binance public market data.
 */
function crypto(name: string, displayName: string, tickSize: number): Symbol {
  return {
    id: name,
    name,
    displayName,
    category: "CRYPTO",
    contractSize: 1,
    tickSize,
    tickValue: tickSize,
    marginPercent: 1,
    maxLeverage: 100,
    commission: 0,
    swapLong: 0,
    swapShort: 0,
    tradingHoursStart: null,
    tradingHoursEnd: null,
    isActive: true,
  };
}

export const DEMO_SYMBOLS: Symbol[] = [
  crypto("BTCUSD", "Bitcoin", 0.01),
  crypto("ETHUSD", "Ethereum", 0.01),
  crypto("SOLUSD", "Solana", 0.01),
  crypto("BNBUSD", "BNB", 0.01),
  crypto("XRPUSD", "XRP", 0.0001),
  crypto("ADAUSD", "Cardano", 0.0001),
  crypto("DOGEUSD", "Dogecoin", 0.00001),
  crypto("AVAXUSD", "Avalanche", 0.001),
  crypto("LINKUSD", "Chainlink", 0.001),
  crypto("DOTUSD", "Polkadot", 0.001),
  crypto("LTCUSD", "Litecoin", 0.01),
  crypto("TRXUSD", "TRON", 0.00001),
  crypto("ATOMUSD", "Cosmos", 0.001),
  crypto("UNIUSD", "Uniswap", 0.001),
  crypto("NEARUSD", "NEAR", 0.001),
  crypto("APTUSD", "Aptos", 0.001),
  crypto("ARBUSD", "Arbitrum", 0.0001),
  crypto("OPUSD", "Optimism", 0.001),
  crypto("FILUSD", "Filecoin", 0.001),
  crypto("ICPUSD", "Internet Computer", 0.001),
  crypto("ETCUSD", "Ethereum Classic", 0.001),
  crypto("XLMUSD", "Stellar", 0.00001),
  crypto("HBARUSD", "Hedera", 0.00001),
  crypto("ALGOUSD", "Algorand", 0.0001),
  crypto("AAVEUSD", "Aave", 0.01),
  crypto("INJUSD", "Injective", 0.001),
  crypto("SUIUSD", "Sui", 0.0001),
  crypto("TIAUSD", "Celestia", 0.001),
  crypto("PEPEUSD", "Pepe", 0.00000001),
  crypto("SHIBUSD", "Shiba Inu", 0.00000001),
  crypto("WIFUSD", "dogwifhat", 0.0001),
  crypto("BONKUSD", "Bonk", 0.00000001),
  crypto("FLOKIUSD", "Floki", 0.00000001),
  crypto("GALAUSD", "Gala", 0.00001),
  crypto("SANDUSD", "The Sandbox", 0.0001),
  crypto("MANAUSD", "Decentraland", 0.0001),
  crypto("AXSUSD", "Axie Infinity", 0.001),
  crypto("IMXUSD", "Immutable", 0.0001),
  crypto("LDOUSD", "Lido DAO", 0.001),
  crypto("CRVUSD", "Curve", 0.0001),
  crypto("GRTUSD", "The Graph", 0.00001),
  crypto("EOSUSD", "EOS", 0.0001),
];

export const DEMO_SYMBOL_NAMES = DEMO_SYMBOLS.map((s) => s.name);

export function getDemoSymbol(name: string): Symbol | undefined {
  return DEMO_SYMBOLS.find((s) => s.name === name);
}
