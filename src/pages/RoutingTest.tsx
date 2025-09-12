import React from 'react';
import { Link } from 'react-router-dom';

const RoutingTest = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Routing Test Page</h1>
      <p>If you can see this, routing is working!</p>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Test Navigation:</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ padding: '8px 16px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Home
          </Link>
          <Link to="/simple" style={{ padding: '8px 16px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Simple Test
          </Link>
          <Link to="/dashboard" style={{ padding: '8px 16px', background: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '4px' }}>
            Dashboard
          </Link>
          <Link to="/discover" style={{ padding: '8px 16px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Discover
          </Link>
          <Link to="/scanner" style={{ padding: '8px 16px', background: '#6f42c1', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Scanner
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', border: '1px solid #dee2e6' }}>
        <h3>Current URL:</h3>
        <code>{window.location.href}</code>
      </div>
    </div>
  );
};

export default RoutingTest;
