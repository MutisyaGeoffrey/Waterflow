import React, { useState } from 'react';
import { DB, fmtKsh, containerLabel, timeStr } from '../data/db';
import SaleModal from '../components/SaleModal';
import Toast from '../components/Toast';

export default function EmployeeApp({ employee, onLogout }) {
  const [showSale, setShowSale] = useState(false);
  const [, forceUpdate] = useState(0);
  const [toast, setToast] = useState(null);

  const emp = DB.employees.find((e) => e.id === employee.id);
  const myTxns = DB.transactions.filter((t) => t.employeeId === emp.id).sort((a, b) => new Date(b.time) - new Date(a.time));

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const handleSave = ({ containerId, qty, payment, service, mpesa }) => {
    const c = DB.containers.find((x) => x.id === containerId);
    const txn = {
      id: 'T' + String(DB.nextTxnId++).padStart(4, '0'),
      businessId: 'biz001', employeeId: emp.id, containerId, qty,
      liters: Math.round(c.liters * qty), price: c.price * qty,
      payment, service, mpesa, time: new Date(),
    };
    DB.transactions.push(txn);
    emp.sales++; emp.revenue += txn.price; emp.liters += txn.liters;
    setShowSale(false); forceUpdate((n) => n + 1);
    showToast(`Recorded: ${fmtKsh(txn.price)} · ${txn.liters}L`);
  };

  return (
    <div className="emp-app">
      <div className="emp-header">
        <div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 2 }}>Signed in as</div>
          <h2>{emp.name}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="sync-dot" />
          <span className="text-sm text-muted">Online</span>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="emp-body">
        <div className="emp-today">
          <div className="stat"><div className="val">{emp.sales}</div><div className="lbl">Sales Today</div></div>
          <div className="stat"><div className="val">{emp.liters}L</div><div className="lbl">Liters</div></div>
          <div className="stat"><div className="val" style={{ fontSize: 16, fontFamily: 'var(--mono)' }}>{fmtKsh(emp.revenue)}</div><div className="lbl">Revenue</div></div>
        </div>

        <div className="recent-title">Recent Sales</div>

        {myTxns.length ? myTxns.slice(0, 15).map((t) => (
          <div className="txn-item" key={t.id}>
            <div className="txn-left">
              <div className="txn-name">{containerLabel(t.containerId)} × {t.qty} — {t.liters}L</div>
              <div className="txn-meta">
                {timeStr(t.time)} · <span className={`tag tag-${t.service}`} style={{ padding: '1px 6px' }}>{t.service}</span>
                {t.mpesa && ` · Ref: ${t.mpesa}`}
              </div>
            </div>
            <div className="txn-right">
              <div className="amount">{fmtKsh(t.price)}</div>
              <div className="method"><span className={`tag tag-${t.payment}`} style={{ padding: '1px 6px' }}>{t.payment === 'mpesa' ? 'M-Pesa' : 'Cash'}</span></div>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <div className="icon">💧</div>
            <div>No sales yet today</div>
            <div className="text-xs mt-2">Tap + to record your first sale</div>
          </div>
        )}
      </div>

      <button className="fab" onClick={() => setShowSale(true)}>+</button>

      {showSale && (
        <SaleModal
          defaultEmployee={emp.id}
          onClose={() => setShowSale(false)}
          onSave={handleSave}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
