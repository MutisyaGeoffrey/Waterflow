import React, { useState } from 'react';
import { API_URL } from '../api';
import './WhatsAppModal.css';

const WhatsAppModal = ({ businessId, isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [summary, setSummary] = useState(null);

  const handleGenerate = async () => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/reports/whatsapp/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWhatsappUrl(data.data.whatsappUrl);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>📤 Send WhatsApp Report</h3>
        
        {!whatsappUrl ? (
          <>
            <div className="modal-input-group">
              <label>Phone Number (with country code):</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254711111111"
                disabled={loading}
              />
              <small>Example: +254711111111</small>
            </div>
            <button 
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </>
        ) : (
          <>
            {summary && (
              <div className="report-preview">
                <h4>Today's Summary</h4>
                <div className="preview-stats">
                  <div>💧 {summary.totalLiters}L</div>
                  <div>💰 KES {summary.totalRevenue}</div>
                  <div>📝 {summary.transactionCount} sales</div>
                </div>
              </div>
            )}
            <button className="send-btn" onClick={handleSend}>
              📤 Send via WhatsApp
            </button>
            <button className="regenerate-btn" onClick={() => {
              setWhatsappUrl('');
              setSummary(null);
            }}>
              🔄 Change Number
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WhatsAppModal;