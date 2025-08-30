import { Kafka } from "kafkajs";
import log4js from "log4js";

log4js.configure({
  appenders: { console: { type: 'console' } },
  categories: { default: { appenders: ['console'], level: 'info' } }
});
const logger = log4js.getLogger();

const kafka = new Kafka({ clientId: "cdc-consumer", brokers: ["kafka:9092"] });
const consumer = kafka.consumer({ groupId: "cdc-group" });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: "testdb-cdc", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      logger.info(JSON.stringify({
        timestamp: new Date().toISOString(),
        change: message.value.toString()
      }));
    }
  });
}

run().catch(console.error);
