import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/apiHelper';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, ArrowLeftRight, Check, AlertCircle, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatorCompareProps {
  creatorIds: (string | number)[];
  onClose?: () => void;
  brandContext?: {
    campaignDescription: string;
    targetAudience: string;
    budget: string;
  };
}

export default function CreatorCompare({ creatorIds, onClose, brandContext }: CreatorCompareProps) {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComparison();
  }, [creatorIds]);

  const fetchComparison = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall('/api/ai/compare', {
        method: 'POST',
        body: JSON.stringify({
          creatorIds,
          brandContext: brandContext || {
            campaignDescription: "Standard campaign match and suitability evaluation.",
            targetAudience: "Indian D2C market",
            budget: "₹50,000"
          }
        })
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to compare creators');
      }
    } catch (err: any) {
      toast({
        title: 'Comparison Failed',
        description: err.message || 'Could not compute comparison. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-100 shadow-soft bg-white/50 backdrop-blur-md">
        <CardContent className="p-12 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-medium text-slate-700 animate-pulse">Analyzing profiles and compiling comparison metrics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.creators) {
    return null;
  }

  const { creators, narrative, overlap } = data;

  // Helpers to find the maximum in each row to highlight
  const maxScore = Math.max(...creators.map((c: any) => c.score));
  const maxER = Math.max(...creators.map((c: any) => c.er));
  const maxGrowth = Math.max(...creators.map((c: any) => c.growthRate));

  // Audience overlap percentage (usually 1st vs 2nd creator in array)
  const overlapKey = `${creators[0]?.id}_to_${creators[1]?.id}`;
  const overlapInfo = overlap?.[overlapKey] || overlap?.[`${creators[1]?.id}_to_${creators[0]?.id}`];

  return (
    <Card className="border border-slate-100 shadow-soft bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Side-by-Side Comparison</h3>
            <p className="text-xs text-slate-500">AI-assisted comparative matrix and suitability recommendation</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-lg text-slate-400 hover:text-slate-800">
            ✕ Close
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Comparative Metrics Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Evaluation Criteria</th>
                {creators.map((c: any, idx: number) => (
                  <th key={c.id} className="p-4 font-extrabold text-slate-800 min-w-[150px]">
                    {c.name}
                    <span className="block font-normal text-slate-400 capitalize text-xxs mt-0.5">{c.niche}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Overall Scorecard Index */}
              <tr>
                <td className="p-4 font-semibold text-slate-800">Overall Scorecard</td>
                {creators.map((c: any) => (
                  <td key={c.id} className="p-4">
                    <span className={`inline-flex items-center gap-1 text-sm font-bold ${c.score === maxScore ? 'text-indigo-600' : 'text-slate-800'}`}>
                      {c.score}/100
                      {c.score === maxScore && <Check className="h-4 w-4 stroke-[3px]" />}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Followers */}
              <tr>
                <td className="p-4 font-semibold text-slate-800">Total Reach</td>
                {creators.map((c: any) => (
                  <td key={c.id} className="p-4 text-slate-800">
                    {typeof c.followers === 'number' 
                      ? c.followers.toLocaleString() 
                      : c.followers}
                  </td>
                ))}
              </tr>

              {/* Engagement Rate */}
              <tr>
                <td className="p-4 font-semibold text-slate-800">Engagement Rate</td>
                {creators.map((c: any) => (
                  <td key={c.id} className="p-4">
                    <span className={c.er === maxER ? 'text-emerald-600 font-bold' : 'text-slate-800'}>
                      {c.er}%
                      {c.er === maxER && <span className="text-xxs font-semibold ml-1 bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700">Best</span>}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Posting Consistency */}
              <tr>
                <td className="p-4 font-semibold text-slate-800">Posting Consistency</td>
                {creators.map((c: any) => (
                  <td key={c.id} className="p-4 text-slate-800">
                    {Math.round(c.consistency * 100)}%
                  </td>
                ))}
              </tr>

              {/* Growth Velocity */}
              <tr>
                <td className="p-4 font-semibold text-slate-800">Growth velocity</td>
                {creators.map((c: any) => (
                  <td key={c.id} className="p-4">
                    <span className={c.growthRate === maxGrowth ? 'text-emerald-600 font-bold' : 'text-slate-800'}>
                      +{c.growthRate}%/mo
                    </span>
                  </td>
                ))}
              </tr>


            </tbody>
          </table>
        </div>

        {/* Audience Overlap Section (if 2 creators compared) */}
        {overlapInfo && (
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Estimated Audience Overlap</span>
              <p className="text-xs text-slate-500">How much common audience these two creators share based on niche, location, and platform.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 px-4 text-center">
                <span className="text-xs text-slate-400 block font-bold">Overlap</span>
                <span className="text-lg font-black text-indigo-700">{overlapInfo.overlapPercent}%</span>
              </div>
              <div className="text-slate-400 text-xxs font-medium max-w-[80px]">
                Confidence: <span className="font-bold text-slate-700 capitalize">{overlapInfo.confidence}</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Comparative Analysis */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-purple-600" /> AI Brand Alignment & Recommendation
          </h4>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4 text-slate-600 text-sm leading-relaxed font-normal whitespace-pre-line">
            {narrative}
          </div>
        </div>

        {/* Action Disclaimer */}
        <div className="flex items-center gap-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xxs text-amber-800">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Compare matrix calculations represent mathematical modeling of metrics. AI descriptions represent quantitative synthesis. Brands should confirm final terms with individual creators.</span>
        </div>
      </CardContent>
    </Card>
  );
}
