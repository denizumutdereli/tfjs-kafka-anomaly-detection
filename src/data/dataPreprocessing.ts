import { TradeOrder } from "./TradeOrder";

/**
 * Normalizes a trade order.
 *
 * @param {any} tradeOrder - The trade order to normalize.
 * @returns {TradeOrder} - The normalized trade order.
 */
export function normalizeTradeOrder(tradeOrder: any): TradeOrder {
  //const parts = tradeOrder.id.split("_");

  const numericFields = ["timestamp", "quantity", "quoteAssetQuantity", "price"];
  const tradeOrderData: any = {};

  for (const [key, value] of Object.entries(tradeOrder)) {
    if (numericFields.includes(key)) {
      tradeOrderData[key] = parseFloat(value as string);
    } else if (key !== "id" && key !== "side" && key !== "omeType") {
      throw new Error(`Invalid field '${key}'`);
    }
  }

  const data = {
    //id: tradeOrder.id,
    side: tradeOrder.side === "buy" ? 1 : -1,
    ...tradeOrderData,
    omeType: parseInt(tradeOrder.omeType),
  } 

  //console.log(data);

  return new TradeOrder(data);
}

/**
 * Preprocesses a list of trade orders.
 *
 * @param {any[]} tradeOrders - The trade orders to preprocess.
 * @returns {TradeOrder[]} - The preprocessed trade orders.
 */
export function preprocessTradeOrders(tradeOrders: any[]): TradeOrder[] {
  if (!Array.isArray(tradeOrders)) {
    throw new Error('Input data is not an array');
  }
  return tradeOrders.map(normalizeTradeOrder);
}


/**
 * Splits a list of trade orders into training and testing sets.
 *
 * @param {TradeOrder[]} tradeOrders - The trade orders to split.
 * @param {number} trainRatio - The ratio of trade orders to use for training.
 * @returns {[TradeOrder[], TradeOrder[]]} - An array containing the training and testing sets.
 */
export function splitTradeOrders(
  tradeOrders: TradeOrder[],
  trainRatio: number
): [TradeOrder[], TradeOrder[]] {
  const numTrain = Math.floor(tradeOrders.length * trainRatio);
  const trainSet = tradeOrders.slice(0, numTrain);
  const testSet = tradeOrders.slice(numTrain);

  return [trainSet, testSet];
}

/**
 * Augments the data by adding noise to the existing samples.
 *
 * @param {number[][]} data - The original data to augment.
 * @param {number} numSamples - The number of new samples to generate.
 * @param {number} noise - The amount of noise to add to the samples.
 * @returns {number[][]} - The augmented data.
 */
export function augmentData(data: number[][], numSamples: number, noise: number): number[][] {
  const augmentedData = [];

  for (let i = 0; i < numSamples; i++) {
    // Randomly select an existing sample
    const sample = data[Math.floor(Math.random() * data.length)];

    // Add noise to the sample
    const augmentedSample = sample.map(value => value + value * noise * (Math.random() - 0.5));

    augmentedData.push(augmentedSample);
  }

  return augmentedData;
}

