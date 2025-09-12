import { useState, useCallback } from 'react';
import { mockProducts, mockAlternatives, type Product, type Alternative } from '@/lib/mock/products';

export type ScanState = 'idle' | 'scanning' | 'found' | 'error';

export interface ScanResult {
  product: Product;
  alternatives: Alternative[];
}

export const useScannerMock = () => {
  const [state, setState] = useState<ScanState>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);

  const startScan = useCallback(() => {
    setState('scanning');
    setResult(null);

    // Simulate scanning delay
    setTimeout(() => {
      // 90% chance of finding a product, 10% error
      if (Math.random() > 0.1) {
        const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
        const shuffledAlternatives = [...mockAlternatives].sort(() => 0.5 - Math.random()).slice(0, 3);
        
        setResult({
          product: randomProduct,
          alternatives: shuffledAlternatives
        });
        setState('found');
      } else {
        setState('error');
      }
    }, 2000 + Math.random() * 1000); // 2-3 seconds
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
  }, []);

  return {
    state,
    result,
    startScan,
    reset,
    isScanning: state === 'scanning',
    hasResult: state === 'found' && result !== null,
    hasError: state === 'error'
  };
};