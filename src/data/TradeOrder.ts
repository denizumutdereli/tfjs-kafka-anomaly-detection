/**
 * Represents a trade order.
 */
export class TradeOrder {
  //id?: string;
  // part1: number;
  // part2: number;
  //part3: number;
  side: number;
  timestamp: number;
  quantity: number;
  quoteAssetQuantity: number;
  price: number;
  omeType: number;

  /**
   * Creates a new trade order.
   *
   * @param {object} params - The parameters to use for the trade order.
   * @param {string} params.id - The ID of the trade order.
   * @param {number} params.side - The side of the trade order.
   * @param {number} params.part1 - The first part of the trade order.
   * @param {number} params.part2 - The second part of the trade order.
   * @param {number} params.part3 - The second part of the trade order.
   * @param {number} params.timestamp - The timestamp of the trade order.
   * @param {number} params.quantity - The quantity of the trade order.
   * @param {number} params.quoteAssetQuantity - The quote asset quantity of the trade order.
   * @param {number} params.price - The price of the trade order.
   * @param {number} params.omeType - The OME type of the trade order.
   */
  constructor(params: {
    //id?: string;
    side: number;
    // part1: number;
    // part2: number;
    //part3: number;

    timestamp: number;
    quantity: number;
    quoteAssetQuantity: number;
    price: number;
    omeType: number;
  }) {
    //this.id = params.id;
    this.side = params.side;
    // this.part1 = params.part1;
    // this.part2 = params.part2;
    //this.part3 = params.part3;
    this.timestamp = params.timestamp;
    this.quantity = params.quantity;
    this.quoteAssetQuantity = params.quoteAssetQuantity;
    this.price = params.price;
    this.omeType = params.omeType;
  }
}
