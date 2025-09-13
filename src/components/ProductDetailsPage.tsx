/**
 * Product Details Page Wrapper
 * Handles URL parameters and routing for enhanced product details
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EnhancedProductDetails } from './EnhancedProductDetails';
import { ProductDataEnrichment } from '../lib/enhanced-product-enrichment';

export const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [enrichedData, setEnrichedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const productName = productId ? decodeURIComponent(productId) : 'Unknown Product';
  
  useEffect(() => {
    const loadProductData = async () => {
      try {
        // First try to get enhanced data from sessionStorage (from scanner)
        const productKey = `product_${encodeURIComponent(productName)}`;
        const cachedData = sessionStorage.getItem(productKey);
        
        if (cachedData) {
          console.log('📦 Using cached enhanced product data from scanner');
          setEnrichedData(JSON.parse(cachedData));
        } else {
          console.log('🔍 No cached data, enriching product on demand:', productName);
          // If no cached data, enrich the product data on demand
          const enriched = await ProductDataEnrichment.enrichProductData(productName);
          setEnrichedData(enriched);
        }
      } catch (error) {
        console.error('❌ Failed to load enhanced product data:', error);
        // Fallback to basic data if enrichment fails
        setEnrichedData({
          productName,
          brand: 'Unknown Brand',
          category: 'General',
          ecoScore: 50,
          description: 'Product information temporarily unavailable.',
          confidence: 0,
          dataSources: {
            openFoodFacts: false,
            geminiAI: false,
            barcodeAPI: false,
            unsplashImages: false,
            realAlternatives: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [productName]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading enhanced product data...</p>
        </div>
      </div>
    );
  }

  if (!enrichedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Product data not available</p>
          <button onClick={handleBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <EnhancedProductDetails
      productId={productId}
      enrichedData={enrichedData}
      onBack={handleBack}
    />
  );
};

export default ProductDetailsPage;