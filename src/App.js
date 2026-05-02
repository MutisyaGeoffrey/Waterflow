import React, { useState } from 'react';
import { DB } from './data/db';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import EmployeesPage from './pages/EmployeesPage';
import ContainersPage from './pages/ContainersPage';
import ReportsPage, { WhatsAppModal } from './pages/ReportsPage';
import EmployeeApp from './pages/EmployeeApp';
import Sidebar from './components/Sidebar';
import SaleModal from './components/SaleModal';
import Toast from './components/Toast';

import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';

export default function App() {
  const [screen, setScreen]       = useState('login');       // 'login' | 'owner' | 'employee'
  const [activeNav, setActiveNav] = useState('dashboard');
  const [employee, setEmployee]   = useState(null);
  const [showSale, setShowSale]   = useState(false);
  const [showWA, setShowWA]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [, forceUpdate]           = useState(0);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const refresh   = () => forceUpdate((n) => n + 1);

  const handleSale = ({ containerId, qty, payment, service, mpesa, employeeId }) => {
    const c   = DB.containers.find((x) => x.id === containerId);
    const emp = DB.employees.find((e) => e.id === (employeeId || DB.employees[0].id));
    const txn = {
      id: 'T' + String(DB.nextTxnId++).padStart(4, '0'),
      businessId: 'biz001', employeeId: emp.id, containerId, qty,
      liters: Math.round(c.liters * qty), price: c.price * qty,
      payment, service, mpesa, time: new Date(),
    };
    DB.transactions.push(txn);
    emp.sales++; emp.revenue += txn.price; emp.liters += txn.liters;
    setShowSale(false); refresh();
    showToast(`Sale recorded: KSh ${txn.price.toLocaleString()} · ${txn.liters}L`);
  };

  const PAGE_TITLES = {
    dashboard:    { t: 'Dashboard',          s: `${DB.business.name} · Today's Overview` },
    transactions: { t: 'Transactions',       s: 'All sales records' },
    employees:    { t: 'Employees',          s: 'Manage your team' },
    containers:   { t: 'Containers',         s: 'Container sizes & pricing' },
    reports:      { t: 'Reports & Export',   s: 'Analytics & downloads' },
  };

  if (screen === 'login') {
    return (
      <LoginPage
        onOwnerLogin={() => setScreen('owner')}
        onEmployeeLogin={(emp) => { setEmployee(emp); setScreen('employee'); }}
      />
    );
  }

  if (screen === 'employee') {
    return (
      <EmployeeApp
        employee={employee}
        onLogout={() => { setEmployee(null); setScreen('login'); }}
      />
    );
  }

  // Owner Dashboard
  const info = PAGE_TITLES[activeNav] || { t: '', s: '' };

  return (
    <div className="app-layout">
      <Sidebar
        activeNav={activeNav}
        onNav={(id) => setActiveNav(id)}
        onLogout={() => setScreen('login')}
      />

      <div className="main">
        {/* Top Bar */}
        <div className="topbar">
          <div>
            <div className="page-title">{info.t}</div>
            <div className="page-sub">{info.s}</div>
          </div>
          <div className="topbar-right">
            <span className="sync-dot" />
            <span className="text-sm text-muted">Live</span>
            <button className="btn btn-teal btn-sm" onClick={() => setShowSale(true)}>+ New Sale</button>
          </div>
        </div>

        {/* Page Content */}
        {activeNav === 'dashboard'    && <DashboardPage    onNewSale={() => setShowSale(true)} onWhatsApp={() => setShowWA(true)} />}
        {activeNav === 'transactions' && <TransactionsPage onToast={showToast} />}
        {activeNav === 'employees'    && <EmployeesPage    onToast={showToast} refresh={refresh} />}
        {activeNav === 'containers'   && <ContainersPage   onToast={showToast} refresh={refresh} />}
        {activeNav === 'reports'      && <ReportsPage      onToast={showToast} onWhatsApp={() => setShowWA(true)} />}
      </div>

      {/* Modals */}
      {showSale && <SaleModal onClose={() => setShowSale(false)} onSave={handleSale} />}
      {showWA   && <WhatsAppModal onClose={() => setShowWA(false)} onToast={showToast} />}

      <Toast message={toast} />
    </div>
  );
}
