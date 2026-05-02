import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { API_URL } from '../api';

const PaymentPieChart = ({ businessId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions/today/${businessId}`);
        const result = await response.json();
        
        if (result.success) {
          const summary = result.data.summary;
          const chartData = [
            { name: 'Cash', value: summary.cashTotal, color: '#10b981' },
            { name: 'M-Pesa', value: summary.mpesaTotal, color: '#3b82f6' }
          ];
          setData(chartData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch payment data:', error);
        setLoading(false);
      }
    };

    fetchPaymentData();
    const interval = setInterval(fetchPaymentData, 30000);
    return () => clearInterval(interval);
  }, [businessId]);

  if (loading) return <div className="chart-loading">Loading...</div>;
  if (data.length === 0 || (data[0].value === 0 && data[1].value === 0)) {
    return <div className="no-data">No transactions today</div>;
  }

  const COLORS = ['#10b981', '#3b82f6'];

  return (
    <div className="payment-chart">
      <h4>Payment Method Breakdown</h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `KES ${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentPieChart;