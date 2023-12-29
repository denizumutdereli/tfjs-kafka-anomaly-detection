import { KafkaService } from './services/kafka';

const KAFKA_TOPIC = 'orders_update_datas';
const MODEL_LOAD_PATH = 'saved_model/model.json';

const KAFKA_CONFIG = {
  brokers: ['127.0.0.1:9092'],
  clientId: 'anomaly-detection-client',
};

const kafkaService = new KafkaService(KAFKA_CONFIG, KAFKA_TOPIC, true);

async function consume() {
  try {
    const messages = await kafkaService.consume();
    console.log(`Consumed ${messages.length} messages`);
    console.log(messages);
  } catch (error) {
    console.error(error);
  }
}

consume();
