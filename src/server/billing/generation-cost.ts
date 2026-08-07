export type UsdToEurRate = {
  rate: number;
  date: Date;
  source: "frankfurter-ecb";
};

type FrankfurterRate = { date?: string; base?: string; quote?: string; rate?: number };

export async function fetchUsdToEurRate(): Promise<UsdToEurRate> {
  const response = await fetch("https://api.frankfurter.dev/v2/rate/USD/EUR?providers=ECB", {
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error("USD_EUR_RATE_UNAVAILABLE");
  const payload = await response.json() as FrankfurterRate;
  if (payload.base !== "USD" || payload.quote !== "EUR" || typeof payload.rate !== "number" || !Number.isFinite(payload.rate) || payload.rate <= 0 || !payload.date) {
    throw new Error("USD_EUR_RATE_INVALID");
  }
  const date = new Date(`${payload.date}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("USD_EUR_RATE_INVALID");
  return { rate: payload.rate, date, source: "frankfurter-ecb" };
}
