//orders_update_data.ts
import * as fs from "fs";

interface MarketData {
  pairs: string[];
}

export interface DataIncoming {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  partial: null;
  partialQuantityProcessed: string;
  quantityLeft: string;
  commission: string;
  totalQuantity: string;
  quantity: string;
  side: number;
  orderBookTimestamp: string;
  omeType: number;
  price: string;
  quoteAssetQuantity: string;
  market: string;
}

export interface DataOutput {
  id: number;
  dateRatio: number;
  userId: number;
  partialQuantityProcessed: number;
  quantityLeft: number;
  commission: number;
  totalQuantity: number;
  quantity: number;
  side: number;
  orderBookTimestamp: number;
  omeType: number;
  price: number;
  quoteAssetQuantity: number;
  market: number;
}

export class DataSchema {
  public marketData: MarketData;
  public filePath: string;

  constructor() {
    this.marketData = this.loadMarketData();
    this.filePath = "./market_data.json";
  }

  async receive(data: DataIncoming): Promise<any> {
    const normalized = this.normalize(data);
    // console.log(normalized, "--------------------------");
    if (data.id === 0) return this.normalize(data);
    return;
  }

  normalize(data: DataIncoming): any {
    const normalizedFeatures: DataOutput = {
      id: data.id,
      dateRatio: this.calculateDateRatio(data.createdAt, data.updatedAt),
      userId: data.userId,
      partialQuantityProcessed: parseFloat(data.partialQuantityProcessed) | 0,
      quantityLeft: parseFloat(data.quantityLeft) | 0,
      commission: parseFloat(data.commission) | 0,
      totalQuantity: parseFloat(data.totalQuantity) | 0,
      quantity: parseFloat(data.quantity) | 0,
      side: data.side | 0,
      orderBookTimestamp: Number(
        Math.floor(new Date(data.orderBookTimestamp).getTime() / 1000)
      ),
      omeType: data.omeType | 0,
      price: parseFloat(data.price) | 0,
      quoteAssetQuantity: parseFloat(data.quoteAssetQuantity) | 0,
      market: this.selectMarket(data.market),
    };

    return normalizedFeatures;
  }

  calculateDateRatio(createdAt: string, updatedAt: string): number {
    const dateFirst = Number(Math.floor(new Date(createdAt).getTime() / 1000));
    const dateEnd = Number(Math.floor(new Date(updatedAt).getTime() / 1000));
    const difference = dateFirst - dateEnd;
    return difference;
  }

  loadMarketData(): MarketData {
    let marketData: MarketData;

    if (fs.existsSync(this.filePath)) {
      const fileContent = fs.readFileSync(this.filePath, "utf8");
      marketData = JSON.parse(fileContent);
    } else {
      marketData = { pairs: [] };
    }

    return marketData;
  }

  selectMarket(pair: string): number {
    const index = this.marketData.pairs.indexOf(pair);

    if (index === -1) {
      this.marketData.pairs.push(pair);
      fs.writeFileSync(this.filePath, JSON.stringify(this.filePath), "utf8");
      return this.marketData.pairs.length - 1;
    } else {
      return index;
    }
  }
}
