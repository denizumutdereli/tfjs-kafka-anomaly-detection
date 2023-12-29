import * as tf from "@tensorflow/tfjs-node";

/**
 * Creates an autoencoder model with the specified input size.
 * 
 * @param {number} inputSize - The size of the input vector.
 * @returns {tf.Sequential} - The created autoencoder model.
 */
export function createAutoencoder(inputSize: number): tf.Sequential {
  const model = tf.sequential();

  // Encoder
  model.add(tf.layers.dense({ units: 64, activation: "relu", inputShape: [inputSize] }));
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));

  // Decoder
  model.add(tf.layers.dense({ units: 64, activation: "relu" }));
  model.add(tf.layers.dense({ units: inputSize, activation: "linear" }));

  model.compile({ optimizer: "adam", loss: "meanSquaredError" });

  return model;
}

/**
 * Trains the specified autoencoder model on the provided training data for the specified number of epochs.
 * 
 * @param {tf.Sequential} model - The autoencoder model to train.
 * @param {number[][]} trainData - The training data to use.
 * @param {number} epochs - The number of epochs to train the model for.
 * @returns {Promise<void>} - A Promise that resolves when the model has finished training.
 */
export async function trainModel(model: tf.Sequential, trainData: number[][], epochs: number): Promise<void> {
  const trainTensors = tf.tensor2d(trainData, [trainData.length, trainData[0].length]);
  await model.fit(trainTensors, trainTensors, { epochs });
}

/**
 * Calculates the reconstruction error and threshold for the specified autoencoder model and test data.
 * 
 * @param {tf.Sequential} model - The autoencoder model to use for reconstruction.
 * @param {number[][]} testData - The test data to reconstruct.
 * @returns {[number[], number]} - An array containing the reconstruction errors and the calculated threshold.
 */
export function calculateReconstructionErrorAndThreshold(model: tf.Sequential, testData: number[][]): [number[], number] {
  const testTensors = tf.tensor2d(testData);
  const reconstructedTensors = model.predict(testTensors) as tf.Tensor;

  // Calculate per-sample mean squared error
  const errorsTensor = tf.losses.meanSquaredError(testTensors, reconstructedTensors).as1D();

  // Convert Tensor errors to a plain JavaScript array of numbers
  const errors = errorsTensor.arraySync() as number[];

  // Free up memory by disposing of the intermediate tensors
  testTensors.dispose();
  reconstructedTensors.dispose();
  errorsTensor.dispose();

  const threshold = calculateThreshold(errors);

  return [errors, threshold];
}

/**
 * Calculates the threshold for the specified reconstruction errors.
 * 
 * @param {number[]} errors - The reconstruction errors to calculate the threshold for.
 * @returns {number} - The calculated threshold.
 */
function calculateThreshold(errors: number[]): number {
  // ie mean + 3 * standard deviation
  const mean = errors.reduce((sum, error) => sum + error, 0) / errors.length;
  const stdDev = Math.sqrt(
    errors.reduce((sum, error) => sum + Math.pow(error - mean, 2), 0) /
      errors.length
  );
  return mean + 3 * stdDev;
}
