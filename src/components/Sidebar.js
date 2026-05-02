import React from 'react';
import { DB } from '../data/db';
import '../styles/layout.css';

const NAV_ITEMS = [
  { id: 'dashboard',    icon: '⬛', label: 'Dashboard' },
  { id: 'transactions', icon: '🗒',  label: 'Transactions' },
  { id: 'employees',    icon: '👤', label: 'Employees' },
  { id: 'containers',   icon: '🪣', label: 'Containers' },
  { id: 'reports',      icon: '📊', label: 'Reports' },
];

export default function Sidebar({ activeNav, onNav, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">💧</div>
        <div className="logo-text">Water<span>Flow</span></div>
      </div>
      <nav className="nav">
        <div className="nav-section">Menu</div>
        {NAV_ITEMS.map((n) => (
          <div
            key={n.id}
            className={`nav-item ${activeNav === n.id ? 'active' : ''}`}
            onClick={() => onNav(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">JM</div>
          <div className="user-info">
            <div className="name">{DB.owner.name}</div>
            <div className="role">Owner</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
