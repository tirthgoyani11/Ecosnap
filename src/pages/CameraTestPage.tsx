import { CameraTest } from "@/components/CameraTest";
import { SimpleCameraTest } from "@/components/SimpleCameraTest";

export default function CameraTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Camera Functionality Test</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Advanced Camera Test</h2>
            <CameraTest />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Simple Camera Test</h2>
            <SimpleCameraTest />
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Open this page in Chrome, Firefox, or Safari (not VS Code browser)</li>
            <li>2. Click "Start Camera" on either test</li>
            <li>3. Allow camera permissions when prompted</li>
            <li>4. Check browser console (F12) for detailed logs</li>
            <li>5. If camera works here, the issue is browser-specific</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
