// Fallback data for offline functionality
import { Product, Alternative, EcoTip } from './types';

export const fallbackProducts: Product[] = [
  {
    id: "fallback-1",
    name: "Plastic Water Bottle",
    brand: "AquaBrand",
    eco_score: 25,
    carbon_footprint: 82.8,
    recyclable: true,
    sustainable: false,
    badges: ["♻️"],
    metadata: {
      materials: ["PET Plastic", "Plastic Cap"],
      packaging: ["Single-use plastic"],
      category: "Beverages"
    }
  },
  {
    id: "fallback-2",
    name: "Organic Cotton T-Shirt",
    brand: "EcoWear",
    eco_score: 85,
    carbon_footprint: 12.4,
    recyclable: true,
    sustainable: true,
    badges: ["🌱", "♻️", "🏷️"],
    metadata: {
      materials: ["100% Organic Cotton"],
      packaging: ["Recycled cardboard"],
      category: "Clothing"
    }
  },
  {
    id: "fallback-3",
    name: "Fast Fashion Jeans",
    brand: "TrendyDenim",
    eco_score: 15,
    carbon_footprint: 156.2,
    recyclable: false,
    sustainable: false,
    badges: [],
    metadata: {
      materials: ["Cotton", "Polyester", "Elastane"],
      packaging: ["Plastic bags"],
      category: "Clothing"
    }
  }
];

export const fallbackAlternatives: Alternative[] = [
  {
    id: "alt-1",
    name: "Stainless Steel Water Bottle",
    brand: "EcoLife",
    eco_score: 92,
    price: 24.99,
    savings_percentage: 85,
    carbon_footprint: 8.2,
    reasons: [
      "Reusable for years",
      "No single-use plastic",
      "Keeps drinks cold/hot",
      "BPA-free stainless steel"
    ],
    badges: ["🌱", "♻️", "⭐"]
  },
  {
    id: "alt-2",
    name: "Glass Water Bottle",
    brand: "PureGlass",
    eco_score: 88,
    price: 19.99,
    savings_percentage: 78,
    carbon_footprint: 12.1,
    reasons: [
      "100% recyclable glass",
      "No plastic taste",
      "Chemical-free",
      "Dishwasher safe"
    ],
    badges: ["♻️", "🌱"]
  },
  {
    id: "alt-3",
    name: "Bamboo Water Bottle",
    brand: "GreenBottle",
    eco_score: 90,
    price: 22.99,
    savings_percentage: 82,
    carbon_footprint: 6.8,
    reasons: [
      "Rapidly renewable bamboo",
      "Biodegradable materials",
      "Naturally antimicrobial",
      "Carbon negative production"
    ],
    badges: ["🌱", "🐰", "♻️"]
  }
];

export const fallbackTips: EcoTip[] = [
  {
    id: "tip-1",
    title: "Bring Your Own Bag",
    content: "Use reusable shopping bags instead of plastic ones. A single reusable bag can replace hundreds of plastic bags over its lifetime.",
    category: "shopping",
    difficulty: "easy",
    impact_score: 7
  },
  {
    id: "tip-2",
    title: "Buy in Bulk",
    content: "Purchase items in bulk to reduce packaging waste. Bring your own containers to bulk stores for even greater impact.",
    category: "shopping",
    difficulty: "medium",
    impact_score: 8
  },
  {
    id: "tip-3",
    title: "Choose Glass Over Plastic",
    content: "When possible, choose products in glass containers. Glass is 100% recyclable and doesn't leach chemicals.",
    category: "shopping",
    difficulty: "easy",
    impact_score: 6
  },
  {
    id: "tip-4",
    title: "Unplug Electronics",
    content: "Unplug devices when not in use. Many electronics consume power even when turned off, called 'phantom load'.",
    category: "energy",
    difficulty: "easy",
    impact_score: 5
  },
  {
    id: "tip-5",
    title: "Meal Planning",
    content: "Plan your meals for the week to reduce food waste. Food waste accounts for 8% of global greenhouse gas emissions.",
    category: "lifestyle",
    difficulty: "medium",
    impact_score: 9
  }
];

export const ecoScoreCategories = {
  excellent: { min: 80, label: "Excellent", color: "emerald" },
  good: { min: 60, label: "Good", color: "green" },
  fair: { min: 40, label: "Fair", color: "yellow" },
  poor: { min: 20, label: "Poor", color: "orange" },
  bad: { min: 0, label: "Needs Improvement", color: "red" }
};

export const achievements = [
  {
    id: "first-scan",
    title: "First Scan",
    description: "Complete your first product scan",
    icon: "📱",
    target: 1
  },
  {
    id: "eco-warrior",
    title: "Eco Warrior",
    description: "Scan 100 products",
    icon: "🌱",
    target: 100
  },
  {
    id: "co2-saver",
    title: "CO₂ Saver",
    description: "Save 50kg of CO₂ through better choices",
    icon: "🌍",
    target: 50
  },
  {
    id: "alternative-seeker",
    title: "Alternative Seeker",
    description: "Check alternatives for 25 products",
    icon: "🔄",
    target: 25
  },
  {
    id: "streak-master",
    title: "Streak Master",
    description: "Scan products for 7 days in a row",
    icon: "🔥",
    target: 7
  }
];