import { KafkaService } from './services/kafka';

const KAFKA_TOPIC = 'new_orders_BTC_USDT';
const MODEL_LOAD_PATH = 'saved_model/model.json';

const KAFKA_CONFIG = {
  brokers: ['127.0.0.1:9092'],
  clientId: 'anomaly-detection-client',
};

const kafkaService = new KafkaService(KAFKA_CONFIG, KAFKA_TOPIC, true);

const main = async () => {
 
    const topics = await kafkaService.discoverTopics();

    console.log(topics);

};

main().catch((error) => {
  console.error('Error:', error);
});
