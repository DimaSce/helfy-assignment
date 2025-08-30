import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

const db = await mysql.createConnection({
  host: process.env.DB_HOST || "tidb",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "testdb",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 4000
});

await db.query(`CREATE DATABASE IF NOT EXISTS testdb`);
await db.query(`USE testdb`);

await db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
  )
`);
await db.query(`
  CREATE TABLE IF NOT EXISTS tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    token VARCHAR(512),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// register
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const hash = await bcrypt.hash(password, 10);
  try {
    await db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash]);
    res.json({ message: "User registered" });
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
});

// login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  await db.query("INSERT INTO tokens (user_id, token) VALUES (?, ?)", [user.id, token]);

  res.json({ token });
});

// protected
app.get("/profile", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [tokens] = await db.query("SELECT * FROM tokens WHERE token = ?", [token]);
    if (tokens.length === 0) return res.status(401).json({ error: "Token not valid" });

    const [users] = await db.query("SELECT id, email FROM users WHERE id = ?", [decoded.userId]);
    res.json(users[0]);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
