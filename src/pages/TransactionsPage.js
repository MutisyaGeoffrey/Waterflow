import React, { useState } from 'react';
import { DB, fmtKsh, empName, containerLabel, timeStr } from '../data/db';

export default function TransactionsPage({ onToast }) {
  const [filter, setFilter] = useState({ payment: 'all', service: 'all', employee: 'all' });

  const txns = [...DB.transactions]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .filter((t) => {
      if (filter.payment !== 'all' && t.payment !== filter.payment) return false;
      if (filter.service !== 'all' && t.service !== filter.service) return false;
      if (filter.employee !== 'all' && t.employeeId !== filter.employee) return false;
      return true;
    });

  const selStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '7px 12px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, outline: 'none',
  };

  return (
    <>
      <div className="card section-gap">
        <div className="card-title">Filter Transactions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select style={selStyle} value={filter.payment} onChange={(e) => setFilter({ ...filter, payment: e.target.value })}>
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="mpesa">M-Pesa</option>
          </select>
          <select style={selStyle} value={filter.service} onChange={(e) => setFilter({ ...filter, service: e.target.value })}>
            <option value="all">All Service</option>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
          <select style={selStyle} value={filter.employee} onChange={(e) => setFilter({ ...filter, employee: e.target.value })}>
            <option value="all">All Employees</option>
            {DB.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => onToast('CSV download started')}>↓ CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onToast('PDF generation started')}>↓ PDF</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Time</th><th>Employee</th><th>Container</th>
              <th>Qty</th><th>Liters</th><th>Payment</th><th>Service</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {txns.length ? txns.map((t) => (
              <tr key={t.id}>
                <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{t.id}</span></td>
                <td className="text-sm text-muted">{timeStr(t.time)}</td>
                <td className="font-bold">{empName(t.employeeId)}</td>
                <td>{containerLabel(t.containerId)}</td>
                <td><span style={{ fontFamily: 'var(--mono)' }}>{t.qty}</span></td>
                <td><span style={{ fontFamily: 'var(--mono)' }}>{t.liters}L</span></td>
                <td><span className={`tag tag-${t.payment}`}>{t.payment === 'mpesa' ? 'M-Pesa' : 'Cash'}</span></td>
                <td><span className={`tag tag-${t.service}`}>{t.service}</span></td>
                <td style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--green)' }}>{fmtKsh(t.price)}</td>
              </tr>
            )) : (
              <tr><td colSpan="9">
                <div className="empty-state">
                  <div className="icon">🔍</div>
                  <div>No transactions match the current filters</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, color: 'var(--text2)', fontSize: 12, textAlign: 'right' }}>
        {txns.length} transactions · Total: {fmtKsh(txns.reduce((a, t) => a + t.price, 0))}
      </div>
    </>
  );
}
