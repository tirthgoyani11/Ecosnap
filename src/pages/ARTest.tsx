import { TestARScanner } from '@/components/TestARScanner';

export default function ARTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AR Scanner Test</h1>
          <p className="text-gray-600">Testing camera functionality for AR scanning</p>
        </div>
        
        <TestARScanner />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a diagnostic tool to test camera functionality.</p>
          <p>If this works, we can fix the main AR scanner.</p>
        </div>
      </div>
    </div>
  );
}
