import React, { useState } from 'react';
import { DB, fmtKsh } from '../data/db';

export default function ContainersPage({ onToast, refresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newLiters, setNewLiters] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const handleToggle = (c) => {
    c.active = !c.active;
    onToast(`Container ${c.liters}L ${c.active ? 'activated' : 'deactivated'}`);
    refresh();
  };

  const handleAdd = () => {
    if (!newLiters || !newPrice) { onToast('Please fill in all fields'); return; }
    DB.containers.push({ id: 'c' + Date.now(), liters: parseFloat(newLiters), price: parseFloat(newPrice), active: true });
    setNewLiters(''); setNewPrice(''); setShowAdd(false);
    onToast('Container added'); refresh();
  };

  const handleEdit = () => {
    const price = parseFloat(editPrice);
    if (!price) { onToast('Enter a valid price'); return; }
    const c = DB.containers.find((x) => x.id === editId);
    if (c) c.price = price;
    setEditId(null); onToast('Price updated'); refresh();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span className="text-muted text-sm">{DB.containers.filter((c) => c.active).length} active container sizes</span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Container</button>
      </div>

      <div className="grid-3">
        {DB.containers.map((c) => (
          <div className="card" key={c.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.8rem' }}>
              <div style={{ background: 'rgba(59,130,246,.12)', borderRadius: 10, padding: '.6rem .9rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 22, color: 'var(--blue)' }}>{c.liters}L</div>
              </div>
              <span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>{c.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18, color: 'var(--green)', marginBottom: 4 }}>{fmtKsh(c.price)}</div>
            <div className="text-xs text-muted" style={{ marginBottom: '1rem' }}>KSh {(c.price / c.liters).toFixed(1)}/L · ID: {c.id}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setEditId(c.id); setEditPrice(c.price); }}>Edit Price</button>
              <button className={`btn btn-sm ${c.active ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(c)}>
                {c.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header"><div className="modal-title">Add Container Size</div><button className="close-btn" onClick={() => setShowAdd(false)}>×</button></div>
            <div className="modal-body">
              <div className="field"><label>Size (Liters)</label><input type="number" value={newLiters} onChange={(e) => setNewLiters(e.target.value)} placeholder="e.g. 20" /></div>
              <div className="field"><label>Price (KSh)</label><input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g. 100" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Container</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editId && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setEditId(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Edit Container – {DB.containers.find((c) => c.id === editId)?.liters}L</div>
              <button className="close-btn" onClick={() => setEditId(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="field"><label>New Price (KSh)</label><input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
