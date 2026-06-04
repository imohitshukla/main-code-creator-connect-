import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/apiHelper';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Sparkles, BarChart3, TrendingUp, DollarSign, RefreshCw, ShieldAlert, Award, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function getCreatorTier(followers: any): string {
  const f = typeof followers === 'string' ? parseFloat(followers.replace(/[^0-9.]/g, '')) : (parseInt(followers, 10) || 0);
  let val = f;
  if (typeof followers === 'string') {
    const s = followers.trim().toLowerCase();
    if (s.endsWith('k')) val = f * 1000;
    if (s.endsWith('m')) val = f * 1000000;
  }
  if (val < 10000) return 'Nano';
  if (val < 50000) return 'Micro';
  if (val < 100000) return 'Mid-tier';
  if (val < 500000) return 'Macro';
  return 'Mega';
}

interface CreatorIntelReportProps {
  creatorId: string | number;
  creatorName: string;
  niche?: string;
}

export default function CreatorIntelReport({ creatorId, creatorName, niche }: CreatorIntelReportProps) {
  const { toast } = useToast();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCached, setHasCached] = useState(false);

  useEffect(() => {
    checkCachedReport();
  }, [creatorId]);

  const checkCachedReport = async () => {
    try {
      const res = await apiCall(`/api/ai/creator-intel/${creatorId}/cached`);
      if (res.ok) {
        const data = await res.json();
        if (data.hasReport) {
          setReport(data.report);
          setHasCached(true);
        }
      }
    } catch (err) {
      console.error('Error checking cached report:', err);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall(`/api/ai/creator-intel/${creatorId}`, {
        method: 'POST',
        body: JSON.stringify({
          campaignDescription: `Standard evaluation for ${niche || 'D2C'} brand collaboration.`,
          targetAudience: 'Indian youth and young professionals',
          budget: '₹25k - ₹50k'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setHasCached(true);
        toast({
          title: 'Pulse Report Ready!',
          description: `AI marketing Pulse analytics for ${creatorName} are ready.`,
        });
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate report');
      }
    } catch (err: any) {
      toast({
        title: 'Generation Failed',
        description: err.message || 'Could not connect to the AI model.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-indigo-100 shadow-soft bg-gradient-to-r from-indigo-50/30 to-purple-50/30 backdrop-blur-md">
        <CardContent className="p-12 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-medium text-indigo-700 animate-pulse">Running advanced analytics and AI synthesis...</p>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="border border-slate-100 shadow-soft bg-white/50 backdrop-blur-md overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-8 relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">CreatorConnect Pulse</h3>
            <p className="text-slate-500 max-w-md text-sm leading-relaxed">
              Unlock premium CreatorConnect Pulse analytics: verified mathematical analytics, engagement benchmarks, CPM valuations, and fraud audits.
            </p>
          </div>
          <Button 
            onClick={generateReport}
            className="rounded-xl px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-glow hover:scale-[1.02] transition-all duration-300"
          >
            Launch Pulse Agent ✨
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { scorecard, engagement, postingFreq, growth, quality, valuation, primaryPlatform, primaryFollowers, summaryText, scrapedAt } = report;

  // Split summaryText into paragraphs
  const paragraphs = summaryText
    ? summaryText.split('\n\n').filter(Boolean)
    : ["No analysis text generated."];

  return (
    <Card className="border border-slate-100 shadow-soft bg-white overflow-hidden">
      {/* Premium Header */}
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">CreatorConnect Pulse</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              Verified metrics as of {new Date(scrapedAt).toLocaleDateString()}
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateReport}
          className="gap-1.5 border-slate-200 text-slate-600 hover:text-indigo-600 rounded-lg"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Core Scores Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Circular Score Gauge */}
          <div className="col-span-1 md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="relative flex items-center justify-center">
              {/* SVG Ring */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-slate-200 fill-none" strokeWidth="8" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="54" 
                  className="stroke-indigo-600 fill-none transition-all duration-1000 ease-out" 
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 54} 
                  strokeDashoffset={2 * Math.PI * 54 * (1 - (scorecard?.overallScore || 70) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-slate-800">{scorecard?.overallScore || 70}</span>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Score</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full uppercase tracking-wider">
                {getCreatorTier(primaryFollowers)} tier
              </span>
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="col-span-1 md:col-span-8 grid grid-cols-2 gap-4">
            {/* Metric Item */}
            <div className="p-4 rounded-xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Engagement</span>
                <span className="text-lg font-bold text-slate-800">{engagement?.rate || 0}%</span>
                <span className="text-xxs text-slate-500 block">vs benchmark {quality?.benchmark || 2}%</span>
              </div>
            </div>

            {/* Metric Item */}
            <div className="p-4 rounded-xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Posting Frequency</span>
                <span className="text-lg font-bold text-slate-800">{postingFreq?.postsPerWeek || 0} /wk</span>
                <span className="text-xxs text-slate-500 block">Consistency: {Math.round((postingFreq?.consistency || 0) * 100)}%</span>
              </div>
            </div>

            {/* Metric Item */}
            <div className="p-4 rounded-xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Growth Velocity</span>
                <span className="text-lg font-bold text-slate-800">+{growth?.monthlyGrowthRate || 0}%/mo</span>
                <span className="text-xxs text-emerald-600 block font-medium capitalize">{growth?.trend || 'stable'}</span>
              </div>
            </div>

            {/* Metric Item */}
            <div className="p-4 rounded-xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Award className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Audience Quality</span>
                <span className="text-lg font-bold text-slate-800">{Math.round((quality?.score || 0.5) * 100)}%</span>
                <span className="text-xxs text-slate-500 block">Audited profile reach</span>
              </div>
            </div>
          </div>
        </div>


        {/* AI Analysis Summary */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-indigo-600" /> AI Qualitative Synthesis
          </h4>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4">
            {paragraphs.map((pText: string, idx: number) => (
              <p key={idx} className="text-slate-600 text-sm leading-relaxed font-normal">
                {pText}
              </p>
            ))}
          </div>
        </div>

        {/* Disclaimer info */}
        <div className="flex items-center gap-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xxs text-amber-800">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span>This intelligence scorecard represents a deterministic mathematical evaluation and qualitative synthesis based on public metrics. Actual creator rates and conversion values can vary.</span>
        </div>
      </CardContent>
    </Card>
  );
}
