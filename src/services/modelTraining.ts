import * as tf from '@tensorflow/tfjs-node';

export interface OrderFeatures {
  side: string,
  timestamp: string,
  quantity: string,
  quoteAssetQuantity: string,
  price: string,
  omeType: number
}

interface OrderFeaturesNormalized {
  side: number,
  timestamp: number,
  quantity: number,
  quoteAssetQuantity: number,
  price: number,
  omeType: number
}

export class AIC {
  public model: tf.LayersModel;
  public dataset: OrderFeatures[];
  public minMaxValues: Record<keyof Omit<OrderFeatures, 'side' | 'timestamp'>, { min: number; max: number }>;

  constructor(dataset: OrderFeatures[]) {
    this.dataset = dataset;
    this.minMaxValues = this.calculateMinMax(this.dataset);
    this.model = this.createModel();
  }

  splitDataset(ratio: number): [OrderFeatures[], OrderFeatures[]] {
    const shuffleDataset = this.shuffleDataset(this.dataset);
    const splitIndex = Math.floor(shuffleDataset.length * ratio);
    return [shuffleDataset.slice(0, splitIndex), shuffleDataset.slice(splitIndex)];
  }

  shuffleDataset(dataset: OrderFeatures[]): OrderFeatures[] {
    for (let i = dataset.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dataset[i], dataset[j]] = [dataset[j], dataset[i]];
    }
    return dataset;
  }

  orderFeaturesNormalizedToTensorLike2D(data: OrderFeaturesNormalized[]): number[][] {
    return data.map(d => [
      d.side,
      d.timestamp,
      d.quantity,
      d.quoteAssetQuantity,
      d.price,
      d.omeType
    ]);
  }

  // async trainModel(trainData: OrderFeatures[], epochs: number, batchSize: number): Promise<void> {
  
  //   const normalized = trainData.map(d => this.normalizeFeatures(d, this.minMaxValues));
  //   const xsTrain = tf.tensor2d(this.orderFeaturesNormalizedToTensorLike2D(normalized));
  
  //   // Convert prices to numbers before creating the tensor
  //   const ysTrain = tf.tensor2d(trainData.map(d => [parseFloat(d.price)]));
  
  //   this.model.compile({ optimizer: tf.train.adam(), loss: 'meanSquaredError' });
  //   await this.model.fit(xsTrain, ysTrain, { epochs, batchSize });
  
  //   xsTrain.dispose();
  //   ysTrain.dispose();
  // }
  
  async trainModel(trainData: OrderFeatures[], epochs: number, batchSize: number): Promise<void> {
    const normalized = trainData.map(d => this.normalizeFeatures(d, this.minMaxValues));
    const xsTrain = tf.tensor2d(this.orderFeaturesNormalizedToTensorLike2D(normalized));
  
    // Train the autoencoder to reconstruct the input data
    this.model.compile({ optimizer: tf.train.adam(), loss: 'meanSquaredError' });
    await this.model.fit(xsTrain, xsTrain, { epochs, batchSize });
  
    xsTrain.dispose();
  }
  
  async saveModel(modelPath: string): Promise<void> {
    await this.model.save(`file://${modelPath}`);
  }

  async loadModel(modelPath: string): Promise<void> {
    this.model = await tf.loadLayersModel(`file://${modelPath}`);
    this.model.compile({ optimizer: tf.train.adam(), loss: 'meanSquaredError' });
  }

  crossValidation(folds: number, epochs: number, batchSize: number): number {
    const foldSize = Math.floor(this.dataset.length / folds);
    let totalError = 0;

    for (let i = 0; i < folds; i++) {
      const start = i * foldSize;
      const end = start + foldSize;

      const testData = this.dataset.slice(start, end);
      const trainData = [
        ...this.dataset.slice(0, start),
        ...this.dataset.slice(end),
      ];

      this.trainModel(trainData, epochs, batchSize);
      const foldError = this.evaluateModel(testData);
      totalError += foldError;
    }

    return totalError / folds;
  }

  featureSelection(features: (keyof OrderFeaturesNormalized)[]): OrderFeaturesNormalized[] {
    return this.dataset.map((dataPoint) => {
      const normalizedDataPoint = this.normalizeFeatures(dataPoint, this.minMaxValues);
      const filteredDataPoint: Partial<OrderFeaturesNormalized> = {};

      features.forEach((feature) => {
        filteredDataPoint[feature] = normalizedDataPoint[feature];
      });

      return filteredDataPoint as OrderFeaturesNormalized;
    });
  }


  // evaluateModel(testData: OrderFeatures[]): number {
  //   const xsTest = tf.tensor2d(this.orderFeaturesNormalizedToTensorLike2D(testData.map(d => this.normalizeFeatures(d, this.minMaxValues))));
  //   const ysTest = tf.tensor2d(testData.map(d => [parseFloat(d.price)]));

  //   const evaluation = this.model.evaluate(xsTest, ysTest) as tf.Scalar;
  //   const error = evaluation.dataSync()[0];

  //   xsTest.dispose();
  //   ysTest.dispose();

  //   return error;
  // }

  evaluateModel(testData: OrderFeatures[]): number {
    const xsTest = tf.tensor2d(this.orderFeaturesNormalizedToTensorLike2D(testData.map(d => this.normalizeFeatures(d, this.minMaxValues))));
  
    const predictions = this.model.predict(xsTest) as tf.Tensor;
    const error = tf.metrics.meanSquaredError(xsTest, predictions).dataSync()[0];
  
    xsTest.dispose();
    predictions.dispose();
  
    return error;
  } 

  normalizeFeatures(
    features: OrderFeatures,
    minMaxValues: Record<
      keyof Omit<OrderFeatures, 'side' | 'timestamp'>,
      { min: number; max: number }
    >
  ): OrderFeaturesNormalized {
    const normalizedFeatures: OrderFeaturesNormalized = {
      side: this.encodeSide(features.side),
      timestamp: Number(Math.floor(new Date(features.timestamp).getTime() / 1000)),
      quantity: minMaxValues.quantity.max !== minMaxValues.quantity.min ? (parseFloat(features.quantity) - minMaxValues.quantity.min) / (minMaxValues.quantity.max - minMaxValues.quantity.min) : 0,
      quoteAssetQuantity: minMaxValues.quoteAssetQuantity.max !== minMaxValues.quoteAssetQuantity.min ? (parseFloat(features.quoteAssetQuantity) - minMaxValues.quoteAssetQuantity.min) / (minMaxValues.quoteAssetQuantity.max - minMaxValues.quoteAssetQuantity.min) : 0,
      price: minMaxValues.price.max !== minMaxValues.price.min ? (parseFloat(features.price) - minMaxValues.price.min) / (minMaxValues.price.max - minMaxValues.price.min) : 0,
      omeType: minMaxValues.omeType.max !== minMaxValues.omeType.min ? (features.omeType - minMaxValues.omeType.min) / (minMaxValues.omeType.max - minMaxValues.omeType.min) : 0,
    };
  
    return normalizedFeatures;
  }
  
  encodeSide(side: string): number {
    if(side === 'sell') return 0
    else return 1;
  }

  calculateMinMax(
    dataset: OrderFeatures[]
  ): Record<
    keyof Omit<OrderFeatures, 'side' | 'timestamp'>,
    { min: number; max: number }
  > {
    const keys: (keyof Omit<OrderFeatures, 'side' | 'timestamp'>)[] = [
        'quantity', 'quoteAssetQuantity', 'price', 'omeType'
    ];

    const minMaxValues: Record<keyof Omit<OrderFeatures, 'side' | 'timestamp'>, { min: number; max: number }> = {} as any;

    keys.forEach(key => {
      let min, max;
      if (key === 'omeType') {
        min = Math.min(...dataset.map(f => f[key]));
        max = Math.max(...dataset.map(f => f[key]));
      } else {
        min = Math.min(...dataset.map(f => parseFloat(f[key])));
        max = Math.max(...dataset.map(f => parseFloat(f[key])));
      }
      minMaxValues[key] = { min, max };
    });    

    return minMaxValues;
  }

  // createModel(): tf.Sequential {
  //   // You can define and return your TensorFlow.js model here
  //   // For example:
  //   const model = tf.sequential();
  //   model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [6] }));
  //   model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  //   model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
  //   return model;
  // }

  createModel(): tf.Sequential {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [6] })); // Encoder layer
    model.add(tf.layers.dense({ units: 6, activation: 'linear' })); // Decoder layer
    return model;
  }
}
