import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface FraudAnalysis {
  creatorId: number;
  fraudScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  indicators: string[];
  aiAnalysis: string;
  recommendations: string;
  verified: boolean;
}

interface FraudDetectionProps {
  creatorId: number;
  creatorName?: string;
  onVerificationComplete?: (verified: boolean) => void;
}

const FraudDetection = ({ creatorId, creatorName, onVerificationComplete }: FraudDetectionProps) => {
  const [analysis, setAnalysis] = useState<FraudAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const runFraudDetection = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/fraud-detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ creatorId })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze creator profile');
      }

      const data = await response.json();
      setAnalysis(data);

      if (onVerificationComplete) {
        onVerificationComplete(data.verified);
      }

      toast({
        title: 'Fraud Analysis Complete',
        description: `Creator ${data.verified ? 'verified as authentic' : 'requires manual review'}.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'High': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Creator Authenticity Check
        </CardTitle>
        <CardDescription>
          AI-powered fraud detection and authenticity verification for {creatorName || 'this creator'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis && !error && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Run an AI-powered authenticity check to verify this creator's profile and social media presence.
            </p>
            <Button
              onClick={runFraudDetection}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Authenticity Check'}
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getRiskIcon(analysis.riskLevel)}
                <span className="font-semibold">Risk Level:</span>
                <Badge className={getRiskColor(analysis.riskLevel)}>
                  {analysis.riskLevel}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Fraud Score: {(analysis.fraudScore * 100).toFixed(1)}%
              </div>
            </div>

            {analysis.verified && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✓ Creator verified as authentic. Low risk of fraud.
                </AlertDescription>
              </Alert>
            )}

            {analysis.indicators.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Fraud Indicators Detected:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {analysis.indicators.map((indicator, index) => (
                    <li key={index}>{indicator}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">AI Analysis:</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.aiAnalysis}
              </p>
            </div>

            {analysis.recommendations && (
              <div>
                <h4 className="font-semibold mb-2">Recommendations:</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.recommendations}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={runFraudDetection}
                disabled={isAnalyzing}
                variant="outline"
              >
                {isAnalyzing ? 'Re-analyzing...' : 'Re-run Analysis'}
              </Button>
              {analysis.verified && (
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  ✓ Verified Authentic
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FraudDetection;
