export interface Product {
  id: string;
  name: string;
  image: string;
  brand: string;
  eco_score: number;
  badges: string[];
  carbon_footprint: number;
  recyclable: boolean;
  sustainable: boolean;
}

export interface Alternative {
  id: string;
  name: string;
  image: string;
  brand: string;
  eco_score: number;
  badges: string[];
  price: number;
  savings: number;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Plastic Water Bottle",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=150&h=150&fit=crop",
    brand: "AquaBrand",
    eco_score: 25,
    badges: ["♻️"],
    carbon_footprint: 82.8,
    recyclable: true,
    sustainable: false,
  },
  {
    id: "2", 
    name: "Organic Cotton T-Shirt",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop",
    brand: "EcoWear",
    eco_score: 85,
    badges: ["🌱", "♻️", "🐰"],
    carbon_footprint: 12.4,
    recyclable: true,
    sustainable: true,
  },
  {
    id: "3",
    name: "Fast Fashion Jeans",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&h=150&fit=crop", 
    brand: "TrendyDenim",
    eco_score: 15,
    badges: [],
    carbon_footprint: 156.2,
    recyclable: false,
    sustainable: false,
  },
  {
    id: "4",
    name: "Bamboo Toothbrush",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=150&h=150&fit=crop",
    brand: "EcoBrush",
    eco_score: 92,
    badges: ["🌱", "♻️", "🐰"],
    carbon_footprint: 2.1,
    recyclable: true,
    sustainable: true,
  },
  {
    id: "5",
    name: "Plastic Disposable Plates",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop",
    brand: "QuickServe",
    eco_score: 18,
    badges: [],
    carbon_footprint: 45.3,
    recyclable: false,
    sustainable: false,
  }
];

export const mockAlternatives: Alternative[] = [
  {
    id: "alt-1",
    name: "Stainless Steel Water Bottle",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&h=150&fit=crop",
    brand: "EcoLife",
    eco_score: 92,
    badges: ["🌱", "♻️"],
    price: 24.99,
    savings: 85,
  },
  {
    id: "alt-2", 
    name: "Glass Water Bottle",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop",
    brand: "PureGlass",
    eco_score: 88,
    badges: ["♻️", "🌱"],
    price: 19.99,
    savings: 78,
  },
  {
    id: "alt-3",
    name: "Bamboo Water Bottle",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop",
    brand: "GreenBottle",
    eco_score: 90,
    badges: ["🌱", "🐰"],
    price: 22.99,
    savings: 82,
  },
  {
    id: "alt-4",
    name: "Recycled Cotton T-Shirt",
    image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=150&h=150&fit=crop",
    brand: "ReNew",
    eco_score: 89,
    badges: ["♻️", "🌱"],
    price: 28.99,
    savings: 76,
  },
  {
    id: "alt-5",
    name: "Biodegradable Plates",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop",
    brand: "EcoServe",
    eco_score: 94,
    badges: ["🌱", "♻️", "🐰"],
    price: 12.99,
    savings: 90,
  }
];