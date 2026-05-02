import React, { useState, useRef } from 'react';
import { DB, fmtKsh } from '../data/db';

export default function EmployeesPage({ onToast, refresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleToggle = (emp) => {
    emp.active = !emp.active;
    onToast(`${emp.name} ${emp.active ? 'activated' : 'deactivated'}`);
    refresh();
  };

  const handleAdd = () => {
    const p = pin.join('');
    if (!name || p.length !== 4) { onToast('Please fill in all fields'); return; }
    DB.employees.push({ id: 'emp' + Date.now(), name, pin: p, active: true, sales: 0, revenue: 0, liters: 0 });
    setName(''); setPin(['', '', '', '']); setShowAdd(false);
    onToast(`${name} added successfully`); refresh();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span className="text-muted text-sm">{DB.employees.filter((e) => e.active).length} active employees</span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Employee</button>
      </div>

      <div className="grid-3">
        {DB.employees.map((e) => (
          <div className="card" key={e.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
              <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{e.name.split(' ').map((n) => n[0]).join('')}</div>
              <div>
                <div className="font-bold">{e.name}</div>
                <div className="text-xs text-muted">ID: {e.id}</div>
              </div>
              <span className={`badge ${e.active ? 'badge-green' : 'badge-red'}`} style={{ marginLeft: 'auto' }}>{e.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '1rem', textAlign: 'center' }}>
              {[['Sales', e.sales], ['Liters', e.liters], ['Revenue', fmtKsh(e.revenue)]].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: label === 'Revenue' ? 13 : 16 }}>{val}</div>
                  <div className="text-xs text-muted">{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onToast('PIN reset sent to owner')}>Reset PIN</button>
              <button className={`btn btn-sm ${e.active ? 'btn-danger' : 'btn-success'}`} style={{ flex: 1 }} onClick={() => handleToggle(e)}>
                {e.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={(ev) => ev.target.className === 'modal-overlay' && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add Employee</div>
              <button className="close-btn" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mary Auma" />
              </div>
              <div className="field">
                <label>4-Digit PIN</label>
                <div className="pin-row">
                  {[0, 1, 2, 3].map((i) => (
                    <input key={i} ref={pinRefs[i]} className="pin-box" type="password" maxLength={1} inputMode="numeric" value={pin[i]}
                      onChange={(e) => { const n = [...pin]; n[i] = e.target.value; setPin(n); if (e.target.value && i < 3) pinRefs[i + 1].current?.focus(); }}
                      onKeyDown={(e) => e.key === 'Backspace' && !pin[i] && i > 0 && pinRefs[i - 1].current?.focus()}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Employee</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
