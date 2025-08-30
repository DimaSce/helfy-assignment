import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import log4js from "log4js";

const app = express();
const PORT = process.env.PORT || 4000;

// --- Log4js setup ---
log4js.configure({
  appenders: { out: { type: "stdout", layout: { type: "json" } } },
  categories: { default: { appenders: ["out"], level: "info" } }
});
const logger = log4js.getLogger();

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Database connection ---
const dbConfig = {
  host: process.env.DB_HOST || "tidb",
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "testdb"
};

// --- Utility functions ---
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

function generateToken(user) {
  return jwt.sign({ email: user.email }, "secretkey", { expiresIn: "1h" });
}

function logUserAction(userId, action, ip) {
  logger.info({
    timestamp: new Date().toISOString(),
    user: userId,
    action,
    ip
  });
}

// --- Routes ---
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await getConnection();
    await conn.execute(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, password]
    );
    await conn.end();

    logUserAction(email, "register", req.ip); // log register
    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE email=? AND password=?",
      [email, password]
    );
    await conn.end();

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(rows[0]);
    logUserAction(email, "login", req.ip); // log login
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "secretkey");
    res.json({ email: decoded.email });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
