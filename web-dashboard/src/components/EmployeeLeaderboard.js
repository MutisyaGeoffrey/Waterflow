import React, { useState, useEffect } from 'react';
import { API_URL } from '../api';

const EmployeeLeaderboard = ({ businessId }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeePerformance = async () => {
      try {
        const response = await fetch(`${API_URL}/reports/employees/${businessId}`);
        const data = await response.json();
        
        if (data.success) {
          setEmployees(data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setLoading(false);
      }
    };

    if (businessId) {
      fetchEmployeePerformance();
      const interval = setInterval(fetchEmployeePerformance, 60000);
      return () => clearInterval(interval);
    }
  }, [businessId]);

  if (loading) return <div className="loading">Loading leaderboard...</div>;
  if (employees.length === 0) return <div className="no-data">No employees found</div>;

  return (
    <div className="employee-leaderboard">
      <h4>🏆 Employee Performance Today</h4>
      <div className="leaderboard-list">
        {employees.map((emp, index) => (
          <div key={emp.id} className={`leaderboard-item ${index === 0 && emp.todaySales > 0 ? 'top-performer' : ''}`}>
            <div className="rank">
              {index === 0 && emp.todaySales > 0 && '🥇'}
              {index === 1 && emp.todaySales > 0 && '🥈'}
              {index === 2 && emp.todaySales > 0 && '🥉'}
              {index > 2 && emp.todaySales > 0 && `#${index + 1}`}
              {emp.todaySales === 0 && '📭'}
            </div>
            <div className="employee-info">
              <strong>{emp.name}</strong>
              <span className="employee-pin">PIN: {emp.pinCode}</span>
            </div>
            <div className="employee-stats">
              <div className="stat-badge">
                <span>💧 {emp.todaySales} sales</span>
                <span>💰 KES {emp.revenue}</span>
                <span>📦 {emp.liters}L</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {employees.every(e => e.todaySales === 0) && (
        <div className="no-data" style={{ textAlign: 'center', marginTop: '16px' }}>
          No sales recorded today
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaderboard;