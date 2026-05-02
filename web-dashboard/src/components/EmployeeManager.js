import React, { useState, useEffect } from 'react';
import { API_URL } from '../api';
import './EmployeeManager.css';

const EmployeeManager = ({ businessId, isOpen, onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [resettingPinId, setResettingPinId] = useState(null);
  const [resetPinValue, setResetPinValue] = useState('');

  useEffect(() => {
    if (isOpen && businessId) {
      fetchEmployees();
    }
  }, [isOpen, businessId]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/employees/${businessId}`);
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newName || !newPin) {
      setError('Please enter name and PIN');
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/employees/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          name: newName,
          pinCode: newPin
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        setNewName('');
        setNewPin('');
        setShowAddForm(false);
        fetchEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (id) => {
    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        fetchEmployees();
        setEditingId(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to update employee');
    }
  };

  const handleResetPin = async (id) => {
    if (!/^\d{4}$/.test(resetPinValue)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/employees/${id}/reset-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin: resetPinValue })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        fetchEmployees();
        setResettingPinId(null);
        setResetPinValue('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to reset PIN');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        fetchEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Deactivate this employee? They will no longer be able to log in.')) return;

    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        fetchEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to deactivate employee');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content employee-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>👥 Employee Management</h3>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button 
          className="add-employee-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '− Cancel' : '+ Add New Employee'}
        </button>

        {showAddForm && (
          <form className="add-employee-form" onSubmit={handleAddEmployee}>
            <div className="form-row">
              <div className="form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>PIN (4 digits)</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="1234"
                  maxLength="4"
                  pattern="\d{4}"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Add Employee</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : employees.length === 0 ? (
          <div className="no-data">No employees found. Add your first employee!</div>
        ) : (
          <div className="employees-list">
            <div className="list-header">
              <span>Name</span>
              <span>PIN</span>
              <span>Today's Sales</span>
              <span>Total Sales</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {employees.map(employee => (
              <div key={employee.id} className={`list-item ${!employee.isActive ? 'inactive' : ''}`}>
                <div className="employee-name">
                  {editingId === employee.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="name-input"
                      autoFocus
                    />
                  ) : (
                    <strong>{employee.name}</strong>
                  )}
                </div>
                
                <div className="employee-pin">
                  {resettingPinId === employee.id ? (
                    <div className="pin-reset-input">
                      <input
                        type="password"
                        value={resetPinValue}
                        onChange={(e) => setResetPinValue(e.target.value)}
                        placeholder="New 4-digit PIN"
                        maxLength="4"
                        className="pin-input"
                      />
                      <button 
                        className="action-btn save-small"
                        onClick={() => handleResetPin(employee.id)}
                      >
                        Save
                      </button>
                      <button 
                        className="action-btn cancel-small"
                        onClick={() => {
                          setResettingPinId(null);
                          setResetPinValue('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="pin-display">••••</span>
                  )}
                </div>
                
                <div className="employee-today">
                  <span className="sales-badge">{employee.todaySales} sales</span>
                </div>
                
                <div className="employee-total">
                  <span>{employee.totalSales} total</span>
                </div>
                
                <div className="employee-status">
                  <span className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="employee-actions">
                  {editingId === employee.id ? (
                    <>
                      <button 
                        className="action-btn save"
                        onClick={() => handleUpdateEmployee(employee.id)}
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
                          setEditingId(employee.id);
                          setEditName(employee.name);
                        }}
                        disabled={!employee.isActive}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="action-btn reset-pin"
                        onClick={() => {
                          setResettingPinId(employee.id);
                          setResetPinValue('');
                        }}
                        disabled={!employee.isActive}
                      >
                        🔑 Reset PIN
                      </button>
                      <button 
                        className={`action-btn ${employee.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleActive(employee.id, employee.isActive)}
                      >
                        {employee.isActive ? '🔘 Deactivate' : '🟢 Activate'}
                      </button>
                      {employee.isActive && (
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteEmployee(employee.id)}
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

export default EmployeeManager;