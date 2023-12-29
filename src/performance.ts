import { DataHandler, MONGO_CONFIG } from './dataHandler';
import { KafkaService } from './services/kafka';
import { AIC, OrderFeatures } from './services/modelTraining';

const KAFKA_TOPIC = 'trade_orders';
const MODEL_LOAD_PATH = 'saved_model/model.json';

const KAFKA_CONFIG = {
  brokers: ['127.0.0.1:9092'],
  clientId: 'anomaly-detection-client',
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
    .collection('messages');

  // Connect to Kafka and consume historical trade orders
  const historicalTradeOrders = await kafkaService.consume();
  
  const newDataset: OrderFeatures[] = historicalTradeOrders.map((tradeOrder) => ({
    price: tradeOrder.price.toString(),
    side: tradeOrder.side ? 'buy' : 'sell',
    timestamp: tradeOrder.timestamp.toString(),
    quantity: tradeOrder.quantity.toString(),
    quoteAssetQuantity: tradeOrder.quoteAssetQuantity.toString(),
    omeType: tradeOrder.omeType,
  }));

  // Fetch existing data from MongoDB
  const existingData = await dataHandler.fetchExistingData();

  // Combine newDataset and existingData
  const combinedDataset: OrderFeatures[] = [...newDataset, ...existingData];

  // Load the trained model
  const aic = new AIC(combinedDataset);
  await aic.loadModel(MODEL_LOAD_PATH);

  // Evaluate the model's performance
  const error = aic.evaluateModel(combinedDataset);
  console.log('Model Evaluation Error:', error);
};

main().catch((error) => {
  console.error('Error:', error);
});
