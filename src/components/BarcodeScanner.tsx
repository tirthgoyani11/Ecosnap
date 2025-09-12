import React, { useState, useRef } from 'react';
import { useBarcodeAPI } from '@/hooks/useBarcodeAPI';
import { useEcoScore } from '@/hooks/useEcoScore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanLine, Hash, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { ScoreRing } from './ScoreRing';

interface BarcodeScannerProps {
  onScanResult?: (result: any) => void;
  className?: string;
}

export function BarcodeScanner({ onScanResult, className = '' }: BarcodeScannerProps) {
  const { lookupBarcode, isLooking } = useBarcodeAPI();
  const { calculateEcoScore, isCalculating } = useEcoScore();
  
  const [barcode, setBarcode] = useState('');
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (!barcode.trim()) return;

    // Lookup barcode in Open Food Facts
    const barcodeResult = await lookupBarcode(barcode.trim());
    if (!barcodeResult) return;

    // Calculate eco score based on barcode data
    const ecoScore = await calculateEcoScore({
      product_name: barcodeResult.product_name || 'Unknown Product',
      brand: barcodeResult.brands,
      category: barcodeResult.categories,
      ingredients: barcodeResult.ingredients_text ? [barcodeResult.ingredients_text] : [],
      packaging: barcodeResult.packaging ? [barcodeResult.packaging] : [],
      organic: barcodeResult.ecoscore_grade === 'a' || barcodeResult.ecoscore_grade === 'b' || false
    });

    if (ecoScore) {
      const scanResult = {
        barcode: barcodeResult,
        ecoScore: ecoScore,
        timestamp: new Date().toISOString()
      };

      setLastScanResult(scanResult);
      setShowResult(true);
      onScanResult?.(scanResult);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleScan();
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setLastScanResult(null);
    setBarcode('');
    inputRef.current?.focus();
  };

  const isProcessing = isLooking || isCalculating;

  // Sample barcodes for testing
  const sampleBarcodes = [
    '3017620422003', // Nutella
    '8000500037560', // San Pellegrino
    '4006381333937', // Haribo
  ];

  return (
    <div className={`relative ${className}`}>
      <Card className="glass-card">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <ScanLine className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold">Barcode Scanner</h3>
            <p className="text-muted-foreground">
              Enter a barcode number to get product information
            </p>
          </div>

          {/* Barcode Input */}
          <div className="space-y-3">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Enter barcode (e.g., 1234567890123)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                className="pl-10"
              />
            </div>

            <Button
              onClick={handleScan}
              disabled={!barcode.trim() || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  {isLooking ? 'Looking up...' : 'Calculating score...'}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Scan Barcode
                </>
              )}
            </Button>
          </div>

          {/* Sample Barcodes */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Try these sample barcodes:</p>
            <div className="flex flex-wrap gap-2">
              {sampleBarcodes.map((sampleBarcode) => (
                <Button
                  key={sampleBarcode}
                  variant="outline"
                  size="sm"
                  onClick={() => setBarcode(sampleBarcode)}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  {sampleBarcode}
                </Button>
              ))}
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <Badge variant="outline" className="animate-pulse">
                {isLooking ? 'Looking up product...' : 'Calculating eco score...'}
              </Badge>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Scan Result Modal */}
      <AnimatePresence>
        {showResult && lastScanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 z-10"
          >
            <Card className="w-full max-w-md p-6 glass-card">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">Product Found!</h3>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">{lastScanResult.barcode.product_name}</h4>
                  {lastScanResult.barcode.brands && (
                    <p className="text-sm text-muted-foreground">
                      by {lastScanResult.barcode.brands}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">
                    Barcode: {barcode}
                  </p>
                </div>

                <div className="flex justify-center">
                  <ScoreRing 
                    score={lastScanResult.ecoScore.overall_score} 
                    size="lg" 
                  />
                </div>

                {lastScanResult.barcode.image_url && (
                  <img
                    src={lastScanResult.barcode.image_url}
                    alt={lastScanResult.barcode.product_name}
                    className="w-24 h-24 object-cover rounded-lg mx-auto"
                  />
                )}

                <div className="flex space-x-2 justify-center">
                  <Button onClick={handleRetry} variant="outline">
                    Scan Another
                  </Button>
                  <Button onClick={() => setShowResult(false)}>
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}