// Simple debug component to test React rendering
export default function Debug() {
  console.log("Debug component is rendering!");
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#333', margin: 0, marginBottom: '1rem' }}>
          🟢 React is Working!
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          EcoSnap app is loading successfully.
        </p>
        <p style={{ color: '#888', fontSize: '0.9em', marginTop: '1rem' }}>
          Time: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
