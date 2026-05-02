import React, { useState, useEffect } from 'react';
import { API_URL } from '../api';
import './TransactionHistory.css';

const TransactionHistory = ({ businessId, isOpen, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: '',
    serviceType: ''
  });
  
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen && businessId) {
      fetchEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, businessId]);

  useEffect(() => {
    if (isOpen && businessId) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, businessId, filters, selectedEmployee, pagination.page]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees/${businessId}`);
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', 20);
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.serviceType) params.append('serviceType', filters.serviceType);
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      
      const response = await fetch(`${API_URL}/transactions/history/${businessId}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data.transactions);
        setPagination({
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages,
          total: data.data.pagination.total
        });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      paymentMethod: '',
      serviceType: ''
    });
    setSelectedEmployee('');
    setPagination({ ...pagination, page: 1 });
  };

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE') + ' ' + date.toLocaleTimeString('en-KE');
  };

  const handleExport = async (type) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.serviceType) params.append('serviceType', filters.serviceType);
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      
      let url;
      if (type === 'csv') {
        url = `${API_URL}/export/csv/${businessId}?${params}`;
      } else if (type === 'pdf') {
        url = `${API_URL}/export/pdf/${businessId}?${params}`;
      } else {
        url = `${API_URL}/export/daily-summary/${businessId}`;
      }
      
      window.open(url, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export report');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content transaction-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>📜 Transaction History</h3>
        
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? '− Hide Filters' : '🔍 Show Filters'}
        </button>
        
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Service Type</label>
                <select
                  value={filters.serviceType}
                  onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
            </div>
            
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        )}
        
        <div className="history-stats">
          <div className="stat-card">
            <span>Total Transactions</span>
            <strong>{pagination.total}</strong>
          </div>
        </div>
        
        <div className="export-buttons">
          <button className="export-btn csv-btn" onClick={() => handleExport('csv')}>
            📊 Export CSV
          </button>
          <button className="export-btn pdf-btn" onClick={() => handleExport('pdf')}>
            📄 Export PDF
          </button>
          <button className="export-btn daily-btn" onClick={() => handleExport('daily')}>
            📋 Daily Summary PDF
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="no-data">No transactions found</div>
        ) : (
          <>
            <div className="transactions-table">
              <div className="table-header">
                <span>Date & Time</span>
                <span>Employee</span>
                <span>Size</span>
                <span>Qty</span>
                <span>Liters</span>
                <span>Amount</span>
                <span>Payment</span>
                <span>Type</span>
              </div>
              {transactions.map(transaction => (
                <div key={transaction.id} className="table-row">
                  <span className="date-cell" data-label="Date & Time">{formatDate(transaction.date)}</span>
                  <span data-label="Employee">{transaction.employeeName}</span>
                  <span data-label="Size">{transaction.containerSize}L</span>
                  <span data-label="Qty">{transaction.quantity}</span>
                  <span data-label="Liters">{transaction.totalLiters}L</span>
                  <span className="amount-cell" data-label="Amount">KES {transaction.totalPrice}</span>
                  <span className={`payment-badge ${transaction.paymentMethod}`} data-label="Payment">
                    {transaction.paymentMethod === 'cash' ? '💵 Cash' : '📱 M-Pesa'}
                  </span>
                  <span className={`service-badge ${transaction.serviceType}`} data-label="Type">
                    {transaction.serviceType === 'pickup' ? '🚚 Pickup' : '🚛 Delivery'}
                  </span>
                </div>
              ))}
            </div>
            
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}>
                  ← Previous
                </button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;