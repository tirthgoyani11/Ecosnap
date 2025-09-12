import React, { useState, useRef } from 'react';
import { useVisionAPI } from '@/hooks/useVisionAPI';
import { useEcoScore } from '@/hooks/useEcoScore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, X, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { ScoreRing } from './ScoreRing';

interface FileUploadScannerProps {
  onScanResult?: (result: any) => void;
  className?: string;
}

export function FileUploadScanner({ onScanResult, className = '' }: FileUploadScannerProps) {
  const { analyzeImage, isAnalyzing } = useVisionAPI();
  const { calculateEcoScore, isCalculating } = useEcoScore();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

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
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleScan = async () => {
    if (!selectedFile || !previewUrl) return;

    // Convert to base64 for API
    const base64Image = previewUrl.split(',')[1];
    
    // Analyze image with Gemini Vision
    const visionResult = await analyzeImage(base64Image);
    if (!visionResult) return;

    // Calculate eco score
    const ecoScore = await calculateEcoScore({
      product_name: visionResult.product_name,
      brand: visionResult.brand,
      category: visionResult.category,
      materials: visionResult.materials,
      packaging: visionResult.packaging,
      ingredients: visionResult.ingredients
    });

    if (ecoScore) {
      const scanResult = {
        vision: visionResult,
        ecoScore: ecoScore,
        timestamp: new Date().toISOString(),
        imageFile: selectedFile,
        imageUrl: previewUrl
      };

      setLastScanResult(scanResult);
      setShowResult(true);
      onScanResult?.(scanResult);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setLastScanResult(null);
    handleClearFile();
  };

  const isProcessing = isAnalyzing || isCalculating;

  return (
    <div className={`relative ${className}`}>
      <Card className="glass-card">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <FileImage className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold">Upload Product Image</h3>
            <p className="text-muted-foreground">
              Drop an image or click to select a product photo
            </p>
          </div>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            {previewUrl ? (
              // Image Preview
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  onClick={handleClearFile}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-lg font-medium">
                      {isAnalyzing ? 'Analyzing product...' : 'Calculating eco score...'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Upload Placeholder
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`text-lg font-medium mb-2 ${isDragging ? 'text-primary' : ''}`}>
                  {isDragging ? 'Drop image here' : 'Upload Product Image'}
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  PNG, JPG, WebP up to 10MB
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mt-4"
                  disabled={isProcessing}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isProcessing}
            />
          </div>

          {/* Scan Button */}
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Button
                onClick={handleScan}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    {isAnalyzing ? 'Analyzing...' : 'Calculating score...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Analyze Product
                  </>
                )}
              </Button>

              {/* File info */}
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <Badge variant="outline" className="animate-pulse">
                {isAnalyzing ? 'Analyzing image with AI...' : 'Calculating eco score...'}
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
                <h3 className="text-xl font-bold">Product Detected!</h3>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">{lastScanResult.vision.product_name}</h4>
                  {lastScanResult.vision.brand && (
                    <p className="text-sm text-muted-foreground">
                      by {lastScanResult.vision.brand}
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <ScoreRing 
                    score={lastScanResult.ecoScore.overall_score} 
                    size="lg" 
                  />
                </div>

                <div className="flex space-x-2 justify-center">
                  <Button onClick={handleRetry} variant="outline">
                    Upload Another
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