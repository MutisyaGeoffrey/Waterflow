# 💧 WaterFlow – Business Management System

A complete SaaS platform for water refilling stations in Kenya. Replaces manual notebook tracking with a digital system for sales recording, employee management, container configuration, payment tracking, and real-time analytics.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm v8 or higher

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start

# 3. Open your browser at http://localhost:3000
```

---

## 🔐 Demo Credentials

### Business Owner Login
- **Phone:** `+254711111111`
- **PIN:** `0000`

### Employee Login
- **Business ID:** `biz001`
- **Employee PINs:** `1234` (Faith), `5678` (Peter), `9999` (Grace)

---

## 📁 Project Structure

```
waterflow/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── data/
│   │   └── db.js               # Mock database + seed data + helpers
│   ├── styles/
│   │   ├── global.css          # CSS variables, base reset
│   │   ├── components.css      # Buttons, cards, tables, modals, forms
│   │   └── layout.css          # Sidebar, topbar, login, employee app
│   ├── components/
│   │   ├── Sidebar.js          # Navigation sidebar
│   │   ├── SaleModal.js        # Quick sale entry modal
│   │   └── Toast.js            # Toast notification
│   ├── pages/
│   │   ├── LoginPage.js        # Owner + Employee login with PIN input
│   │   ├── DashboardPage.js    # KPIs, charts, leaderboard
│   │   ├── TransactionsPage.js # Filtered transaction history + table
│   │   ├── EmployeesPage.js    # Employee CRUD + stats cards
│   │   ├── ContainersPage.js   # Container size + price management
│   │   ├── ReportsPage.js      # Export + WhatsApp report modal
│   │   └── EmployeeApp.js      # Mobile-style employee interface
│   ├── App.js                  # Root component + routing
│   └── index.js                # React entry point
└── package.json
```

---

## ✅ Features

### Owner Dashboard
- **Dashboard** — Live KPIs (revenue, liters, transactions), weekly trend line chart, Cash vs M-Pesa doughnut chart, employee leaderboard, quick stats
- **Transactions** — Full history table with filters (payment method, service type, employee), CSV/PDF export
- **Employees** — Add/deactivate employees, reset PINs, view individual stats
- **Containers** — Add/edit/deactivate container sizes with dynamic pricing
- **Reports** — Analytics summary, WhatsApp report generator with pre-filled message + deep link

### Employee App
- Personal sales dashboard (sales count, liters, revenue)
- Recent transactions list
- Quick sale entry: container → quantity → payment method → service type
- Offline-ready UI (connect to backend for full offline sync)

---

## 🔌 Connecting to a Real Backend

The app currently uses a local mock database (`src/data/db.js`). To connect to the Node.js/Express backend:

1. Replace functions in `src/data/db.js` with `fetch()` / `axios` API calls
2. API base URL: set in a `.env` file as `REACT_APP_API_URL=http://localhost:3001`
3. Use JWT tokens returned from login endpoints; store in `localStorage`

### Key API endpoints to wire up:
```
POST /api/owners/login
POST /api/auth/employee/login
GET  /api/transactions/today/:businessId
POST /api/transactions
GET  /api/transactions/history/:businessId
GET  /api/containers/:businessId
GET  /api/employees/:businessId
GET  /api/reports/weekly/:businessId
GET  /api/export/csv/:businessId
```

---

## 🛠 Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React 18, Chart.js 4, react-chartjs-2 |
| Fonts      | DM Sans, DM Mono (Google Fonts) |
| Styling    | Plain CSS with CSS custom properties |
| State      | React useState (local) |
| Backend *  | Node.js + Express + PostgreSQL + Prisma |
| Auth *     | JWT + bcrypt PIN hashing |
| M-Pesa *   | Safaricom Daraja API (STK Push, C2B) |

`* Backend not included in this package — see master prompt for full backend schema.`

---

## 📦 Building for Production

```bash
npm run build
```

Output goes to the `build/` folder. Deploy to **Vercel**, **Netlify**, or any static host.

---

## 🗺 Roadmap

- [ ] Connect to Node.js/Express REST API
- [ ] M-Pesa Daraja API integration (STK Push + auto-matching)
- [ ] React Native employee app with SQLite offline sync
- [ ] Business self-registration portal
- [ ] Sales forecasting & low-stock alerts
- [ ] Customer loyalty tracking

---

## 📄 License

MIT — free to use and modify for your business.
