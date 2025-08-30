# Part 2: DevOps Implementation

This project includes:

- Backend (Node.js + Express)
- Frontend (Nginx + simple React)
- TiDB database
- MySQL container for initialization
- Apache Kafka + Zookeeper (Confluent)
- Dockerized setup for all services

---

## 1️⃣ Prerequisites

- Docker ≥ 20
- Docker Compose ≥ 1.29
- Ports available: `3000`, `4000`, `5000`, `2181`, `9092`, `9021`
- mysql

---

## 2️⃣ Project Structure


- `init.sql` – initializes database tables and default user
---

## 3️⃣ Step-by-step Launch

### 3.1 Run Docker Compose

```bash
docker-compose up --build
```

- TiDB will start
- MySQL container will initialize tables (`init.sql`)
- Kafka and Zookeeper will start
- Backend waits for TiDB readiness and starts
- Frontend builds and serves React app

---

## 4️⃣ Optional: Remove MySQL init container

```bash
docker stop mysql-init && docker rm mysql-init
```

- The database is already initialized.

---

## 5️⃣ Verify Services

### 5.1 Backend API

```bash
# Register user
curl -X POST http://localhost:5000/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com","password":"123456"}'

# Login user
curl -X POST http://localhost:5000/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com","password":"123456"}'

# Get profile (replace <token>)
curl http://localhost:5000/profile \
-H "Authorization: Bearer <token>"
```

### 5.2 Frontend

- Open browser: `http://localhost:3000`
- Register → Login → Get Profile → JSON output

### 5.3 TiDB

```bash
docker exec -it tidb mysql -h 127.0.0.1 -P 4000 -u root -e "SHOW DATABASES;"
docker exec -it tidb mysql -h 127.0.0.1 -P 4000 -u root -e "USE testdb; SHOW TABLES;"
```
### 5.4 Backend Kafka Service

```bash
# Send message to Kafka
curl -X POST http://localhost:5001/send \
-H "Content-Type: application/json" \
-d '{"message":"Hello Kafka!"}'
```
Logs in backend-kafka should show:
```bash
Kafka producer connected
Kafka consumer connected
Received message: Hello Kafka!
```

## 6️⃣ Logs

```bash
docker logs backend
docker logs frontend
docker logs tidb
docker logs kafka
docker logs zookeeper
```

- Ensure there are **no errors** in backend or Kafka logs

---

## 7️⃣ Restart Policy

- Backend has `restart: unless-stopped`
- Will auto-restart if TiDB was not ready during first run

---

## 8️⃣ Notes

- Backend waits for TiDB and initialized tables via `start-backend.sh`
- Kafka requires Zookeeper ready; if you see connection errors, restart Kafka after Zookeeper

