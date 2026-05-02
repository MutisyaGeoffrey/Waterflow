import React, { useState } from 'react';
import './LampLogin.css';

const LampLogin = ({ onLogin }) => {
  const [isLampOn, setIsLampOn] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      background: isLampOn ? '#0a1929' : '#121212',
      transition: 'background 0.5s'
    }}>
      {/* Simple Lamp */}
      <div 
        onClick={() => setIsLampOn(!isLampOn)}
        style={{
          marginTop: '100px',
          cursor: 'pointer',
          width: '60px',
          height: '100px',
          background: '#4b5563',
          borderRadius: '30px 30px 10px 10px',
          boxShadow: isLampOn ? '0 0 50px #3b82f6' : 'none',
          transition: 'box-shadow 0.3s'
        }}
      />

      {/* Login Form - shows when lamp is on */}
      {isLampOn && (
        <div style={{
          marginTop: '50px',
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '400px'
        }}>
          <h2 style={{ textAlign: 'center', color: '#2563eb' }}>💧 WaterFlow</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            onLogin(phone, pin);
          }}>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                margin: '10px 0',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <input
              type="password"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength="4"
              style={{
                width: '100%',
                padding: '12px',
                margin: '10px 0',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <button type="submit" style={{
              width: '100%',
              padding: '14px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LampLogin;