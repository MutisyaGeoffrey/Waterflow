import React, { useState } from 'react';
import LampLogin from './components/LampLogin';
import SalesChart from './components/SalesChart';
import PaymentPieChart from './components/PaymentPieChart';
import EmployeeLeaderboard from './components/EmployeeLeaderboard';
import WhatsAppModal from './components/WhatsAppModal';
import ContainerManager from './components/ContainerManager';
import EmployeeManager from './components/EmployeeManager';
import TransactionHistory from './components/TransactionHistory';
import { API_URL } from './api';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessId, setBusinessId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false); 
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  
  const handleLogin = async (phone, pin) => {
    console.log('Attempting login with:', { phone, pin });
    
    try {
      const response = await fetch(`${API_URL}/owners/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pinCode: pin })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setOwnerName(data.data.owner.name);
        setBusinessId(data.data.owner.business.id);
        localStorage.setItem('token', data.data.token);
      } else {
        // Try to get debug info to help user
        const debugResponse = await fetch(`${API_URL}/debug/business`);
        if (debugResponse.ok) {
          const debugData = await debugResponse.json();
          setDebugInfo(debugData);
        }
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  if (!isLoggedIn) {
    return (
      <div>
        <LampLogin onLogin={handleLogin} />
        {debugInfo && (
          <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            right: '10px',
            background: '#fee2e2',
            color: '#991b1b',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            maxHeight: '200px',
            overflow: 'auto',
            zIndex: 1000
          }}>
            <strong>Debug Info - No owner found with those credentials</strong>
            <pre style={{ fontSize: '10px', marginTop: '5px' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <p>Try using one of these phone numbers from the owners table above</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>💧 WaterFlow</h1>
        <div>
          <span>Welcome, {ownerName}!</span>
          <button onClick={() => setIsLoggedIn(false)}>Logout</button>
        </div>
      </div>
      
      <div className="business-info">
        <h2>Business ID: {businessId}</h2>
      </div>
      
      <div className="dashboard-grid">
        <div className="card">
          <h3>Today's Summary</h3>
          <DashboardSummary businessId={businessId} />
        </div>
        
        <div className="card card-wide">
          <SalesChart businessId={businessId} />
        </div>
        
        <div className="card">
          <PaymentPieChart businessId={businessId} />
        </div>
        
        <div className="card card-wide">
          <EmployeeLeaderboard businessId={businessId} />
        </div>
        
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button onClick={() => setIsWhatsAppModalOpen(true)}>📤 WhatsApp Report</button>
            <button onClick={() => setIsTransactionHistoryOpen(true)}>📊 View Full Reports</button>
            <button onClick={() => setIsContainerModalOpen(true)}>📦 Manage Containers</button>
            <button onClick={() => setIsEmployeeModalOpen(true)}>👥 Employee Management</button>
          </div>
        </div>
      </div>
      
      {/* WhatsApp Modal Component */}
      <WhatsAppModal 
        businessId={businessId}
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
      
      {/* Container Manager Modal Component */}
      <ContainerManager 
        businessId={businessId}
        isOpen={isContainerModalOpen}
        onClose={() => setIsContainerModalOpen(false)}
      />
      
      {/* Employee Manager Modal Component */}
      <EmployeeManager 
        businessId={businessId}
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
      />
      
      {/* Transaction History Modal Component */}
      <TransactionHistory 
        businessId={businessId}
        isOpen={isTransactionHistoryOpen}
        onClose={() => setIsTransactionHistoryOpen(false)}
      />
    </div>
  );
}

// Dashboard Summary Component
function DashboardSummary({ businessId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const fetchSummary = async () => {
      try {
        console.log('Fetching summary for business:', businessId);
        const response = await fetch(`${API_URL}/transactions/today/${businessId}`);
        const data = await response.json();
        console.log('Summary response:', data);
        
        if (data.success) {
          setSummary(data.data.summary);
        } else {
          setError(data.error);
        }
      } catch (error) {
        console.error('Failed to fetch summary:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchSummary();
      const interval = setInterval(fetchSummary, 30000);
      return () => clearInterval(interval);
    }
  }, [businessId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!summary) return <div className="no-data">No transactions today</div>;

  return (
    <div className="summary-stats">
      <div className="stat">
        <span className="stat-label">Total Liters</span>
        <span className="stat-value">{summary.totalLiters}L</span>
      </div>
      <div className="stat">
        <span className="stat-label">Revenue</span>
        <span className="stat-value">KES {summary.totalRevenue}</span>
      </div>
      <div className="stat-row">
        <div className="stat-small">
          <span>Cash</span>
          <strong>KES {summary.cashTotal}</strong>
        </div>
        <div className="stat-small">
          <span>M-Pesa</span>
          <strong>KES {summary.mpesaTotal}</strong>
        </div>
      </div>
      <div className="stat-row">
        <div className="stat-small">
          <span>Pickups</span>
          <strong>{summary.pickupCount}</strong>
        </div>
        <div className="stat-small">
          <span>Deliveries</span>
          <strong>{summary.deliveryCount}</strong>
        </div>
      </div>
      <div className="stat">
        <span className="stat-label">Transactions</span>
        <span className="stat-value">{summary.transactionCount}</span>
      </div>
    </div>
  );
}

export default App;