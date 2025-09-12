import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeminiScanService, GeminiScanResult } from "@/lib/gemini-scan-service";
import { ScoreRing } from "@/components/ScoreRing";
import { CountUpStat } from "@/components/CountUpStat";
import {
  BarChart3,
  History,
  TrendingUp,
  Calendar,
  Package,
  Leaf,
  Award,
  Eye,
  Share2,
  Download,
  Filter,
  Search,
  X,
  ArrowLeft,
  Sparkles,
  Target,
  Globe,
  Recycle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface AnalyticsViewProps {
  onClose: () => void;
}

export function AnalyticsView({ onClose }: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'trends'>('overview');
  const [selectedScan, setSelectedScan] = useState<GeminiScanResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [analytics, setAnalytics] = useState(GeminiScanService.getAnalytics());

  useEffect(() => {
    // Update analytics when component mounts
    setAnalytics(GeminiScanService.getAnalytics());
  }, []);

  const filteredHistory = analytics.recentScans.filter(scan => {
    const matchesSearch = scan.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scan.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || scan.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(analytics.recentScans.map((scan: any) => scan.category))) as string[];

  if (selectedScan) {
    return <ProductDetailView scan={selectedScan} onBack={() => setSelectedScan(null)} />;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background/50 to-muted/30 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="container mx-auto max-w-6xl p-4 min-h-full">
        
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-gradient-to-r from-background/90 to-background/70 backdrop-blur-sm rounded-lg p-4"
          >
            <div className="flex items-center gap-4">
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="glass-button"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scanner
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                📊 Scan Analytics & History
              </h1>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-8">
            {[
              { id: 'overview', label: '📈 Overview', icon: BarChart3 },
              { id: 'history', label: '🔍 Scan History', icon: History },
              { id: 'trends', label: '📊 Trends', icon: TrendingUp }
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                variant={activeTab === tab.id ? "default" : "outline"}
                className={`${activeTab === tab.id ? 'premium-button' : 'glass-button'}`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6 pb-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <OverviewTab key="overview" analytics={analytics} />
              )}
              {activeTab === 'history' && (
                <HistoryTab 
                  key="history"
                  scans={filteredHistory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  categories={categories}
                  onSelectScan={setSelectedScan}
                />
              )}
              {activeTab === 'trends' && (
                <TrendsTab key="trends" analytics={analytics} />
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ analytics }: { analytics: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                <CountUpStat value={analytics.totalScans} className="text-2xl font-bold" />
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Eco Score</p>
                <CountUpStat value={analytics.averageScore} className="text-2xl font-bold" />
              </div>
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CO₂ Saved</p>
                <div className="text-2xl font-bold">{analytics.co2Saved}kg</div>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <CountUpStat value={analytics.weeklyScans} className="text-2xl font-bold" />
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ScoreRing score={analytics.averageScore} size="lg" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{analytics.highScoreCount}</div>
              <div className="text-sm text-muted-foreground">High (80+)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{analytics.mediumScoreCount}</div>
              <div className="text-sm text-muted-foreground">Medium (60-79)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{analytics.lowScoreCount}</div>
              <div className="text-sm text-muted-foreground">{"Low (<60)"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentScans.slice(0, 5).map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg glass-button hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {scan.thumbnail && (
                    <img src={scan.thumbnail} alt={scan.productName} className="w-10 h-10 rounded object-cover" />
                  )}
                  <div>
                    <p className="font-medium">{scan.productName}</p>
                    <p className="text-sm text-muted-foreground">{scan.brand} • {scan.category}</p>
                  </div>
                </div>
                <Badge variant={scan.ecoScore >= 80 ? 'default' : scan.ecoScore >= 60 ? 'secondary' : 'destructive'}>
                  {scan.ecoScore}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function HistoryTab({ scans, searchQuery, setSearchQuery, filterCategory, setFilterCategory, categories, onSelectScan }: {
  scans: GeminiScanResult[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  categories: string[];
  onSelectScan: (scan: GeminiScanResult) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Search and Filter */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-background/50 border border-border/50 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scans.map((scan, index) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card hover:border-primary/50 cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => onSelectScan(scan)}>
              <CardContent className="pt-6">
                {scan.thumbnail && (
                  <div className="mb-4">
                    <img src={scan.thumbnail} alt={scan.productName} className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold line-clamp-2">{scan.productName}</h3>
                      <p className="text-sm text-muted-foreground">{scan.brand}</p>
                    </div>
                    <Badge variant={scan.ecoScore >= 80 ? 'default' : scan.ecoScore >= 60 ? 'secondary' : 'destructive'}>
                      {scan.ecoScore}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{scan.category}</span>
                    <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Click to view details</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {scans.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No scans found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function TrendsTab({ analytics }: { analytics: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Sustainability Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-500">+{analytics.monthlyImprovement}%</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, analytics.monthlyImprovement * 2)}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your eco-conscious choices are making a positive impact!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.categoryBreakdown?.map((cat: any, index: number) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(cat.count / analytics.totalScans) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{cat.count}</span>
                  </div>
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Scanning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const dayScans = Math.floor(Math.random() * 5);
              return (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-12">{day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${(dayScans / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{dayScans}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-500" />
            Environmental Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">{analytics.co2Saved}kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Emissions Avoided</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">{analytics.waterSaved}L</div>
              <div className="text-sm text-muted-foreground">Water Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">{analytics.wasteReduced}kg</div>
              <div className="text-sm text-muted-foreground">Waste Reduced</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProductDetailView({ scan, onBack }: { scan: GeminiScanResult; onBack: () => void }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background/50 to-muted/30 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-4">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8 sticky top-0 z-10 bg-gradient-to-r from-background/90 to-background/70 backdrop-blur-sm rounded-lg p-4"
          >
            <Button onClick={onBack} variant="outline" className="glass-button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Button>
            <h1 className="text-2xl font-bold">{scan.productName}</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Product Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Product Overview */}
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{scan.productName}</CardTitle>
                      <p className="text-muted-foreground mb-4">{scan.brand} • {scan.category}</p>
                    </div>
                    <Badge className="text-lg px-4 py-2" variant={scan.ecoScore >= 80 ? 'default' : scan.ecoScore >= 60 ? 'secondary' : 'destructive'}>
                      {scan.ecoScore} Eco Score
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {scan.thumbnail && (
                    <div className="mb-6">
                      <img src={scan.thumbnail} alt={scan.productName} className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  )}
                  
                  {/* Sustainability Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <ScoreRing score={scan.aiAnalysis.sustainability.packaging} size="md" />
                      <div className="mt-2 text-sm font-medium">Packaging</div>
                    </div>
                    <div className="text-center">
                      <ScoreRing score={scan.aiAnalysis.sustainability.materials} size="md" />
                      <div className="mt-2 text-sm font-medium">Materials</div>
                    </div>
                    <div className="text-center">
                      <ScoreRing score={scan.aiAnalysis.sustainability.manufacturing} size="md" />
                      <div className="mt-2 text-sm font-medium">Manufacturing</div>
                    </div>
                    <div className="text-center">
                      <ScoreRing score={scan.aiAnalysis.sustainability.transport} size="md" />
                      <div className="mt-2 text-sm font-medium">Transport</div>
                    </div>
                  </div>

                  {/* Environmental Impact */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Environmental Impact
                    </h3>
                    <p className="text-sm text-muted-foreground">{scan.aiAnalysis.environmentalImpact}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Recycle className="h-4 w-4 text-green-500" />
                        <span>Recyclability: {scan.recyclability}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span>Carbon: {scan.carbonFootprint}</span>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {scan.aiAnalysis.certifications.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {scan.aiAnalysis.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-500/10 text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ingredients */}
                  {scan.aiAnalysis.ingredients.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Ingredients</h3>
                      <div className="flex flex-wrap gap-2">
                        {scan.aiAnalysis.ingredients.map((ingredient, index) => (
                          <Badge key={index} variant="outline">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Insights */}
              {scan.geminiInsights.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scan.geminiInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg glass-button">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scan.aiAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Alternatives */}
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Better Alternatives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scan.alternatives.map((alt, index) => (
                      <div key={index} className="p-4 rounded-lg glass-button space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-sm">{alt.name}</h4>
                          <Badge className="bg-green-500/10 text-green-500 border border-green-500/20">
                            {alt.score}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Price</span>
                          <span className="font-medium">{alt.price}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Availability</span>
                          <Badge variant={alt.availability === 'In Stock' ? 'default' : 'secondary'} className="text-xs">
                            {alt.availability}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{alt.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
