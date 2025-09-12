import React from 'react';
import BasicCameraTest from '@/components/BasicCameraTest';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BasicCameraTestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Basic Camera Test
          </h1>
          <p className="text-gray-600 mb-6">
            The most basic camera test to identify AR scanner issues
          </p>
        </div>
      </div>

      {/* Test Component */}
      <div className="max-w-4xl mx-auto">
        <BasicCameraTest />
      </div>

      {/* Additional Debug Info */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Troubleshooting Guide</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>If Basic Test Works:</strong> The issue is with AR scanner constraints or setup
            </div>
            <div>
              <strong>If Basic Test Fails:</strong> Camera permissions or device compatibility issue
            </div>
            <div>
              <strong>Black Screen:</strong> Usually video element not playing or wrong constraints
            </div>
            <div>
              <strong>Permission Denied:</strong> Allow camera access in browser settings
            </div>
            <div>
              <strong>No Camera Found:</strong> Check if camera is connected and not used by other apps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicCameraTestPage;
