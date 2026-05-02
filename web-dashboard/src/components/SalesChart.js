import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../api';

const SalesChart = ({ businessId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const response = await fetch(`${API_URL}/reports/weekly/${businessId}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        setLoading(false);
      }
    };

    if (businessId) {
      fetchWeeklyData();
      const interval = setInterval(fetchWeeklyData, 60000);
      return () => clearInterval(interval);
    }
  }, [businessId]);

  if (loading) return <div className="chart-loading">Loading chart data...</div>;
  if (data.length === 0 || data.every(d => d.liters === 0)) {
    return (
      <div className="no-data">
        <p>No sales data this week</p>
        <small>Record some sales to see the trend!</small>
      </div>
    );
  }

  return (
    <div className="sales-chart">
      <h4>Weekly Sales Trend</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis yAxisId="left" label={{ value: 'Liters', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'KES', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="liters" 
            stroke="#3b82f6" 
            name="Liters Sold"
            strokeWidth={2}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            name="Revenue (KES)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="chart-stats">
        <span>Total This Week: {data.reduce((sum, d) => sum + d.liters, 0)}L</span>
        <span>Revenue: KES {data.reduce((sum, d) => sum + d.revenue, 0)}</span>
      </div>
    </div>
  );
};

export default SalesChart;