# 🤖 Quick AI Prompts for EcoSnap

## 🌍 **ECO-SCORE QUICK PROMPT**

```prompt
Analyze this product for environmental impact and provide an eco-score (0-100):

Product: {product_name}
Category: {category}
Materials: {materials}
Packaging: {packaging}

Rate based on:
1. Carbon footprint (30%)
2. Resource use (25%) 
3. Packaging sustainability (20%)
4. Supply chain ethics (15%)
5. Product lifecycle (10%)

Return JSON with overall_score, breakdown, insights, and alternatives.
```

## 🍎 **FOOD ANALYSIS QUICK PROMPT**

```prompt
Analyze this food product for health and nutrition:

Product: {product_name}
Ingredients: {ingredients}
Nutrition per 100g: {nutrition_facts}

Evaluate:
1. Nutritional quality (40%)
2. Health impact (30%)
3. Ingredient quality (20%) 
4. Sustainability (10%)

Return JSON with health_score, nutrition_grade, detailed_analysis, recommendations, and better_alternatives.
```

## 🚀 **ENHANCED PROMPTS**

### **Detailed Eco-Score Analysis**
```prompt
As an environmental scientist, analyze this product's complete environmental impact:

**PRODUCT:** {product_name}
**CATEGORY:** {category}
**BRAND:** {brand}
**ORIGIN:** {origin}
**MATERIALS:** {materials}
**PACKAGING:** {packaging}

**CALCULATE ECO-SCORE (0-100):**

**Carbon Footprint (30%):**
- Manufacturing emissions
- Transportation impact
- Raw material extraction
- End-of-life disposal

**Resource Consumption (25%):**
- Water usage
- Energy consumption
- Land use impact
- Rare materials

**Packaging (20%):**
- Recyclability
- Waste volume
- Biodegradability
- Single-use design

**Supply Chain (15%):**
- Fair trade practices
- Labor conditions
- Local vs global sourcing
- Corporate sustainability

**Lifecycle (10%):**
- Product durability
- Repair potential
- Disposal options
- Upgrade capability

**OUTPUT JSON:**
{
  "overall_score": number,
  "confidence": "high/medium/low",
  "breakdown": {
    "carbon_footprint": number,
    "resource_consumption": number,
    "packaging": number,
    "supply_chain": number,
    "lifecycle": number
  },
  "insights": ["key findings"],
  "alternatives": ["better options"],
  "certifications": ["organic", "fair-trade"],
  "impact_summary": "brief description"
}
```

### **Comprehensive Food Health Analysis**
```prompt
As a certified nutritionist, analyze this food product comprehensively:

**FOOD:** {product_name}
**BRAND:** {brand}
**INGREDIENTS:** {ingredients_list}
**NUTRITION per 100g:** {nutrition_facts}
**CATEGORY:** {food_category}

**HEALTH ANALYSIS:**

**Nutritional Quality (40%):**
- Macro/micronutrient density
- Beneficial compounds (fiber, antioxidants, omega-3)
- Added sugars, sodium, saturated fat
- Vitamin/mineral content

**Health Impact (30%):**
- Processing level (NOVA classification)
- Harmful additives
- Allergen risks
- Glycemic impact
- Inflammatory properties

**Ingredient Quality (20%):**
- Artificial vs natural
- Organic content
- GMO presence
- Functional ingredients
- Chemical additives

**Sustainability (10%):**
- Agricultural impact
- Carbon footprint
- Packaging impact
- Water usage

**OUTPUT JSON:**
{
  "health_score": number,
  "nutrition_grade": "A/B/C/D/E",
  "processing_level": "unprocessed/minimally/processed/ultra",
  "detailed_analysis": {
    "nutritional_quality": {
      "score": number,
      "strengths": ["benefits"],
      "concerns": ["issues"],
      "per_serving": {calories, protein, fiber, sugars, sodium}
    },
    "health_impact": {
      "score": number,
      "beneficial_compounds": ["list"],
      "concerning_ingredients": ["list"],
      "allergens": ["list"],
      "dietary_suitability": ["vegetarian", "keto", etc]
    }
  },
  "recommendations": ["advice"],
  "better_alternatives": ["options"],
  "consumption_advice": "guidance"
}
```

## 💡 **USAGE TIPS**

### **For Best Results:**

1. **Eco-Score:** Include as much product detail as possible (materials, origin, certifications)

2. **Food Analysis:** Provide complete ingredient lists and nutrition facts for accuracy

3. **API Integration:** Use with GPT-4, Claude-3, or Gemini Pro for best analysis quality

4. **Error Handling:** Always have fallback scores when AI APIs fail

5. **Updates:** Refresh analysis monthly for dynamic products

### **Implementation in Your App:**

```javascript
// Example usage in your bulletproof system
const ecoAnalysis = await ai.generateContent({
  prompt: ecoScorePrompt.replace('{product_name}', productName),
  model: 'gemini-pro'
});

const foodAnalysis = await ai.generateContent({
  prompt: foodAnalysisPrompt.replace('{product_name}', productName),
  model: 'gpt-4'
});
```

---

*Use these prompts in your bulletproof eco-system for accurate, comprehensive product analysis!* 🌿✨


# 🌿 EcoSnap AI Prompts - Bulletproof Eco-Score & Food Analysis

## 🎯 **ECO-SCORE ALGORITHM PROMPT**

### **Core Prompt for Environmental Impact Analysis:**

```
You are an expert environmental scientist and sustainability analyst. Analyze the given product and provide a comprehensive eco-score between 0-100, where 100 is the most environmentally friendly.

**PRODUCT DATA:**
- Name: {product_name}
- Category: {category}
- Brand: {brand}
- Materials: {materials}
- Packaging: {packaging}
- Origin: {origin_country}
- Weight: {weight}

**ANALYSIS REQUIREMENTS:**

1. **CARBON FOOTPRINT (30% weight)**
   - Manufacturing emissions
   - Transportation distance and method
   - Raw material extraction impact
   - End-of-life disposal emissions

2. **RESOURCE CONSUMPTION (25% weight)**
   - Water usage in production
   - Energy consumption (renewable vs non-renewable)
   - Land use and deforestation impact
   - Rare materials or minerals usage

3. **PACKAGING SUSTAINABILITY (20% weight)**
   - Material recyclability (plastic, glass, cardboard, etc.)
   - Packaging waste volume
   - Single-use vs reusable design
   - Biodegradability of packaging materials

4. **SUPPLY CHAIN ETHICS (15% weight)**
   - Fair trade certifications
   - Labor practices
   - Local vs global sourcing
   - Corporate sustainability commitments

5. **LIFECYCLE IMPACT (10% weight)**
   - Product durability and lifespan
   - Repair and maintenance requirements
   - Upgrade potential vs replacement needs
   - Disposal and recycling options

**OUTPUT FORMAT (JSON):**
{
  "overall_score": 75,
  "confidence": "high",
  "breakdown": {
    "carbon_footprint": 22,
    "resource_consumption": 18,
    "packaging": 16,
    "supply_chain": 12,
    "lifecycle": 7
  },
  "insights": [
    "Specific environmental strengths",
    "Key areas for improvement",
    "Comparison to category average"
  ],
  "alternatives": [
    "Better eco-friendly options",
    "Specific improvement suggestions"
  ],
  "certifications": ["organic", "fair-trade", "carbon-neutral"],
  "impact_summary": "Brief environmental impact description"
}

Ensure accuracy and provide actionable insights for consumers making eco-conscious choices.
```

---

## 🥗 **FOOD ANALYSIS ALGORITHM PROMPT**

### **Core Prompt for Comprehensive Food Analysis:**

```
You are a certified nutritionist, food scientist, and health expert. Analyze the given food product and provide comprehensive nutritional, health, and sustainability insights.

**FOOD PRODUCT DATA:**
- Name: {product_name}
- Brand: {brand}
- Barcode: {barcode}
- Ingredients: {ingredients_list}
- Nutrition Facts: {nutrition_per_100g}
- Categories: {food_categories}
- Processing Level: {nova_group}

**ANALYSIS REQUIREMENTS:**

1. **NUTRITIONAL QUALITY (40% weight)**
   - Macro and micronutrient density
   - Caloric density and satiety index
   - Presence of beneficial compounds (antioxidants, omega-3, fiber)
   - Added sugars, sodium, and saturated fat levels
   - Vitamin and mineral content analysis

2. **HEALTH IMPACT ASSESSMENT (30% weight)**
   - Processing level (NOVA classification)
   - Harmful additives and preservatives
   - Allergen identification and cross-contamination risks
   - Glycemic index estimation
   - Anti-inflammatory vs pro-inflammatory properties

3. **INGREDIENT QUALITY (20% weight)**
   - Artificial vs natural ingredients
   - Organic certification and pesticide residues
   - GMO content and labeling
   - Functional ingredients and superfoods
   - Chemical additives and their health implications

4. **SUSTAINABILITY SCORE (10% weight)**
   - Agricultural impact and farming methods
   - Food miles and transportation carbon footprint
   - Packaging environmental impact
   - Water usage in production
   - Seasonal availability and local sourcing

**OUTPUT FORMAT (JSON):**
{
  "health_score": 82,
  "nutrition_grade": "A",
  "processing_level": "minimally_processed",
  "detailed_analysis": {
    "nutritional_quality": {
      "score": 85,
      "strengths": ["High fiber", "Rich in protein", "Low added sugar"],
      "concerns": ["High sodium", "Low vitamin C"],
      "per_serving": {
        "calories": 150,
        "protein": "12g",
        "fiber": "8g",
        "sugars": "3g",
        "sodium": "480mg"
      }
    },
    "health_impact": {
      "score": 78,
      "beneficial_compounds": ["Antioxidants", "Omega-3", "Probiotics"],
      "concerning_ingredients": ["Carrageenan", "Natural flavors"],
      "allergens": ["Contains nuts", "May contain soy"],
      "dietary_suitability": ["Vegetarian", "Gluten-free"]
    },
    "ingredient_quality": {
      "score": 88,
      "organic_percentage": 85,
      "artificial_additives": 2,
      "preservatives": ["Vitamin E (natural)"],
      "quality_indicators": ["Non-GMO", "Fair Trade"]
    },
    "sustainability": {
      "score": 75,
      "carbon_footprint": "low",
      "water_usage": "moderate",
      "packaging_score": 70,
      "local_sourcing": true
    }
  },
  "recommendations": [
    "Excellent source of plant-based protein",
    "Consider pairing with vitamin C rich foods",
    "Suitable for heart-healthy diet"
  ],
  "better_alternatives": [
    "Lower sodium organic version available",
    "Similar product with added vitamins"
  ],
  "consumption_advice": "Recommended as part of balanced diet, limit to 1 serving daily due to sodium content"
}

Provide evidence-based analysis using current nutritional science and food safety standards.
```

---

## 🔧 **IMPLEMENTATION PROMPTS**

### **Enhanced Eco-Score with Real-Time Data:**

```
Enhance the eco-score analysis with real-time data integration:

1. **Carbon API Integration:**
   - Query carbon footprint databases
   - Use transportation distance calculations
   - Factor in seasonal production variations

2. **Certification Verification:**
   - Cross-reference with certification databases
   - Verify organic, fair-trade, and sustainability claims
   - Check for greenwashing indicators

3. **Supply Chain Analysis:**
   - Trace product origin and manufacturing locations
   - Analyze transportation routes and methods
   - Assess corporate sustainability reports

4. **Market Comparison:**
   - Compare against category benchmarks
   - Identify top sustainable alternatives
   - Provide improvement recommendations
```

### **Advanced Food Analysis with Health Predictions:**

```
Advanced food analysis with personalized health insights:

1. **Nutritional Density Calculation:**
   - Calculate nutrient-to-calorie ratios
   - Assess bioavailability of nutrients
   - Factor in cooking/processing effects

2. **Health Risk Assessment:**
   - Identify potential health risks from additives
   - Assess cumulative exposure to concerning ingredients
   - Evaluate allergenic potential

3. **Dietary Integration:**
   - Suggest optimal serving sizes
   - Recommend complementary foods
   - Provide meal planning integration

4. **Long-term Health Impact:**
   - Predict health outcomes from regular consumption
   - Suggest dietary pattern improvements
   - Provide evidence-based nutrition education
```

---

## 🚀 **IMPLEMENTATION NOTES**

### **For Eco-Score Algorithm:**
- Use these prompts with GPT-4, Claude, or Gemini for accurate environmental analysis
- Combine with real databases (EPA, Carbon Trust, LCA databases)
- Implement caching for common products to improve response time
- Update scoring criteria quarterly based on latest sustainability science

### **For Food Analysis:**
- Integrate with OpenFoodFacts API for comprehensive ingredient data
- Use USDA nutrition database for accurate nutritional information
- Implement personalization based on dietary preferences and restrictions
- Provide regulatory compliance checking (FDA, EU regulations)

### **Error Handling:**
- Always provide fallback scores when API calls fail
- Use confidence indicators for all analyses
- Implement graceful degradation with cached data
- Provide transparent uncertainty communication to users

---

*These prompts are designed to work with your bulletproof eco-system architecture, providing accurate, actionable insights for sustainable consumption choices.*
