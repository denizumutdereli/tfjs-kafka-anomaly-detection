import * as tf from "@tensorflow/tfjs-node";
import { readFile } from "fs/promises";
import { TradeOrder } from "./data/TradeOrder";
import { preprocessTradeOrders } from "./data/dataPreprocessing";
import { KafkaService } from "./services/kafka";

const KAFKA_CONFIG = {
  brokers: ["127.0.0.1:9092"],
  clientId: "anomaly-detection-client",
};
const KAFKA_TOPIC = "trade_orders";

const kafkaService = new KafkaService(
  KAFKA_CONFIG,
  KAFKA_TOPIC,
  true
);

interface SavedThreshold {
  threshold: number;
}

async function main(): Promise<void> {
  console.log("Starting the anomaly detection...");

  try {
    const model = await tf.loadLayersModel("file://./saved-model/model.json");
    const thresholdData = JSON.parse(
      await readFile("./saved-model/saved-threshold.json", "utf-8")
    ) as SavedThreshold;
    const threshold = thresholdData.threshold;

    const kafkaService = new KafkaService(KAFKA_CONFIG, KAFKA_TOPIC, false);

    await kafkaService.consume();

    const tradeOrders: TradeOrder[] = kafkaService.getHistoricalData();

    const preprocessedData = preprocessTradeOrders(tradeOrders);

    const inputData = preprocessedData.map((data) => Object.values(data));
    inputData.forEach((row, index) => {
      row.forEach((value, colIndex) => {
        if (isNaN(value) || value === undefined || value === null) {
          console.error(
            `Invalid value at Trade Order ID ${tradeOrders[index].id}, row: ${index}, col: ${colIndex}`
          );
        }
      });
    });
    const predictions = model.predict(tf.tensor(inputData)) as tf.Tensor;
    const reconstructionError = tf.losses.meanSquaredError(
      tf.tensor(inputData),
      predictions
    );

    const errorsArray = Array.from(reconstructionError.dataSync());

    errorsArray.forEach((error, index) => {
      console.log(`Trade Order ID: ${index}, Reconstruction Error: ${error}`);

      if (error > threshold) {
        console.log(`Anomaly detected in Trade Order ID: ${index}`);
      }
    });
  } catch (error) {
    console.error("Error during the anomaly detection:", error);
    process.exit(1);
  }
}

main();
