declare module "kafkajs-snappy" {
  import { CompressionCodec } from "kafkajs";

  const SnappyCodec: CompressionCodec;

  export = SnappyCodec;
}
