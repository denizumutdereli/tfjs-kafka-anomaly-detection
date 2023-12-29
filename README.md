# TensorFlow.js Kafka Anomaly Detection with TypeScript

## Overview

This repository is an advanced implementation of machine learning with TensorFlow.js (`@tensorflow/tfjs-node`) in a Node.js environment, specifically designed to analyze and process live Kafka event streams. It focuses on detecting anomalies in order streams by continuously training models on incoming data, leveraging Kafka's consumer groups for event handling, and utilizing MongoDB for data persistence and future predictions.

The project showcases practical applications of extractors, modeling techniques, square means, performance metrics optimizations, and the use of ReLU activators in a TypeScript-based environment. It is an exemplary resource for understanding real-time data processing and machine learning integration in a distributed system.

## Key Features

- **Live Stream Processing**: Listens to Kafka event streams, specifically targeting order events for anomaly detection.
- **Dynamic Model Training**: Continuously trains TensorFlow.js models on incoming data for up-to-date anomaly detection.
- **MongoDB Integration**: Stores trained models and predictions in MongoDB for persistence and future analysis.
- **Advanced ML Techniques**: Utilizes extractors, square means, ReLU activators - Sequences, and performance optimizations in model building.
- **TypeScript Implementation**: Written in TypeScript, offering strong typing and modern language features for scalable development.

## Getting Started

### Prerequisites

- Node.js
- Kafka setup and running
- MongoDB instance
- `@tensorflow/tfjs-node` installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tfjs-kafka-anomaly-detection.git
   cd tfjs-kafka-anomaly-detection
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Kafka and MongoDB connections in the provided configuration files.

### Running the Application

1. Start the Kafka consumer:
   ```bash
   nodemon
   ```

## Architecture

- **Event Listener**: Listens to Kafka's order events and feeds data to the TensorFlow.js model.
- **Model Trainer**: Utilizes live data to train and update the ML model continuously.
- **Data Persistence**: MongoDB is used to store and retrieve trained models and predictions.
- **Anomaly Detection**: Implements anomaly detection algorithms using TensorFlow.js.

## Advanced Topics

- **Extractors & Modeling**: Explains how data extractors are used and models are constructed.
- **Performance Metrics**: Discusses the optimization techniques used to enhance model performance.
- **ReLU Activators**: Details the use of ReLU (Rectified Linear Unit) activators in neural networks.
- **Square Means Method**: Elaborates on the implementation and significance of the square means method in this context.

## Contributing

Contributions to this project are welcome. Please follow the guidelines in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[@denizumutdereli](https://www.linkedin.com/in/denizumutdereli)

## Resources and Further Reading

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
