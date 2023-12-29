import * as fs from "fs/promises";
import { TradeOrder } from "./data/TradeOrder";

export function calculateThreshold(errors: number[]): number {
  const mean = errors.reduce((sum, error) => sum + error, 0) / errors.length;
  const stdDev =
    Math.sqrt(
      errors.reduce((sum, error) => sum + Math.pow(error - mean, 2), 0) /
        errors.length
    ) || 1; // Prevent division by zero

  return mean + 3 * stdDev;
}

export async function readCurrencyPairsFile(): Promise<string[]> {
  const data = await fs.readFile("./currencyPairs.json", "utf8");
  const parsedData = JSON.parse(data);
  return parsedData.currencyPairs;
}

export async function writeCurrencyPairsFile(pairs: string[]): Promise<void> {
  const data = JSON.stringify({ currencyPairs: pairs });
  await fs.writeFile("./currencyPairs.json", data);
}

export function filterByCurrencyPair(
  tradeOrders: TradeOrder[],
  currencyPairIndex: number
): TradeOrder[] {
  return tradeOrders.filter(
    (tradeOrder) => tradeOrder.part3 === currencyPairIndex
  );
}

export function isWithinThreshold(error: number, threshold: number): boolean {
  return error <= threshold;
}
