import React, { useState } from 'react';
import { DB, fmt, fmtKsh, todayStats } from '../data/db';

function buildWhatsAppText(s) {
  const top = [...DB.employees].sort((a, b) => b.revenue - a.revenue)[0]?.name || '—';
  return `*${DB.business.name} – Daily Report*
📅 ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

💰 Revenue: KSh ${fmt(s.revenue)}
💧 Liters Sold: ${fmt(s.liters)}L
🧾 Transactions: ${s.count}

💵 Cash: KSh ${fmt(s.cash)}
📱 M-Pesa: KSh ${fmt(s.mpesa)}

🛒 Pickups: ${s.pickup}
🚚 Deliveries: ${s.delivery}

👤 Top Staff: ${top}

_Sent via WaterFlow_`;
}

export function WhatsAppModal({ onClose, onToast }) {
  const [phone, setPhone] = useState('');
  const s = todayStats();

  const handleSend = () => {
    if (!phone) { onToast('Enter a phone number'); return; }
    const msg = encodeURIComponent(buildWhatsAppText(s));
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`;
    window.open(url, '_blank');
    onToast('Opening WhatsApp…');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📱 WhatsApp Report</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Send To (phone number)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" />
          </div>
          <div className="whatsapp-preview">{buildWhatsAppText(s)}</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSend}>Send via WhatsApp</button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage({ onToast, onWhatsApp }) {
  const s = todayStats();
  const allTxns = DB.transactions;
  const totalRev = allTxns.reduce((a, t) => a + t.price, 0);

  return (
    <>
      <div className="grid-3 section-gap">
        {[
          ['📊', fmtKsh(totalRev), 'Total Revenue', 'rgba(59,130,246,.15)'],
          ['💧', `${allTxns.reduce((a, t) => a + t.liters, 0)}L`, 'Total Liters', 'rgba(15,184,160,.15)'],
          ['🧾', allTxns.length, 'Total Transactions', 'rgba(34,197,94,.15)'],
        ].map(([icon, val, label, bg]) => (
          <div className="metric-card" key={label}>
            <div className="metric-icon" style={{ background: bg }}>{icon}</div>
            <div className="metric-value">{val}</div>
            <div className="metric-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 section-gap">
        <div className="card">
          <div className="card-title">Export Data</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['CSV Export', 'Full transaction history', '↓ Download CSV', 'btn-ghost', () => onToast('CSV download started')],
              ['PDF Summary', 'Daily summary report', '↓ Download PDF', 'btn-ghost', () => onToast('PDF generation started')],
              ['WhatsApp Report', 'Share via WhatsApp', '📱 Send Report', 'btn-success', onWhatsApp],
            ].map(([title, desc, btnLabel, btnCls, handler]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, background: 'var(--surface2)', borderRadius: 10 }}>
                <div>
                  <div className="font-bold text-sm">{title}</div>
                  <div className="text-xs text-muted mt-1">{desc}</div>
                </div>
                <button className={`btn ${btnCls} btn-sm`} onClick={handler}>{btnLabel}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Today's WhatsApp Preview</div>
          <div className="whatsapp-preview">{buildWhatsAppText(s)}</div>
        </div>
      </div>
    </>
  );
}
