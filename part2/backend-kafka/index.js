import express from "express";
import bodyParser from "body-parser";
import { initKafka, producer } from "./kafka.js";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5001;

app.post("/send", async (req, res) => {
  const { message } = req.body;
  try {
    await producer.send({
      topic: "test-topic",
      messages: [{ value: message }],
    });
    res.json({ status: "Message sent to Kafka" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.listen(PORT, async () => {
  console.log(`Kafka backend listening on port ${PORT}`);
  await initKafka();
});
