//train.ts
import { DataHandler, MONGO_CONFIG } from "./dataHandler"; // Import the DataHandler class
import { KafkaService } from "./services/kafka";
import { OrderFeatures } from "./services/modelTraining";
 
const KAFKA_TOPIC = "trade_orders";
const MINIMUM_DATASET_SIZE = 500; // Set the minimum dataset size for training
const MODEL_SAVE_PATH = "saved_model";
const MODEL_CREATION_INTERVAL = 60000; // 60 seconds
const LOOP_INTERVAL = 120000; // 2 minutes

const KAFKA_CONFIG = {
  brokers: ["127.0.0.1:9092"],
  clientId: "anomaly-detection-client",
};

const kafkaService = new KafkaService(KAFKA_CONFIG, KAFKA_TOPIC, true);
const createMongoURI = (config: typeof MONGO_CONFIG): string => {
  return `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.dbName}${config.uriOptions}`;
};

const main = async () => {
  const mongoURI = createMongoURI(MONGO_CONFIG);
  const dataHandler = new DataHandler(mongoURI);
  await dataHandler.connect();

  const messagesCollection = dataHandler.mongoClient
    .db(MONGO_CONFIG.dbName)
    .collection("messages");

  let lastModelCreationTime = 0;

  const messages = await messagesCollection
    .find({ topic: KAFKA_TOPIC })
    .toArray();

  const historicalTradeOrders = await kafkaService.consume();
  //console.log(historicalTradeOrders);
  const newDataset: OrderFeatures[] = historicalTradeOrders.map((tradeOrder) => ({

    price: tradeOrder.price.toString(),
    side: tradeOrder.side ? "buy" : "sell",
    timestamp: tradeOrder.timestamp.toString(),
    quantity: tradeOrder.quantity.toString(),
    quoteAssetQuantity: tradeOrder.quoteAssetQuantity.toString(),
    omeType: tradeOrder.omeType,
  }));

  // Fetch existing data from MongoDB
  const existingData = await dataHandler.fetchExistingData();

  // Combine newDataset and existingData
  const combinedDataset: OrderFeatures[] = [...newDataset, ...existingData];

  console.log("Starting to train...");

  // if (
  //   combinedDataset.length >= MINIMUM_DATASET_SIZE &&
  //   Date.now() - lastModelCreationTime > MODEL_CREATION_INTERVAL
  // ) {
    await dataHandler.saveToMongoDB(historicalTradeOrders);
    await dataHandler.trainAndSaveModel(combinedDataset, MODEL_SAVE_PATH);

    lastModelCreationTime = Date.now();
  // } else {
  //   console.log("Not sufficient data...");
  // }
};

main().catch((error) => {
  console.error("Error:", error);
});




main().catch((error) => {
  console.error("Error:", error);
});
