import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "backend-kafka",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "backend-kafka-group" });

export async function initKafka() {
  await producer.connect();
  console.log("Kafka producer connected");

  await consumer.connect();
  console.log("Kafka consumer connected");

  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value.toString()}`);
    },
  });
}
