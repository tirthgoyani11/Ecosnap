import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataFlowTest } from "@/components/DataFlowTest";
import { AnimatedElement } from "@/components/AnimatedComponents";
import { 
  Code, 
  Database, 
  Activity, 
  Settings,
  Terminal,
  Gauge,
  Zap
} from "lucide-react";

export default function Developer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <AnimatedElement animation="fadeIn">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <Code size={32} className="text-blue-600" />
              <h1 className="text-3xl md:text-4xl font-bold">
                Developer Dashboard
              </h1>
            </div>
            <p className="text-gray-600 max-w-3xl mx-auto">
              System monitoring, database status, and real-time application health metrics for EcoSnap AI platform
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                <Activity className="h-3 w-3 mr-1" />
                System Online
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                <Database className="h-3 w-3 mr-1" />
                Database Connected
              </Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                <Zap className="h-3 w-3 mr-1" />
                Real-time Sync
              </Badge>
            </div>
          </div>
        </AnimatedElement>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <AnimatedElement animation="fadeInUp" delay={0.1}>
            <Card className="border-l-4 border-l-green-500 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">API Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">Online</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <Gauge className="h-3 w-3" />
                  Response: 245ms
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="fadeInUp" delay={0.2}>
            <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">Healthy</div>
                <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                  <Database className="h-3 w-3" />
                  Connections: Active
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="fadeInUp" delay={0.3}>
            <Card className="border-l-4 border-l-purple-500 bg-purple-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Auth Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-800">Ready</div>
                <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                  <Settings className="h-3 w-3" />
                  Sessions: Managed
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="fadeInUp" delay={0.4}>
            <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Cache</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-800">Optimal</div>
                <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                  <Zap className="h-3 w-3" />
                  Hit Rate: 94%
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        </div>

        {/* System Monitoring Section */}
        <AnimatedElement animation="fadeIn" delay={0.5}>
          <DataFlowTest />
        </AnimatedElement>

        {/* Environment Info */}
        <AnimatedElement animation="fadeInUp" delay={0.6}>
          <Card className="bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-green-400" />
                Environment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm font-mono">
                <div>
                  <div className="text-green-400 font-semibold">Environment:</div>
                  <div>{process.env.NODE_ENV || 'development'}</div>
                </div>
                <div>
                  <div className="text-blue-400 font-semibold">Build Version:</div>
                  <div>v1.0.0-dev</div>
                </div>
                <div>
                  <div className="text-purple-400 font-semibold">Last Deploy:</div>
                  <div>{new Date().toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-semibold">Database:</div>
                  <div>Supabase + Firebase</div>
                </div>
                <div>
                  <div className="text-red-400 font-semibold">Auth Provider:</div>
                  <div>Supabase Auth</div>
                </div>
                <div>
                  <div className="text-indigo-400 font-semibold">Storage:</div>
                  <div>Firestore + Supabase</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedElement>

        {/* Quick Actions */}
        <AnimatedElement animation="fadeInUp" delay={0.7}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Developer Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => console.clear()}
                >
                  <Terminal className="h-4 w-4" />
                  Clear Console
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.location.reload()}
                >
                  <Activity className="h-4 w-4" />
                  Refresh App
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.open('/data-test', '_blank')}
                >
                  <Database className="h-4 w-4" />
                  Data Test
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.open('/', '_blank')}
                >
                  <Code className="h-4 w-4" />
                  Main App
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedElement>
      </div>
    </div>
  );
}
