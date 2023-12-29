import * as fs from "fs/promises";

/**
 * Reads a file and returns its contents as a string.
 *
 * @param {string} path - The path of the file to read.
 * @returns {Promise<string>} - A Promise that resolves to the contents of the file.
 */
export async function readFile(path: string): Promise<string> {
  const contents = await fs.readFile(path, "utf8");
  return contents;
}

/**
 * Writes data to a file.
 *
 * @param {string} path - The path of the file to write to.
 * @param {string} data - The data to write to the file.
 * @returns {Promise<void>} - A Promise that resolves when the data has been written to the file.
 */
export async function writeFile(path: string, data: string): Promise<void> {
  await fs.writeFile(path, data);
}
