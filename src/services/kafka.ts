import {
  Admin,
  CompressionCodecs,
  CompressionTypes,
  Consumer,
  Kafka,
} from "kafkajs";
import SnappyCodec from "kafkajs-snappy";
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

import { TradeOrder } from "../data/TradeOrder";
import { DataSchema } from "../topics/orders_update_datas";

interface KafkaConfig {
  brokers: string[];
  clientId: string;
}

export class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;
  private admin: Admin;
  private historicalData: TradeOrder[] = [];

  constructor(
    private kafkaConfig: KafkaConfig,
    private topic: string,
    private fromBeginning: boolean
  ) {
    this.kafka = new Kafka(this.kafkaConfig);
    this.fromBeginning = fromBeginning;
    this.consumer = this.kafka.consumer({ groupId: "anomaly-detection-group" });
    this.admin = this.kafka.admin();
  }

  public async discoverTopics(): Promise<
    { name: string; messageCount: number }[]
  > {
    await this.admin.connect();
    const metadata = await this.admin.fetchTopicMetadata();

    const topicsWithMessageCount: { name: string; messageCount: number }[] = [];

    for (const topicMetadata of metadata.topics) {
      const topicName = topicMetadata.name;

      const topicOffsets = await this.admin.fetchTopicOffsets(topicName);

      let messageCount = 0;
      for (const partitionOffset of topicOffsets) {
        messageCount +=
          parseInt(partitionOffset.high, 10) -
          parseInt(partitionOffset.low, 10);
      }

      topicsWithMessageCount.push({ name: topicName, messageCount });
    }

    await this.admin.disconnect();

    return topicsWithMessageCount;
  }

  public async consume() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.topic,
      fromBeginning: this.fromBeginning,
    });

    const dataSchema = new DataSchema();

    // Add a seek offset
    const seekPartition = 0;
    const seekOffset = "0";


    const messageLimit = 10; // Set the desired message limit
    let messageCount = 0;

    const eachMessagePromise = new Promise<void>((resolve, reject) => {
      this.consumer
        .run({
          eachMessage: async ({ message }) => {
            const messageValue = JSON.parse(message.value?.toString() || "{}");
            //console.log("Received message:", messageValue);

            const tradeOrder = await dataSchema.receive(messageValue);
            //console.log("Received tradeOrder:", tradeOrder);
            this.historicalData.push(tradeOrder);

            messageCount++;

            if (messageCount >= messageLimit) {
              resolve();
            }
          },
        })
        .catch((error) => {
          reject(error);
        });
    });

    this.consumer.seek({
      topic: this.topic,
      partition: seekPartition,
      offset: seekOffset,
    });

    // Wait for the run() method to complete
    await eachMessagePromise;

    //await this.consumer.disconnect();

    console.log(
      `Loaded ${this.historicalData.length} historical trade orders from Kafka topic.`
    );
    return this.historicalData;
  }

  public getHistoricalData(): TradeOrder[] {
    return this.historicalData;
  }
}
