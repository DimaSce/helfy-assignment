# Full-Stack Application with TiDB, Kafka, and CDC

This repository contains a full-stack application with:

- **Frontend**: React
- **Backend**: Node.js (Express)
- **Database**: TiDB (with CDC)
- **Message Broker**: Kafka
- **CDC Consumer**: Node.js
- **Monitoring**: Log4js structured JSON logs

All services are dockerized and orchestrated via Docker Compose.

---

## 1 Prerequisites

- Docker & Docker Compose installed
- Ports available: `3000`, `4000`, `5000`, `2379`, `2181`, `9092`, `8300`

---



---

## 2 Start the Full Environment

```bash
docker-compose up -d --build
```

This will start:

- PD, TiKV, TiDB  
- TiCDC  
- Zookeeper, Kafka  
- Backend (Node.js API)  
- Frontend (React)  
- CDC Consumer (Node.js)  
- Optional MySQL init (creates `testdb` and `users` table)

---

## 4️⃣ Initialize Database (if not automatic)

Check if `test_db` exists:

```bash
mysql -h 127.0.0.1 -P 4000 -u root -e "SHOW DATABASES;"
```

Check `users` table:

```bash
mysql -h 127.0.0.1 -P 4000 -u root -e "SELECT * FROM testdb.users;"
```

---

## 5️⃣ User Registration & Login (Backend + Frontend)

### Using `curl`:

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get profile (replace <TOKEN> with the JWT received)
curl http://localhost:5000/profile -H "Authorization: Bearer <TOKEN>"
```

### Using Frontend

- Open [http://localhost:3000](http://localhost:3000)  
- Enter email/password → Register → Login → Get Profile  

---

## 6️⃣ Check Logs


---

### CDC / Database Change Logs

#### Create a changefeed (if not created automatically):

```bash
docker exec -it ticdc cdc cli changefeed create \
  --pd=http://pd:2379 \
  --sink-uri="kafka://kafka:9092/test_topic?protocol=open-protocol"
```

#### Test database changes:

```bash
docker exec -it tidb mysql -h tidb -P 4000 -u root -e "
USE test_db;
INSERT INTO users (email, password) VALUES ('cdcuser@example.com','123456');
UPDATE users SET password='654321' WHERE email='cdcuser@example.com';
DELETE FROM users WHERE email='cdcuser@example.com';
"
```

#### Consume Kafka messages:

```bash
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic test_topic \
  --from-beginning
```



