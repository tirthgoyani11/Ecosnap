// Lightweight Open Food Facts client and mappers
// Public API docs: https://wiki.openfoodfacts.org/API

export interface OffApiResponse {
  status: number; // 1 if found
  product?: OffProduct;
  code?: string;
}

// Minimal subset of OFF product fields we use
export interface OffProduct {
  code?: string;
  product_name?: string;
  generic_name?: string;
  brands?: string;
  brands_tags?: string[];
  categories?: string;
  categories_tags?: string[];
  ecoscore_grade?: 'a' | 'b' | 'c' | 'd' | 'e' | 'not-applicable' | 'unknown';
  ecoscore_score?: number; // 0..100
  nutriscore_grade?: 'a' | 'b' | 'c' | 'd' | 'e';
  ingredients_analysis_tags?: string[]; // e.g., ['en:vegan', 'en:palm-oil-free']
  labels?: string; // comma separated
  labels_tags?: string[]; // e.g., ['en:organic']
  packaging?: string;
  packaging_text?: string;
  packaging_tags?: string[];
  packaging_recycling?: string;
  image_url?: string;
  image_front_url?: string;
  ecoscore_data?: {
    agribalyse?: {
      co2_total?: number; // kg CO2e / 100g
    };
  };
}

export interface EcoProduct {
  productName: string;
  brand: string;
  category: string;
  ecoScore: number;
  packagingScore: number;
  carbonScore: number;
  ingredientScore: number;
  certificationScore: number;
  recyclable: boolean;
  co2Impact: number;
  healthScore: number;
  certifications: string[];
  ecoDescription: string;
  alternatives: { product_name: string; reasoning: string }[];
  imageUrl?: string;
}

const API_BASE = 'https://world.openfoodfacts.org';

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function gradeToScore(grade?: string | null): number {
  if (!grade) return 50;
  switch (grade.toUpperCase()) {
    case 'A':
      return 90;
    case 'B':
      return 75;
    case 'C':
      return 60;
    case 'D':
      return 40;
    case 'E':
      return 20;
    default:
      return 50;
  }
}

export async function fetchProductByBarcode(barcode: string, opts?: { signal?: AbortSignal }): Promise<OffApiResponse> {
  const url = `${API_BASE}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=code,product_name,generic_name,brands,brands_tags,categories,categories_tags,ecoscore_grade,ecoscore_score,nutriscore_grade,ingredients_analysis_tags,labels,labels_tags,packaging,packaging_text,packaging_tags,packaging_recycling,ecoscore_data,image_url,image_front_url`;
  const res = await fetch(url, {
    method: 'GET',
    signal: opts?.signal,
    headers: {
      // Note: User-Agent cannot be set from browsers; OFF accepts default UA from the browser
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`OFF request failed: ${res.status}`);
  return res.json();
}

export async function searchProductByName(name: string, opts?: { signal?: AbortSignal; pageSize?: number }): Promise<OffProduct[]> {
  const pageSize = opts?.pageSize ?? 5;
  const url = `${API_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(name)}&search_simple=1&action=process&json=1&page_size=${pageSize}&fields=code,product_name,generic_name,brands,brands_tags,categories,categories_tags,ecoscore_grade,ecoscore_score,nutriscore_grade,ingredients_analysis_tags,labels,labels_tags,image_url,image_front_url`;
  const res = await fetch(url, { method: 'GET', signal: opts?.signal, headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`OFF search failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.products) ? (data.products as OffProduct[]) : [];
}

export function mapOffToEcoProduct(p: OffProduct | undefined): EcoProduct | null {
  if (!p) return null;
  const name = p.product_name || p.generic_name || 'Unknown product';
  const brand = p.brands_tags?.[0] || (p.brands ? p.brands.split(',')[0] : '') || 'Unknown brand';
  const category = p.categories_tags?.[0]?.replace(/^en:/, '') || (p.categories?.split(',')[0] || 'general');

  const ecoScore = typeof p.ecoscore_score === 'number' ? clamp(p.ecoscore_score) : gradeToScore(p.ecoscore_grade);

  // Simple heuristics for extra scores
  const vegan = p.ingredients_analysis_tags?.includes('en:vegan') ? 1 : 0;
  const vegetarian = p.ingredients_analysis_tags?.includes('en:vegetarian') ? 1 : 0;
  const palmFree = p.ingredients_analysis_tags?.includes('en:palm-oil-free') ? 1 : 0;
  const ingredientScore = clamp(50 + vegan * 20 + vegetarian * 10 + palmFree * 10);

  const labels = (p.labels_tags || []).map((t) => t.replace(/^en:/, ''));
  const hasOrganic = labels.some((l) => /organic|bio/.test(l));
  const hasFair = labels.some((l) => /fair[- ]?trade/.test(l));
  const certificationScore = clamp(50 + (hasOrganic ? 25 : 0) + (hasFair ? 15 : 0));

  const packagingText = [p.packaging, p.packaging_text, p.packaging_recycling].filter(Boolean).join(' ').toLowerCase();
  const recyclable = /(recycl|recycled)/.test(packagingText);
  const packagingScore = clamp(40 + (recyclable ? 35 : 0));

  const co2 = p.ecoscore_data?.agribalyse?.co2_total;
  const co2Impact = typeof co2 === 'number' ? co2 : -1; // kg CO2e/100g if available
  const carbonScore = typeof co2 === 'number' ? clamp(100 - Math.min(100, co2 * 10)) : 55; // heuristic inverse

  const healthScore = gradeToScore(p.nutriscore_grade);

  const certifications = labels.slice(0, 6);

  const ecoDescription = `${name} by ${brand} has eco-score ${ecoScore}. ${recyclable ? 'Packaging appears recyclable.' : 'Packaging recyclability unknown.'}`;

  const alternatives: { product_name: string; reasoning: string }[] = [];

  return {
    productName: name,
    brand,
    category,
    ecoScore,
    packagingScore,
    carbonScore,
    ingredientScore,
    certificationScore,
    recyclable,
    co2Impact,
    healthScore,
    certifications,
    ecoDescription,
    alternatives,
    imageUrl: p.image_front_url || p.image_url || '/placeholder.svg',
  };
}

export async function withTimeout<T>(p: Promise<T>, ms = 3000, reason = 'Request timed out'): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(reason), ms);
  try {
    // If caller already passes an AbortSignal, they should use fetchProductByBarcode directly
    // Here we wrap generic promises where possible
    // For fetches inside, ensure they accept controller.signal
    // This helper is kept for symmetry; in our use we pass signal manually per call
    return await p;
  } finally {
    clearTimeout(t);
  }
}
