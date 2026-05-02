# 💧 WaterFlow – Smart Business Management for Water Refilling Stations

[![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render)](https://waterflow-ioty.onrender.com/health)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel)](https://waterflow.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql)](https://supabase.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org)

**WaterFlow** is a complete SaaS platform that replaces manual notebook tracking for water refilling stations in Kenya and similar markets. Owners get a real‑time dashboard, employees can record sales in 3 taps (mobile app planned), and the system automatically calculates totals, tracks cash vs M‑Pesa, exports reports, and sends daily summaries via WhatsApp.

> 🚀 **Live demo**  
> Frontend: [https://waterflow.vercel.app](https://waterflow.vercel.app)  
> Backend health: [https://waterflow-ioty.onrender.com/health](https://waterflow-ioty.onrender.com/health)  
> Test owner: `+254711111111` / PIN `0000`

---

## 📌 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution & Features](#solution--features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [API Endpoints](#api-endpoints)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Future Roadmap](#future-roadmap)
- [License](#license)

---

## ❓ Problem Statement

Water refilling stations in Nairobi and across Africa use paper notebooks to record sales. Employees write down liters sold, money received, and payment method (Cash or M‑Pesa). At the end of the day, owners manually reconcile totals – a process prone to errors, no remote visibility, and no insights into employee performance or popular container sizes.

## 💡 Solution & Features

**WaterFlow** digitises the entire operation:

### For Owners (Web Dashboard)
- **Live summary** – total liters, revenue, cash vs M‑Pesa split, pickups vs deliveries, transaction count.
- **Weekly sales chart** – liters and revenue trend.
- **Payment method pie chart** – instant cash / M‑Pesa breakdown.
- **Employee leaderboard** – see who sold the most, earns the most revenue.
- **Container management** – add, edit price, activate/deactivate container sizes (5L, 10L, 20L etc.).
- **Employee management** – add, edit, reset PIN, activate/deactivate.
- **Transaction history** – filter by date, employee, payment method, service type; paginated.
- **Export reports** – CSV, PDF (full history or daily summary).
- **WhatsApp report** – one‑click generation of a pre‑filled message to send to any number.

### For Employees (Mobile App – Planned)
- 3‑tap sale recording (select container size → quantity → payment method)
- Offline support with background sync
- PIN login (business ID + 4‑digit PIN)

### Security & Reliability
- bcrypt hashed PINs for owners and employees
- JWT authentication
- PostgreSQL with connection pooling (Supabase)
- Full production deployment on Render (backend) and Vercel (frontend)

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express, Prisma ORM |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | JSON Web Tokens, bcrypt |
| **Frontend** | React, Chart.js (recharts), CSS modules |
| **Deployment** | Render (backend), Vercel (frontend) |
| **File exports** | CSV generation, PDFkit |

---

## 🏗️ Architecture Overview
Client (React) → Vercel (static hosting)
│
▼
Backend API (Node.js/Express) → Render
│
▼
Supabase PostgreSQL (cloud database)

text

- All API endpoints are secured with JWT (owner) or PIN (employee).
- Each business has its own isolated data (`businessId` scope).
- Environment variables control the API base URL (`REACT_APP_API_URL`).

---

## 📡 API Endpoints

Base URL: `https://waterflow-ioty.onrender.com/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/owners/login` | Owner login (phone, pinCode) |
| POST | `/auth/employee/login` | Employee login (businessId, pinCode) |

### Container Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/containers/:businessId` | List all container sizes |
| POST | `/containers/` | Create new container |
| PUT | `/containers/:id` | Update price / status |
| DELETE | `/containers/:id` | Soft delete |

### Employee Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees/:businessId` | List employees with today’s stats |
| POST | `/employees/` | Create employee |
| PUT | `/employees/:id` | Update name / status |
| DELETE | `/employees/:id` | Soft delete |
| POST | `/employees/:id/reset-pin` | Reset PIN (hashed) |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transactions` | Record a sale |
| GET | `/transactions/today/:businessId` | Today’s summary |
| GET | `/transactions/history/:businessId` | Paginated, filtered history |

### Reports & Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/weekly/:businessId` | Weekly sales trend |
| GET | `/reports/employees/:businessId` | Employee performance today |
| POST | `/reports/whatsapp/:businessId` | Generate WhatsApp message & URL |
| GET | `/export/csv/:businessId` | Download CSV |
| GET | `/export/pdf/:businessId` | Download PDF report |
| GET | `/export/daily-summary/:businessId` | Download daily summary PDF |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/debug/business/:businessId` | Debug info (business, employees, containers) |

> All responses are JSON with `{ success: true, data: ... }` or `{ success: false, error: ... }`.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 20.x or 22.x
- PostgreSQL (local or Supabase)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/MutisyaGeoffrey/Waterflow.git
cd Waterflow
2. Backend setup
bash
cd backend
npm install
cp .env.example .env  DATABASE_URL="postgresql://postgres.mibhkfloseckcfnwtrod:1Mutisya123@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
npx prisma db push
npm run seed
npm run dev
Backend runs at http://localhost:3000.
Test health: http://localhost:3000/health

3. Frontend setup
bash
cd ../web-dashboard
npm install
REACT_APP_API_URL=http://localhost:3000/api npm start
Dashboard runs at http://localhost:3001.

4. Login (local)
Owner: +254711111111 / 0000

Employee: use business ID from seed output (e.g., cmoo1v1oq00001uf2o75r2ro3), PIN 1234

☁️ Deployment
The project is deployed on:

Backend – Render (Node.js service)

Frontend – Vercel (React static hosting)

Database – Supabase (PostgreSQL with connection pooler)

Environment variables used in production:

DATABASE_URL (Supabase transaction pooler URL)

JWT_SECRET (random string)

NODE_ENV=production

REACT_APP_API_URL (Render backend URL)

## 📸 Screenshots

### Owner Dashboard – Today’s Summary
![Dashboard Summary](screenshots/dashboard-summary.png)

### Weekly Sales Trend
![Weekly Sales Chart](screenshots/weekly-chart.png)

🧭 Future Roadmap
M‑Pesa API integration – automatic payment verification (per‑station Till/Paybill)

Employee mobile app – React Native with offline SQLite

Self‑service business registration – onboarding portal

Low‑stock alerts & inventory forecasting

📄 License
MIT © Geoffrey Mutisya
