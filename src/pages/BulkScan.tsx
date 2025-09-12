import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KPIStat } from "@/components/KPIStat";
import { ScoreRing } from "@/components/ScoreRing";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useCreateScan } from "@/hooks/useDatabase";
import { mockProducts } from "@/lib/mock/products";
import { 
  Upload, 
  Plus, 
  Package, 
  Leaf, 
  Zap, 
  Trash2,
  Replace,
  ShoppingCart,
  TrendingUp
} from "lucide-react";

interface BulkItem {
  id: string;
  name: string;
  image: string;
  brand: string;
  ecoScore: number;
  carbonFootprint: number;
  status: 'pending' | 'scanned' | 'error';
}

export default function BulkScan() {
  const [items, setItems] = useState<BulkItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const createScanMutation = useCreateScan();

  useEffect(() => {
    document.title = "🌿 EcoSnap AI - Bulk Scanner";
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate adding dropped items
    const newItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: product.name,
        image: product.image,
        brand: product.brand,
        ecoScore: product.eco_score,
        carbonFootprint: product.carbon_footprint,
        status: 'scanned' as const,
      };
    });
    
    setItems(prev => [...prev, ...newItems]);
    toast({
      title: "Items added successfully",
      description: `Added ${newItems.length} item(s) to your bulk scan list.`,
    });
  };

  const addRandomItem = () => {
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const newItem: BulkItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: product.name,
      image: product.image,
      brand: product.brand,
    ecoScore: product.eco_score,
    carbonFootprint: product.carbon_footprint,
      status: 'scanned',
    };
    
    setItems(prev => [...prev, newItem]);
    toast({
      title: "Item added",
      description: `Added ${newItem.name} to your bulk scan list.`,
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item has been removed from your bulk scan list.",
    });
  };

  const replaceItem = (id: string) => {
    toast({
      title: "Finding replacement",
      description: "Searching for a more sustainable alternative...",
    });
  };

  const clearAll = () => {
    setItems([]);
    toast({
      title: "List cleared",
      description: "All items have been removed from your bulk scan list.",
    });
  };

  const saveBulkScan = async () => {
    if (items.length === 0) return;
    
    try {
      // Save each item individually using async mutation
      for (const item of items) {
        await createScanMutation.mutateAsync({
          detected_name: item.name,
          scan_type: 'camera',
          eco_score: item.ecoScore,
          co2_footprint: item.carbonFootprint
        });
      }

      toast({
        title: "Bulk scan saved!",
        description: `Successfully saved ${items.length} items to your profile.`,
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save bulk scan to database.",
        variant: "destructive",
      });
    }
  };

  // Calculate summary stats
  const avgEcoScore = items.length > 0 ? Math.round(items.reduce((acc, item) => acc + item.ecoScore, 0) / items.length) : 0;
  const totalCO2 = items.reduce((acc, item) => acc + item.carbonFootprint, 0);
  const estimatedSavings = Math.round(totalCO2 * 0.3); // 30% potential savings

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Bulk 
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {" "}Scanner
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Analyze multiple products at once to get comprehensive insights into your shopping cart's environmental impact.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Side - Upload & Summary */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Drag & Drop Zone */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
                  ${isDragging 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'
                  }
                `}
              >
                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Drop Items Here</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop product images or barcodes to add them to your bulk scan
                  </p>
                  <Button 
                    onClick={addRandomItem}
                    variant="outline" 
                    className="glass-button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sample Item
                  </Button>
                </motion.div>

                {isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-primary font-semibold">Drop here to add items</div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4">
            <KPIStat
              title="Items Scanned"
              value={items.length}
              icon={Package}
              color="primary"
            />
            <KPIStat
              title="Avg Eco Score"
              value={avgEcoScore}
              unit="/100"
              icon={Leaf}
              color="success"
            />
            <KPIStat
              title="Est. CO₂ Saved"
              value={estimatedSavings}
              unit="g"
              change={estimatedSavings > 0 ? 15 : 0}
              changeLabel="vs conventional"
              icon={TrendingUp}
              color="accent"
            />
          </div>
        </motion.div>

        {/* Right Side - Items List */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Scanned Items
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                {items.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={saveBulkScan}
                      variant="default"
                      size="sm"
                      disabled={createScanMutation.isPending}
                      className="glass-button"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {createScanMutation.isPending ? "Saving..." : "Save Scan"}
                    </Button>
                    <Button
                      onClick={clearAll}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState
                      icon={Package}
                      title="No items scanned yet"
                      description="Start by dropping product images above or adding sample items to see how bulk scanning works."
                      action={{
                        label: "Add Sample Item",
                        onClick: addRandomItem
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="items"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-xl glass-card hover:shadow-glow transition-all duration-300"
                      >
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Eco Score:</span>
                              <ScoreRing score={item.ecoScore} size="sm" animated={false} />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.carbonFootprint}g CO₂
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => replaceItem(item.id)}
                            size="sm"
                            variant="outline"
                            className="glass-button"
                          >
                            <Replace className="h-3 w-3 mr-1" />
                            Replace
                          </Button>
                          <Button
                            onClick={() => removeItem(item.id)}
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Environmental Impact Summary */}
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Environmental Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Carbon Footprint Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total CO₂ Emissions</span>
                          <span className="font-medium">{totalCO2.toFixed(1)}g</span>
                        </div>
                        <Progress value={Math.min((totalCO2 / 500) * 100, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {totalCO2 < 100 ? "Low impact" : totalCO2 < 300 ? "Moderate impact" : "High impact"} shopping cart
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Sustainability Score</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average Score</span>
                          <span className="font-medium">{avgEcoScore}/100</span>
                        </div>
                        <Progress value={avgEcoScore} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {avgEcoScore >= 80 ? "Excellent" : avgEcoScore >= 60 ? "Good" : "Needs improvement"} sustainability rating
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Potential Environmental Savings</p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{estimatedSavings}g</div>
                          <div className="text-xs text-muted-foreground">CO₂ Reduction</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">15%</div>
                          <div className="text-xs text-muted-foreground">Better Choices</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}