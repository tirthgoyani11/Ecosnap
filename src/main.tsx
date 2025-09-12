import { createRoot } from 'react-dom/client'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

// Add console logs to debug
console.log('🚀 main.tsx: Starting EcoSnap application...');
console.log('📍 Root element:', document.getElementById("root"));
console.log('🔧 Environment variables:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing',
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
  MODE: import.meta.env.MODE
});

// Dynamic import to catch import errors
const loadApp = async () => {
  try {
    console.log('📦 Importing App component...');
    const { default: App } = await import('./App.tsx');
    console.log('✅ App component loaded successfully');
    return App;
  } catch (error) {
    console.error('❌ Failed to load App component:', error);
    throw error;
  }
};

// Fallback component for when App fails to load
const FallbackApp = () => (
  <div style={{ 
    padding: '40px', 
    backgroundColor: '#f3f4f6', 
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto',
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#059669', marginBottom: '20px' }}>
        🌿 EcoSnap AI - Loading...
      </h1>
      <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
        The application is starting up. If this message persists, there may be a loading issue.
      </p>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>Environment Status:</h3>
        <ul style={{ margin: 0, color: '#6b7280' }}>
          <li>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Present' : '❌ Missing'}</li>
          <li>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'}</li>
          <li>Mode: {import.meta.env.MODE}</li>
        </ul>
      </div>
    </div>
  </div>
);

// Main rendering function
const renderApp = async () => {
  try {
    console.log('🎯 Creating React root...');
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    const root = createRoot(rootElement);
    console.log('✅ Root created successfully');
    
    try {
      const App = await loadApp();
      console.log('🎨 Rendering main App...');
      
      root.render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );
      
      console.log('✅ App rendered successfully');
    } catch (appError) {
      console.warn('⚠️ App failed to load, rendering fallback:', appError);
      
      root.render(
        <ErrorBoundary>
          <FallbackApp />
        </ErrorBoundary>
      );
    }
    
  } catch (error) {
    console.error('💥 Critical error during app initialization:', error);
    
    // Last resort: direct DOM manipulation
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 40px; background: #fee2e2; color: #991b1b; min-height: 100vh; font-family: system-ui;">
          <h1>❌ EcoSnap AI - Startup Error</h1>
          <p>The application failed to start. Please check the console for details.</p>
          <pre style="background: #fef2f2; padding: 15px; border-radius: 6px; overflow: auto;">${error.message}\n\n${error.stack || ''}</pre>
          <button onclick="window.location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `;
    }
  }
};

// Start the app
renderApp();
