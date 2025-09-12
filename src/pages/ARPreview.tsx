import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ARCamera } from "@/components/ARCamera";
import { ARProductOverlay } from "@/components/ARProductOverlay";
import { ScoreRing } from "@/components/ScoreRing";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Camera, 
  Scan, 
  Eye,
  Zap,
  Download,
  Share2,
  Play,
  Info,
  Settings,
  Fullscreen,
  X,
  ExternalLink,
  ShoppingCart,
  Leaf
} from "lucide-react";

export default function ARPreview() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "🌿 EcoSnap AI - AR Preview";
  }, []);

  const handleProductDetected = (product: any) => {
    // Auto-show overlay for detected products
    setSelectedProduct(product);
  };

  const handleCloseOverlay = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = (product: any) => {
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
    setSelectedProduct(null);
  };

  const handleViewDetails = (product: any) => {
    toast({
      title: "Product Details",
      description: `Viewing details for ${product.name}`,
    });
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

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
          AR 
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {" "}Experience
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Point your camera at products to see real-time eco scores and sustainable alternatives in AR.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Main AR Camera View */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live AR Camera
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={handleFullscreen}
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <Fullscreen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ARCamera 
                onProductDetected={handleProductDetected}
                className="min-h-[400px] lg:min-h-[500px]"
              />
            </CardContent>
          </Card>

          {/* Product Information Display - Replaces Popup */}
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card border-primary/20">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{selectedProduct.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg leading-tight">{selectedProduct.name}</h3>
                        <p className="text-muted-foreground text-sm">{selectedProduct.brand}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            <Leaf className="h-3 w-3 mr-1" />
                            Organic
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                            Recyclable
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleCloseOverlay}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Eco Score Display */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center mb-3">
                      <div className="relative">
                        <ScoreRing score={selectedProduct.ecoScore} size="lg" />
                      </div>
                    </div>
                  </div>

                  {/* Environmental Impact Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                      <div className="text-orange-600 font-bold text-lg">{selectedProduct.carbonFootprint}kg</div>
                      <div className="text-xs text-orange-600/80">Carbon CO₂e</div>
                    </div>
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <div className="text-green-600 font-bold text-lg">{selectedProduct.ecoScore}/100</div>
                      <div className="text-xs text-green-600/80">Eco Score</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <div className="text-blue-600 font-bold text-lg">200L</div>
                      <div className="text-xs text-blue-600/80">Water Used</div>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                      <div className="text-purple-600 font-bold text-lg">85%</div>
                      <div className="text-xs text-purple-600/80">Recycle Rate</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewDetails(selectedProduct)}
                      className="h-12"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Button 
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="h-12 bg-primary hover:bg-primary/90"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>

                  {/* Price */}
                  <div className="text-right mt-3">
                    <div className="text-2xl font-bold">$24.99</div>
                    <div className="text-sm text-muted-foreground">Free shipping</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-3 gap-4"
          >
            <Button variant="glass" className="h-16 flex-col gap-2">
              <Scan className="h-5 w-5" />
              <span className="text-xs">Quick Scan</span>
            </Button>
            <Button variant="glass" className="h-16 flex-col gap-2">
              <Share2 className="h-5 w-5" />
              <span className="text-xs">Share AR</span>
            </Button>
            <Button variant="glass" className="h-16 flex-col gap-2">
              <Download className="h-5 w-5" />
              <span className="text-xs">Save Image</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Side Panel - Features & Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* AR Features */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                AR Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  icon: Eye,
                  title: "Real-time Detection",
                  description: "Instantly identify products through your camera",
                  active: true
                },
                {
                  icon: Zap,
                  title: "Live Eco Scores",
                  description: "See sustainability ratings floating above products",
                  active: true
                },
                {
                  icon: Scan,
                  title: "Smart Alternatives",
                  description: "Get better eco-friendly suggestions instantly",
                  active: true
                },
                {
                  icon: Smartphone,
                  title: "Mobile Optimized",
                  description: "Smooth experience on all devices",
                  active: true
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg transition-all bg-primary/10 border border-primary/20"
                >
                  <div className="p-2 rounded-lg bg-primary text-white flex-shrink-0">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Tutorial */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How to Use AR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Allow camera access when prompted",
                "Point camera at any product",
                "Wait for AR overlay to appear",
                "Tap on floating info for details"
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{step}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}