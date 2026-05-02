import React, { useState, useRef } from 'react';
import { DB } from '../data/db';
import '../styles/layout.css';
import '../styles/components.css';

export default function LoginPage({ onOwnerLogin, onEmployeeLogin }) {
  const [role, setRole] = useState('owner');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [bizId, setBizId] = useState('');
  const [empPin, setEmpPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');

  const ownerPinRefs = [useRef(), useRef(), useRef(), useRef()];
  const empPinRefs   = [useRef(), useRef(), useRef(), useRef()];

  const handlePinInput = (i, val, arr, setArr, refs) => {
    const next = [...arr]; next[i] = val;
    setArr(next);
    if (val && i < 3) refs[i + 1].current?.focus();
  };
  const handlePinBack = (i, arr, refs) => {
    if (!arr[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handleOwnerLogin = () => {
    const p = pin.join('');
    if (phone === DB.owner.phone && p === DB.owner.pin) {
      setError(''); onOwnerLogin();
    } else { setError('Invalid phone or PIN. Try again.'); }
  };

  const handleEmpLogin = () => {
    const p = empPin.join('');
    if (bizId === DB.business.id) {
      const emp = DB.employees.find((e) => e.pin === p && e.active);
      if (emp) { setError(''); onEmployeeLogin(emp); }
      else setError('Invalid Business ID or PIN.');
    } else setError('Invalid Business ID.');
  };

  return (
    <div className="login-wrap">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">💧</div>
          <div className="logo-text">Water<span>Flow</span></div>
        </div>

        <div className="role-tabs">
          <div className={`role-tab ${role === 'owner' ? 'active' : ''}`} onClick={() => { setRole('owner'); setError(''); }}>
            Business Owner
          </div>
          <div className={`role-tab ${role === 'employee' ? 'active' : ''}`} onClick={() => { setRole('employee'); setError(''); }}>
            Employee
          </div>
        </div>

        {role === 'owner' ? (
          <>
            <div className="field">
              <label>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" />
            </div>
            <div className="field">
              <label>4-Digit PIN</label>
              <div className="pin-row">
                {[0, 1, 2, 3].map((i) => (
                  <input key={i} ref={ownerPinRefs[i]} className="pin-box" type="password" maxLength={1}
                    inputMode="numeric" value={pin[i]}
                    onChange={(e) => handlePinInput(i, e.target.value, pin, setPin, ownerPinRefs)}
                    onKeyDown={(e) => e.key === 'Backspace' && handlePinBack(i, pin, ownerPinRefs)}
                  />
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleOwnerLogin}>Sign In</button>
          </>
        ) : (
          <>
            <div className="field">
              <label>Business ID</label>
              <input type="text" value={bizId} onChange={(e) => setBizId(e.target.value)} placeholder="e.g. biz001" />
            </div>
            <div className="field">
              <label>Your 4-Digit PIN</label>
              <div className="pin-row">
                {[0, 1, 2, 3].map((i) => (
                  <input key={i} ref={empPinRefs[i]} className="pin-box" type="password" maxLength={1}
                    inputMode="numeric" value={empPin[i]}
                    onChange={(e) => handlePinInput(i, e.target.value, empPin, setEmpPin, empPinRefs)}
                    onKeyDown={(e) => e.key === 'Backspace' && handlePinBack(i, empPin, empPinRefs)}
                  />
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleEmpLogin}>Sign In</button>
          </>
        )}

        {error && <div className="error-msg">{error}</div>}

        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: 12, color: 'var(--text3)' }}>
          {role === 'owner'
            ? 'Demo: +254711111111 / PIN 0000'
            : <>Demo: Business ID <b style={{ color: 'var(--text2)' }}>biz001</b> · PIN <b style={{ color: 'var(--text2)' }}>1234</b></>}
        </div>
      </div>
    </div>
  );
}
