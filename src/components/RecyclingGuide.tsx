import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Recycle, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Leaf, 
  Trash2, 
  Package, 
  Droplets,
  Zap,
  TrendingUp,
  Award,
  Info,
  ExternalLink,
  Clock,
  Navigation
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface RecyclingInfo {
  recyclable: boolean;
  recyclabilityScore: number;
  materials: Array<{
    name: string;
    percentage: number;
    recyclable: boolean;
    recyclingCode?: string;
  }>;
  instructions: string[];
  preparation: string[];
  localFacilities?: Array<{
    name: string;
    address: string;
    distance: string;
    acceptedMaterials: string[];
  }>;
  environmentalImpact: {
    co2SavedByRecycling: number;
    waterSaved: number;
    energySaved: number;
  };
  alternatives?: {
    composting: boolean;
    upcycling: string[];
    donation: boolean;
  };
}

interface RecyclingGuideProps {
  productName: string;
  recyclingInfo: RecyclingInfo;
  onRecycleConfirm?: () => void;
  showImpactTracker?: boolean;
}

export const RecyclingGuide = ({ 
  productName, 
  recyclingInfo, 
  onRecycleConfirm,
  showImpactTracker = true 
}: RecyclingGuideProps) => {
  const [recycled, setRecycled] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRecycleConfirmation = () => {
    setRecycled(true);
    toast({
      title: "🎉 Recycling Tracked!",
      description: `You earned 50 eco-points for recycling ${productName}`,
    });
    
    if (onRecycleConfirm) {
      onRecycleConfirm();
    }
  };

  const getRecyclabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 40) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-full">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Recycling Guide</CardTitle>
                <p className="text-sm text-muted-foreground">{productName}</p>
              </div>
            </div>
            <Badge className={`${getRecyclabilityColor(recyclingInfo.recyclabilityScore)} text-lg px-4 py-2`}>
              {recyclingInfo.recyclabilityScore}% Recyclable
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Material Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material Composition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recyclingInfo.materials.map((material, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{material.name}</span>
                  {material.recyclable ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {material.recyclingCode && (
                    <Badge variant="outline" className="text-xs">
                      {material.recyclingCode}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{material.percentage}%</span>
              </div>
              <Progress value={material.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recycling Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How to Recycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preparation Steps */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preparation Steps
            </h4>
            <ol className="space-y-2">
              {recyclingInfo.preparation.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Main Instructions */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Recycle className="h-4 w-4" />
              Recycling Instructions
            </h4>
            <ul className="space-y-2">
              {recyclingInfo.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      {showImpactTracker && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Environmental Impact of Recycling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">CO₂ Saved</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {recyclingInfo.environmentalImpact.co2SavedByRecycling} kg
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Water Saved</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {recyclingInfo.environmentalImpact.waterSaved} L
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Energy Saved</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {recyclingInfo.environmentalImpact.energySaved} kWh
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Recycling Facilities */}
      {recyclingInfo.localFacilities && recyclingInfo.localFacilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Nearby Recycling Centers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recyclingInfo.localFacilities.map((facility, index) => (
              <div key={index} className="p-4 border rounded-lg hover:border-green-500 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{facility.name}</h4>
                    <p className="text-sm text-muted-foreground">{facility.address}</p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {facility.distance}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {facility.acceptedMaterials.map((material, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alternative Disposal Methods */}
      {recyclingInfo.alternatives && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Alternative Disposal Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recyclingInfo.alternatives.composting && (
              <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">Composting Available</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This product can be composted at home or in industrial composting facilities.
                </p>
              </div>
            )}
            
            {recyclingInfo.alternatives.donation && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">Consider Donation</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  If still usable, consider donating to local charities or community centers.
                </p>
              </div>
            )}
            
            {recyclingInfo.alternatives.upcycling.length > 0 && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Recycle className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold">Upcycling Ideas</span>
                </div>
                <ul className="space-y-1">
                  {recyclingInfo.alternatives.upcycling.map((idea, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirm Recycling Action */}
      {user && !recycled && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">Ready to Recycle?</h3>
                <p className="text-sm text-green-50">
                  Confirm your recycling action to earn 50 eco-points!
                </p>
              </div>
              <Button 
                onClick={handleRecycleConfirmation}
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50"
              >
                <Award className="mr-2 h-5 w-5" />
                I Recycled This!
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {recycled && (
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold">Great Job!</h3>
                <p className="text-sm text-green-50">
                  You've earned 50 eco-points for recycling responsibly! 🌱
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
