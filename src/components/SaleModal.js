import React, { useState } from 'react';
import { DB, fmt, fmtKsh } from '../data/db';

export default function SaleModal({ onClose, onSave, defaultEmployee }) {
  const [container, setContainer] = useState(null);
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState('cash');
  const [service, setService] = useState('pickup');
  const [mpesa, setMpesa] = useState('');
  const [empId, setEmpId] = useState(defaultEmployee || DB.employees[0]?.id);

  const activeCont = DB.containers.filter((c) => c.active);
  const selectedCont = container ? DB.containers.find((c) => c.id === container) : null;
  const total = selectedCont ? selectedCont.price * qty : 0;
  const totalLiters = selectedCont ? Math.round(selectedCont.liters * qty) : 0;

  const handleSave = () => {
    if (!container) return;
    onSave({ containerId: container, qty, payment, service, mpesa: payment === 'mpesa' ? mpesa : null, employeeId: empId });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Record New Sale</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">

          {/* Container selection */}
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.8px', fontWeight: 600 }}>Select Container</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.2rem' }}>
            {activeCont.map((c) => (
              <div key={c.id}
                onClick={() => setContainer(c.id)}
                style={{
                  padding: '1rem', background: 'var(--surface2)',
                  border: `2px solid ${container === c.id ? 'var(--blue)' : 'var(--border)'}`,
                  borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                  background: container === c.id ? 'rgba(59,130,246,.1)' : 'var(--surface2)',
                  transition: 'all .2s',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>{c.liters}L</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{fmtKsh(c.price)}</div>
              </div>
            ))}
          </div>

          {/* Quantity */}
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.8px', fontWeight: 600 }}>Quantity</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: '1.2rem' }}>
            <button onClick={() => qty > 1 && setQty(qty - 1)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', minWidth: 50, textAlign: 'center' }}>{qty}</div>
            <button onClick={() => setQty(qty + 1)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>

          {/* Payment */}
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.8px', fontWeight: 600 }}>Payment Method</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
            {[['cash', '💵 Cash'], ['mpesa', '📱 M-Pesa']].map(([val, label]) => (
              <div key={val} onClick={() => setPayment(val)}
                style={{ padding: 10, borderRadius: 10, border: `2px solid ${payment === val ? 'var(--teal)' : 'var(--border)'}`, background: payment === val ? 'rgba(15,184,160,.1)' : 'var(--surface2)', textAlign: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: payment === val ? 'var(--teal)' : 'var(--text2)', transition: 'all .2s' }}>
                {label}
              </div>
            ))}
          </div>

          {payment === 'mpesa' && (
            <div className="field">
              <label>M-Pesa Reference (optional)</label>
              <input type="text" value={mpesa} onChange={(e) => setMpesa(e.target.value)} placeholder="e.g. QBT5XYZABC" />
            </div>
          )}

          {/* Service Type */}
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.8px', fontWeight: 600 }}>Service Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.2rem' }}>
            {[['pickup', '🛒 Pickup'], ['delivery', '🚚 Delivery']].map(([val, label]) => (
              <div key={val} onClick={() => setService(val)}
                style={{ padding: 10, borderRadius: 10, border: `2px solid ${service === val ? 'var(--teal)' : 'var(--border)'}`, background: service === val ? 'rgba(15,184,160,.1)' : 'var(--surface2)', textAlign: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: service === val ? 'var(--teal)' : 'var(--text2)', transition: 'all .2s' }}>
                {label}
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ background: 'linear-gradient(135deg,rgba(59,130,246,.12),rgba(15,184,160,.08))', border: '1px solid rgba(59,130,246,.25)', borderRadius: 12, padding: '1rem', textAlign: 'center', marginBottom: '1.2rem' }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>{selectedCont ? fmtKsh(total) : '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{selectedCont ? `${qty} × ${selectedCont.liters}L = ${totalLiters}L` : 'Select a container above'}</div>
          </div>

          {/* Employee */}
          {!defaultEmployee && (
            <div className="field">
              <label>Recorded By</label>
              <select value={empId} onChange={(e) => setEmpId(e.target.value)}>
                {DB.employees.filter((e) => e.active).map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-teal" onClick={handleSave} disabled={!container}>Record Sale</button>
        </div>
      </div>
    </div>
  );
}
