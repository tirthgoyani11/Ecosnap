// Simple test component to verify React is working
import React from 'react';

export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1 style={{ color: 'green' }}>✅ React is Working!</h1>
      <p>If you see this page, React is properly loading.</p>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Test Information:</strong></p>
        <ul>
          <li>✅ React components are rendering</li>
          <li>✅ No white screen of death</li>
          <li>✅ JavaScript is executing</li>
          <li>✅ Static data approach is working</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <p><strong>Quick Links:</strong></p>
        <a href="/dashboard" style={{ marginRight: '15px', color: 'blue' }}>Dashboard</a>
        <a href="/leaderboard" style={{ marginRight: '15px', color: 'blue' }}>Leaderboard</a>
        <a href="/scanner" style={{ marginRight: '15px', color: 'blue' }}>Scanner</a>
        <a href="/test" style={{ marginRight: '15px', color: 'blue' }}>Test Page</a>
      </div>
    </div>
  );
}
