# Full-Stack App with TiDB, Node.js, and React

## Overview

This is a minimal full-stack application with:  

- **Backend**: Node.js + Express + MySQL (TiDB)  
- **Frontend**: React (minimal)  
- **Database**: TiDB  
- **Authentication**: Email/password with JWT  

---

## Step 1: Create Docker Network

```bash
docker network create app-network
```

- All containers will connect to this network to communicate internally.

---

## Step 2: Launch TiDB

```bash
docker run -d --name tidb --network app-network -p 4000:4000 pingcap/tidb:v7.4.0
```

- TiDB listens on port 4000.  
- Verify it is running:

```bash
docker logs tidb
```

---

## Step 3: Initialize Database

1. Connect to TiDB using `mysql` client:

```bash
mysql -h 127.0.0.1 -P 4000 -u root
```

2. Create database and table:

```sql
CREATE DATABASE testdb;
USE testdb;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(500)
);
```

---

## Step 4: Launch Backend

1. Go to backend directory:

```bash
cd backend
```



2. Build Docker image:

```bash
docker build -t backend .
```

4. Run backend container:

```bash
docker run -d --name backend --network app-network -p 5000:4000   -e DB_HOST=tidb -e DB_USER=root -e DB_PASS= -e DB_NAME=testdb -e DB_PORT=4000 -e JWT_SECRET=supersecret   backend
```

- Backend is now accessible from host at `http://localhost:5000`.  

---
5. Test backend
```bash
curl -X POST http://localhost:5000/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"123456"}'


curl -X POST http://localhost:5000/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"123456"}'


curl http://localhost:5000/profile -H "Authorization: Bearer <token_from_login>"
```

## Step 5: Launch Frontend

1. Go to frontend directory:

```bash
cd frontend
```

2. Build Docker image:

```bash
docker build -t frontend .
```

3. Run frontend container:

```bash
docker run -d --name frontend --network app-network -p 3000:80 frontend
```

4. Open in browser:

```
http://localhost:3000
```

- Login/Register form should appear.  

---



## Step 6: Using the App

1. **Register** a user → alert "Registered!"  
2. **Login** → token stored in frontend state  
3. **Get Profile** → displays user info JSON  

---

## Step 8: Stop Containers

```bash
docker stop frontend backend tidb
docker rm frontend backend tidb
docker network rm app-network
```
