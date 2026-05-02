// ── WaterFlow Mock Database ──
// Replace with real API calls to your Node.js/Express backend

export const DB = {
  business: {
    id: 'biz001',
    name: 'AquaPure Station',
    phone: '+254711111111',
    mpesa: '174379',
  },
  owner: {
    id: 'own001',
    name: 'James Mwangi',
    phone: '+254711111111',
    pin: '0000',
  },
  employees: [
    { id: 'emp001', name: 'Faith Wanjiku',  pin: '1234', active: true, sales: 0, revenue: 0, liters: 0 },
    { id: 'emp002', name: 'Peter Kamau',    pin: '5678', active: true, sales: 0, revenue: 0, liters: 0 },
    { id: 'emp003', name: 'Grace Achieng',  pin: '9999', active: true, sales: 0, revenue: 0, liters: 0 },
  ],
  containers: [
    { id: 'c001', liters: 20,   price: 100, active: true },
    { id: 'c002', liters: 10,   price: 50,  active: true },
    { id: 'c003', liters: 5,    price: 25,  active: true },
    { id: 'c004', liters: 1,    price: 5,   active: true },
    { id: 'c005', liters: 18.9, price: 90,  active: true },
    { id: 'c006', liters: 50,   price: 200, active: true },
  ],
  transactions: [],
  nextTxnId: 1,
  weeklyData: [
    { day: 'Mon', liters: 340, revenue: 1700 },
    { day: 'Tue', liters: 420, revenue: 2100 },
    { day: 'Wed', liters: 380, revenue: 1900 },
    { day: 'Thu', liters: 510, revenue: 2550 },
    { day: 'Fri', liters: 460, revenue: 2300 },
    { day: 'Sat', liters: 620, revenue: 3100 },
    { day: 'Sun', liters: 290, revenue: 1450 },
  ],
};

// Seed initial transactions
const seedData = [
  { emp: 'emp001', container: 'c001', qty: 3,  payment: 'cash',  service: 'pickup' },
  { emp: 'emp002', container: 'c002', qty: 5,  payment: 'mpesa', service: 'delivery', mpesa: 'QBT5XYZABC' },
  { emp: 'emp001', container: 'c003', qty: 10, payment: 'mpesa', service: 'pickup',   mpesa: 'QCR1XYZDEF' },
  { emp: 'emp003', container: 'c004', qty: 20, payment: 'cash',  service: 'pickup' },
  { emp: 'emp002', container: 'c001', qty: 2,  payment: 'mpesa', service: 'delivery', mpesa: 'QPL7XYZGHI' },
  { emp: 'emp001', container: 'c006', qty: 1,  payment: 'cash',  service: 'pickup' },
];

seedData.forEach((t) => {
  const c = DB.containers.find((x) => x.id === t.container);
  const txn = {
    id: 'T' + String(DB.nextTxnId++).padStart(4, '0'),
    businessId: 'biz001',
    employeeId: t.emp,
    containerId: t.container,
    qty: t.qty,
    liters: Math.round(c.liters * t.qty),
    price: c.price * t.qty,
    payment: t.payment,
    service: t.service,
    mpesa: t.mpesa || null,
    time: new Date(Date.now() - Math.random() * 3 * 3600000),
  };
  DB.transactions.push(txn);
  const emp = DB.employees.find((e) => e.id === t.emp);
  if (emp) { emp.sales++; emp.revenue += txn.price; emp.liters += txn.liters; }
});

// ── Helper functions ──
export const fmt = (n) => (n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });
export const fmtKsh = (n) => 'KSh ' + fmt(n);
export const empName = (id) => DB.employees.find((e) => e.id === id)?.name || 'Unknown';
export const containerLabel = (id) => { const c = DB.containers.find((x) => x.id === id); return c ? `${c.liters}L` : ''; };
export const timeStr = (t) => new Date(t).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
export const today = () => DB.transactions.filter((t) => new Date(t.time).toDateString() === new Date().toDateString());
export const todayStats = () => {
  const txns = today();
  return {
    count:    txns.length,
    revenue:  txns.reduce((a, t) => a + t.price, 0),
    liters:   txns.reduce((a, t) => a + t.liters, 0),
    cash:     txns.filter((t) => t.payment === 'cash').reduce((a, t) => a + t.price, 0),
    mpesa:    txns.filter((t) => t.payment === 'mpesa').reduce((a, t) => a + t.price, 0),
    pickup:   txns.filter((t) => t.service === 'pickup').length,
    delivery: txns.filter((t) => t.service === 'delivery').length,
  };
};
