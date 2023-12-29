import { MongoClient } from "mongodb";
import { TradeOrder } from "./data/TradeOrder";
import { AIC, OrderFeatures } from "./services/modelTraining";

export const MONGO_CONFIG = {
    dbName: "anormaly",
    username: "apiuser",
    password: "secret",
    authDatabase: "admin",
    host: "localhost",
    port: 27017,
    uriOptions: "?authMechanism=DEFAULT&authSource=admin",
  };

export class DataHandler {
  public mongoClient: MongoClient;

  constructor(mongoUri: string) {
    this.mongoClient = new MongoClient(mongoUri);
  }

  public async connect() {
    await this.mongoClient.connect();
    console.log("Connected to MongoDB");
  }

  public async saveToMongoDB(dataset: TradeOrder[]) {
    const messagesCollection = this.mongoClient
      .db("anormaly")
      .collection("messages");

    for (const tradeOrder of dataset) {
      await messagesCollection.insertOne(tradeOrder);
    }

    console.log("Data saved to MongoDB");
  }

  async fetchExistingData(): Promise<OrderFeatures[]> {
    const ordersCollection = this.mongoClient
      .db(MONGO_CONFIG.dbName)
      .collection("messages");

    const existingData = await ordersCollection.find({}).toArray();

    const existingDataset: OrderFeatures[] = existingData.map((order) => ({
      price: order.price.toString(),
      side: order.side ? "buy" : "sell",
      timestamp: order.timestamp.toString(),
      quantity: order.quantity.toString(),
      quoteAssetQuantity: order.quoteAssetQuantity.toString(),
      omeType: order.omeType,
    }));

    return existingDataset;
  }

  public async trainAndSaveModel(
    dataset: OrderFeatures[],
    modelSavePath: string
  ) {
    const ai = new AIC(dataset);
    const [trainData, testData] = ai.splitDataset(0.8);
    await ai.trainModel(trainData, 50, 32);
    await ai.saveModel(modelSavePath);
    console.log("Model trained and saved.");
  }
  
}
