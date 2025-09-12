/**
 * Enhanced AI Analysis Display Component
 * Shows comprehensive eco-scoring and food analysis results
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { UnifiedAnalysisResult } from '../lib/unified-ai-analysis';

interface EnhancedAnalysisDisplayProps {
  analysis: UnifiedAnalysisResult;
  isLoading?: boolean;
  className?: string;
}

export const EnhancedAnalysisDisplay: React.FC<EnhancedAnalysisDisplayProps> = ({
  analysis,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            Analyzing with AI...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Analysis Results</span>
            <div className="flex items-center gap-2">
              <Badge className={getGradeColor(analysis.sustainability_grade)}>
                Grade {analysis.sustainability_grade}
              </Badge>
              <Badge variant="outline">
                {analysis.confidence_level} confidence
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold rounded-lg p-4 ${getScoreColor(analysis.unified_score || 0)}`}>
                {analysis.unified_score || 0}/100
              </div>
              <p className="text-sm text-gray-600 mt-2">Overall Sustainability Score</p>
            </div>

            {/* Analysis Type Badge */}
            <div className="flex flex-col justify-center">
              <Badge variant="secondary" className="mb-2 w-fit">
                {analysis.analysis_type === 'combined' ? 'Health + Environmental' :
                 analysis.analysis_type === 'food_only' ? 'Food Analysis' :
                 'Environmental Analysis'}
              </Badge>
              <p className="text-sm text-gray-600">
                {analysis.analysis_type === 'combined' ? 
                  'Comprehensive analysis including nutritional and environmental factors' :
                  analysis.analysis_type === 'food_only' ?
                  'Focused on health and nutrition impact' :
                  'Focused on environmental sustainability'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      {analysis.analysis_type === 'combined' && analysis.food_analysis && analysis.eco_score && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Food Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Health & Nutrition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Health Score</span>
                  <span className={`font-semibold px-2 py-1 rounded ${getScoreColor(analysis.food_analysis.health_score)}`}>
                    {analysis.food_analysis.health_score}/100
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Nutritional Profile</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Protein Quality:</span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.food_analysis.nutritional_analysis.protein_quality}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Fiber Content:</span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.food_analysis.nutritional_analysis.fiber_content}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Sodium Level:</span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.food_analysis.nutritional_analysis.sodium_level}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Sugar Content:</span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.food_analysis.nutritional_analysis.sugar_content}
                      </Badge>
                    </div>
                  </div>
                </div>

                {analysis.food_analysis.health_benefits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-green-700 mb-2">Health Benefits</h4>
                    <ul className="text-xs space-y-1">
                      {analysis.food_analysis.health_benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Environmental Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Eco Score</span>
                  <span className={`font-semibold px-2 py-1 rounded ${getScoreColor(analysis.eco_score.overall_score)}`}>
                    {analysis.eco_score.overall_score}/100
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Impact Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.eco_score.breakdown).map(([category, score]) => (
                      <div key={category} className="flex justify-between items-center text-xs">
                        <span className="capitalize">{category.replace('_', ' ')}:</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${(score as number) >= 70 ? 'bg-green-500' : (score as number) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{score as number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.eco_score.certifications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-blue-700 mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.eco_score.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Single Analysis Display */}
      {analysis.analysis_type !== 'combined' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {analysis.analysis_type === 'food_only' ? 'Food Analysis Details' : 'Environmental Analysis Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.food_analysis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold rounded p-2 ${getScoreColor(analysis.food_analysis.health_score)}`}>
                    {analysis.food_analysis.health_score}
                  </div>
                  <p className="text-xs mt-1">Health Score</p>
                </div>
                <div>
                  <div className={`text-2xl font-bold rounded p-2 ${getScoreColor(analysis.food_analysis.sustainability_score)}`}>
                    {analysis.food_analysis.sustainability_score}
                  </div>
                  <p className="text-xs mt-1">Sustainability</p>
                </div>
                <div>
                  <Badge className={`text-lg px-3 py-1 ${getGradeColor(analysis.food_analysis.overall_rating)}`}>
                    {analysis.food_analysis.overall_rating}
                  </Badge>
                  <p className="text-xs mt-1">Overall Rating</p>
                </div>
              </div>
            )}

            {analysis.eco_score && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  {Object.entries(analysis.eco_score.breakdown).map(([category, score]) => (
                    <div key={category}>
                      <div className={`text-lg font-bold rounded p-2 ${getScoreColor(score as number)}`}>
                        {score as number}
                      </div>
                      <p className="text-xs mt-1 capitalize">{category.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-700 mb-3">Analysis Insights</h4>
              <ul className="space-y-2">
                {analysis.key_insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-green-700 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {analysis.action_recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">🎯</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      {(analysis.eco_score?.impact_summary || analysis.food_analysis) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Impact Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm leading-relaxed">
                {analysis.eco_score?.impact_summary || 
                 `This ${analysis.analysis_type === 'food_only' ? 'food product' : 'product'} has been analyzed for its ${
                   analysis.analysis_type === 'combined' ? 'health and environmental' :
                   analysis.analysis_type === 'food_only' ? 'nutritional and health' :
                   'environmental'
                 } impact. The analysis shows ${
                   (analysis.unified_score || 0) >= 75 ? 'strong positive' :
                   (analysis.unified_score || 0) >= 50 ? 'moderate' :
                   'significant areas for improvement'
                 } indicators across key sustainability metrics.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAnalysisDisplay;
