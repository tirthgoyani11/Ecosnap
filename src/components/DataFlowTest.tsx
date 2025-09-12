import React, { useState } from 'react';
import { useProfile, useScans } from '@/hooks/useDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  User, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Activity,
  Scan,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const DataFlowTest: React.FC = () => {
  const { user, session, loading: authLoading, initialized, signUp } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile, error: profileError } = useProfile();
  const { data: scans, isLoading: scansLoading, refetch: refetchScans, error: scansError } = useScans(5);
  
  const [creatingTestUser, setCreatingTestUser] = useState(false);
  
  const createTestUser = async () => {
    setCreatingTestUser(true);
    try {
      const testEmail = `test-${Date.now()}@ecosnap.com`;
      const testPassword = 'testpassword123';
      
      console.log('Creating test user:', testEmail);
      await signUp(testEmail, testPassword, { name: 'Test User' });
    } catch (error) {
      console.error('Error creating test user:', error);
    }
    setCreatingTestUser(false);
  };
  
  console.log('🧪 Data Flow Test:', {
    auth: {
      hasUser: !!user,
      hasSession: !!session,
      authLoading,
      initialized
    },
    profile: {
      hasProfile: !!profile,
      profileLoading,
      profileError: profileError?.message
    },
    scans: {
      scanCount: scans?.length || 0,
      scansLoading,
      scansError: scansError?.message
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Database className="h-5 w-5" />
            System Status Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">
            Real-time monitoring of authentication, profile, and data synchronization
          </p>
        </CardContent>
      </Card>

      {/* Status Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Authentication Status */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-4 w-4 text-green-600" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Status</span>
              <Badge variant={user ? "default" : "secondary"} className="flex items-center gap-1">
                {user ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {user ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Session</span>
              <Badge variant={session ? "default" : "secondary"} className="flex items-center gap-1">
                {session ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {session ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Loading</span>
              <Badge variant={authLoading ? "outline" : "secondary"}>
                {authLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                {authLoading ? 'Loading...' : 'Ready'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Initialized</span>
              <Badge variant={initialized ? "default" : "destructive"}>
                {initialized ? 'Yes' : 'No'}
              </Badge>
            </div>

            {user && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {user.email ? user.email.substring(0, 3) + '***@' + user.email.split('@')[1] : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Profile Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge variant={profile ? "default" : "secondary"} className="flex items-center gap-1">
                {profile ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {profile ? 'Loaded' : 'No Data'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Loading</span>
              <Badge variant={profileLoading ? "outline" : "secondary"}>
                {profileLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                {profileLoading ? 'Loading...' : 'Ready'}
              </Badge>
            </div>

            {profileError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>Error: {profileError.message}</span>
              </div>
            )}

            {profile && (
              <div className="space-y-2 pt-2 border-t">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-green-50 p-2 rounded text-center">
                    <div className="font-bold text-green-700">{profile.points || 0}</div>
                    <div className="text-xs text-green-600">Points</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <div className="font-bold text-blue-700">{profile.total_scans || 0}</div>
                    <div className="text-xs text-blue-600">Scans</div>
                  </div>
                </div>
                <div className="bg-purple-50 p-2 rounded text-center">
                  <div className="font-bold text-purple-700">
                    {profile.total_co2_saved ? `${profile.total_co2_saved.toFixed(2)} kg` : '0 kg'}
                  </div>
                  <div className="text-xs text-purple-600">CO₂ Saved</div>
                </div>
              </div>
            )}

            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => refetchProfile()}
              className="w-full mt-3"
              disabled={profileLoading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${profileLoading ? 'animate-spin' : ''}`} />
              Refresh Profile
            </Button>
          </CardContent>
        </Card>

        {/* Scans Status */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scan className="h-4 w-4 text-purple-600" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Count</span>
              <Badge variant="default" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {scans?.length || 0} scans
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Loading</span>
              <Badge variant={scansLoading ? "outline" : "secondary"}>
                {scansLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                {scansLoading ? 'Loading...' : 'Ready'}
              </Badge>
            </div>

            {scansError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>Error: {scansError.message}</span>
              </div>
            )}

            {scans && scans.length > 0 && (
              <div className="space-y-2 pt-2 border-t max-h-40 overflow-auto">
                {scans.slice(0, 3).map((scan, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="font-medium text-gray-800 truncate">{scan.detected_name}</div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Score: {scan.eco_score}/100</span>
                      <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {scans.length > 3 && (
                  <div className="text-center text-xs text-gray-500 py-1">
                    ... and {scans.length - 3} more
                  </div>
                )}
              </div>
            )}

            {scans && scans.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-4">
                No scan data available
              </div>
            )}

            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => refetchScans()}
              className="w-full mt-3"
              disabled={scansLoading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${scansLoading ? 'animate-spin' : ''}`} />
              Refresh Scans
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Action Panel */}
      {!user && initialized && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Authentication Required</h3>
            </div>
            <p className="text-sm text-yellow-700 mb-4">
              Sign in to access your profile data and scan history. New users can create an account to start tracking their environmental impact.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild className="bg-white hover:bg-yellow-50">
                <a href="/login">Sign In</a>
              </Button>
              <Button size="sm" variant="outline" asChild className="bg-white hover:bg-yellow-50">
                <a href="/signup">Sign Up</a>
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={createTestUser}
                disabled={creatingTestUser}
                className="bg-yellow-100 hover:bg-yellow-200"
              >
                {creatingTestUser ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <User className="h-3 w-3 mr-1" />
                )}
                {creatingTestUser ? 'Creating...' : 'Create Test User'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataFlowTest;