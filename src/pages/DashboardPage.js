import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { DB, fmt, fmtKsh, todayStats, empName } from '../data/db';

Chart.register(...registerables);

export default function DashboardPage({ onNewSale, onWhatsApp }) {
  const weeklyRef = useRef(null);
  const payRef    = useRef(null);
  const weeklyChart = useRef(null);
  const payChart    = useRef(null);

  const s = todayStats();
  const allRev = DB.transactions.reduce((a, t) => a + t.price, 0);
  const sorted = [...DB.employees].filter((e) => e.active).sort((a, b) => b.revenue - a.revenue);
  const maxRev = sorted[0]?.revenue || 1;

  useEffect(() => {
    // Weekly chart
    if (weeklyRef.current) {
      if (weeklyChart.current) weeklyChart.current.destroy();
      weeklyChart.current = new Chart(weeklyRef.current, {
        type: 'line',
        data: {
          labels: DB.weeklyData.map((d) => d.day),
          datasets: [
            { label: 'Liters', data: DB.weeklyData.map((d) => d.liters), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.1)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#3b82f6', yAxisID: 'y' },
            { label: 'Revenue', data: DB.weeklyData.map((d) => d.revenue), borderColor: '#0fb8a0', backgroundColor: 'rgba(15,184,160,.08)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#0fb8a0', borderDash: [5, 3], yAxisID: 'y1' },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#8fa3c0', font: { size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#8fa3c0', font: { size: 11 } }, position: 'left' },
            y1: { grid: { display: false }, ticks: { color: '#0fb8a0', font: { size: 11 } }, position: 'right' },
          },
        },
      });
    }

    // Pie chart
    if (payRef.current) {
      if (payChart.current) payChart.current.destroy();
      payChart.current = new Chart(payRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Cash', 'M-Pesa'],
          datasets: [{ data: [s.cash || 1, s.mpesa || 1], backgroundColor: ['#22c55e', '#0fb8a0'], borderColor: '#111827', borderWidth: 3, hoverOffset: 6 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.label}: KSh ${c.raw.toLocaleString()}` } } },
        },
      });
    }

    return () => {
      if (weeklyChart.current) weeklyChart.current.destroy();
      if (payChart.current) payChart.current.destroy();
    };
  }, []);

  const quickStats = [
    ['🛒', 'Pickups', s.pickup, 'var(--purple)'],
    ['🚚', 'Deliveries', s.delivery, 'var(--amber)'],
    ['💵', 'Cash Sales', DB.transactions.filter((t) => t.payment === 'cash').length, 'var(--green)'],
    ['📱', 'M-Pesa', DB.transactions.filter((t) => t.payment === 'mpesa').length, 'var(--teal)'],
  ];

  return (
    <>
      {/* KPI row */}
      <div className="grid-4 section-gap">
        {[
          ['💰', fmtKsh(s.revenue), "Today's Revenue", '↑ vs yesterday', 'up', 'rgba(59,130,246,.15)'],
          ['💧', `${fmt(s.liters)}L`, 'Liters Sold Today', '↑ 12% vs avg', 'up', 'rgba(15,184,160,.15)'],
          ['🧾', s.count, 'Transactions Today', '↑ 3 since morning', 'up', 'rgba(34,197,94,.15)'],
          ['📦', `${(allRev / 1000).toFixed(1)}K`, 'Total Revenue (KSh)', 'All time', '', 'rgba(139,92,246,.15)'],
        ].map(([icon, val, label, change, dir, bg]) => (
          <div className="metric-card" key={label}>
            <div className="metric-icon" style={{ background: bg }}>{icon}</div>
            <div className="metric-value">{val}</div>
            <div className="metric-label">{label}</div>
            <div className={`metric-change ${dir}`}>{change}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2 section-gap">
        <div className="card">
          <div className="card-title">Weekly Sales Trend <span className="badge badge-blue">7 days</span></div>
          <div className="chart-container">
            <canvas ref={weeklyRef} role="img" aria-label="Weekly liters and revenue line chart">Weekly sales data</canvas>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[['#3b82f6', 'Liters'], ['#0fb8a0', 'Revenue (KSh)']].map(([color, label]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Payment Breakdown <span className="badge badge-teal">Today</span></div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="chart-container-sm" style={{ flex: 1 }}>
              <canvas ref={payRef} role="img" aria-label="Cash vs M-Pesa doughnut chart">Payment method breakdown</canvas>
            </div>
            <div>
              {[['#22c55e', 'Cash', s.cash], ['#0fb8a0', 'M-Pesa', s.mpesa]].map(([color, label, val]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                    <span className="text-sm text-muted">{label}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 15 }}>{fmtKsh(val)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard + Quick Stats */}
      <div className="grid-2 section-gap">
        <div className="card">
          <div className="card-title">Employee Leaderboard <span className="badge badge-amber">Today</span></div>
          {sorted.map((e, i) => (
            <div className="lb-row" key={e.id}>
              <div className={`lb-rank ${['rank-1','rank-2','rank-3'][i] || 'rank-n'}`}>{i + 1}</div>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{e.name.split(' ').map((n) => n[0]).join('')}</div>
              <div style={{ flex: 1 }}>
                <div className="text-sm font-bold">{e.name}</div>
                <div className="text-xs text-muted">{e.sales} sales · {e.liters}L</div>
              </div>
              <div className="lb-bar"><div className="lb-fill" style={{ width: `${Math.round(e.revenue / maxRev * 100)}%` }} /></div>
              <div style={{ minWidth: 80, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{fmtKsh(e.revenue)}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Quick Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {quickStats.map(([icon, label, val, color]) => (
              <div key={label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '.9rem', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)' }}>{val}</div>
                <div className="text-xs text-muted mt-1">{label}</div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-sm text-muted">WhatsApp Report</span>
            <button className="btn btn-success btn-sm" onClick={onWhatsApp}>Send Report</button>
          </div>
        </div>
      </div>
    </>
  );
}
