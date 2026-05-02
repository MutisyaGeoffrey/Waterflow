import React, { useState, useEffect } from 'react';
import { API_URL } from '../api';
import './ContainerManager.css';

const ContainerManager = ({ businessId, isOpen, onClose }) => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch containers when modal opens
  useEffect(() => {
    if (isOpen && businessId) {
      fetchContainers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, businessId]);

  const fetchContainers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/containers/${businessId}`);
      const data = await response.json();
      if (data.success) {
        setContainers(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch containers');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (id) => {
    try {
      const response = await fetch(`${API_URL}/containers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricePerLiter: parseFloat(editPrice) })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        fetchContainers();
        setEditingId(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to update price');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/containers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        fetchContainers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to update container');
    }
  };

  const handleAddContainer = async (e) => {
    e.preventDefault();
    if (!newSize || !newPrice) {
      setError('Please enter size and price');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/containers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          sizeLiters: parseInt(newSize),
          pricePerLiter: parseFloat(newPrice)
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        setNewSize('');
        setNewPrice('');
        setShowAddForm(false);
        fetchContainers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to add container');
    }
  };

  const handleDeleteContainer = async (id) => {
    if (!window.confirm('Deactivate this container size? It will no longer appear for employees.')) return;

    try {
      const response = await fetch(`${API_URL}/containers/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        fetchContainers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to deactivate container');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content container-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>📦 Container Management</h3>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button 
          className="add-container-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '− Cancel' : '+ Add New Container'}
        </button>

        {showAddForm && (
          <form className="add-container-form" onSubmit={handleAddContainer}>
            <div className="form-row">
              <div className="form-group">
                <label>Size (Liters)</label>
                <input
                  type="number"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="e.g., 15"
                  min="1"
                  step="1"
                />
              </div>
              <div className="form-group">
                <label>Price per Liter (KES)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g., 5"
                  min="0"
                  step="0.5"
                />
              </div>
              <button type="submit" className="submit-btn">Add</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loading">Loading containers...</div>
        ) : containers.length === 0 ? (
          <div className="no-data">No container sizes configured</div>
        ) : (
          <div className="containers-list">
            <div className="list-header">
              <span>Size</span>
              <span>Price/L</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {containers.map(container => (
              <div key={container.id} className={`list-item ${!container.isActive ? 'inactive' : ''}`}>
                <div className="item-size">
                  <strong>{container.sizeLiters}L</strong>
                  <span className="unit-price">KES {container.pricePerLiter}/L</span>
                </div>
                
                <div className="item-price">
                  {editingId === container.id ? (
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      step="0.5"
                      className="price-input"
                      autoFocus
                    />
                  ) : (
                    <span>KES {container.pricePerLiter}/L</span>
                  )}
                </div>
                
                <div className="item-status">
                  <span className={`status-badge ${container.isActive ? 'active' : 'inactive'}`}>
                    {container.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="item-actions">
                  {editingId === container.id ? (
                    <>
                      <button 
                        className="action-btn save"
                        onClick={() => handleUpdatePrice(container.id)}
                      >
                        💾 Save
                      </button>
                      <button 
                        className="action-btn cancel"
                        onClick={() => setEditingId(null)}
                      >
                        ✕ Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="action-btn edit"
                        onClick={() => {
                          setEditingId(container.id);
                          setEditPrice(container.pricePerLiter.toString());
                        }}
                        disabled={!container.isActive}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className={`action-btn ${container.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleActive(container.id, container.isActive)}
                      >
                        {container.isActive ? '🔘 Deactivate' : '🟢 Activate'}
                      </button>
                      {container.isActive && (
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteContainer(container.id)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContainerManager;