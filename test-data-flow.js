/**
 * Test script to verify data flow in EcoSnap
 * This helps debug if scans are being saved and displayed correctly
 */

console.log('🔍 EcoSnap Data Flow Test');
console.log('=========================');

// Test 1: Check if we're connected to the app
if (typeof window !== 'undefined') {
  console.log('✅ Browser environment detected');
  
  // Check if React Query is available
  if (window.React) {
    console.log('✅ React is loaded');
  }
  
  // Check localStorage for any stored data
  const storedData = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth') || key.includes('eco')
  );
  console.log('📦 LocalStorage keys:', storedData);
  
} else {
  console.log('❌ Not in browser environment');
}

// Test 2: Database Connection Test
console.log('\n🗄️ Database Connection Test');
console.log('Add this to your browser console after login:');
console.log(`
// Test database query
async function testDatabase() {
  try {
    const { data: profile } = await window.supabase
      .from('profiles')
      .select('*')
      .limit(1);
    console.log('✅ Profile data:', profile);
    
    const { data: scans } = await window.supabase
      .from('scans')
      .select('*')
      .limit(5);
    console.log('✅ Recent scans:', scans);
    
    return { profile, scans };
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}
testDatabase();
`);

// Test 3: Scanner Test
console.log('\n📸 Scanner Test Instructions');
console.log('1. Go to /scanner page');
console.log('2. Open browser developer tools (F12)');
console.log('3. Try scanning - look for these console messages:');
console.log('   - 🔍 Starting AI analysis');
console.log('   - 🤖 AI Analysis Results');
console.log('   - 💾 Saving scan data');
console.log('   - ✅ Scan saved successfully');

console.log('\n📊 Dashboard Test Instructions');
console.log('1. Go to /dashboard page');  
console.log('2. Look for console message: 📊 Dashboard Data');
console.log('3. Check if recent scans show up');

export default {};
