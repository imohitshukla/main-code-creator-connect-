import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '@/utils/apiHelper';
import PageTransition from '@/components/PageTransition';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { 
  Terminal, Sparkles, AlertTriangle, ShieldCheck, 
  ArrowRight, Activity, TrendingUp, Heart, Share2, 
  Info, ExternalLink, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

// Logs to simulate scraping progress
const LOG_PHASES = [
  "[sys] Establishing secure connection to profile crawler API...",
  "[sys] Handshake successful. Resolving target profile headers...",
  "[sys] Fetching historical feed nodes (last 50 media documents)...",
  "[sys] Processing 50 media node datasets...",
  "[sys] Parsing comments block (sample size 1,000 interactions)...",
  "[sys] Spawning Python worker process (pulse_analyzer.py)...",
  "[sys] Calculating comment-to-like ratio variance (bot validation)...",
  "[sys] Fitting exponential content decay curves (shelf-life modeling)...",
  "[sys] Running lexical NLP sentiment analysis model...",
  "[sys] Evaluating cross-platform migration conversion funnel...",
  "[sys] Telemetry block compiled. Sending to OpenAI (gpt-4o)...",
  "[sys] AI analysis report synthesized.",
  "[sys] Formatting dashboard datasets. Launching clinical dashboard..."
];

const SUGGESTED_CREATORS = [
  { name: "Anmol Warikoo", url: "https://www.instagram.com/anmolwarikoo" },
  { name: "Technical Guruji", url: "https://www.youtube.com/@TechnicalGuruji" },
  { name: "BeerBiceps", url: "https://www.youtube.com/@BeerBiceps" },
  { name: "Ranveer Allahbadia", url: "https://www.instagram.com/ranveerallahbadia" }
];

export default function PulseSandbox() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState<'input' | 'scraping' | 'results'>('input');
  
  // Terminal logs state
  const [logs, setLogs] = useState<string[]>([]);
  const [currentLogIdx, setCurrentLogIdx] = useState(0);
  
  // Response data state
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Log simulation effect
  useEffect(() => {
    if (stage === 'scraping') {
      const interval = setInterval(() => {
        if (currentLogIdx < LOG_PHASES.length) {
          setLogs(prev => [...prev, LOG_PHASES[currentLogIdx]]);
          setCurrentLogIdx(prev => prev + 1);
        } else {
          clearInterval(interval);
          if (data) {
            setStage('results');
          }
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [stage, currentLogIdx, data]);

  // Execute Analysis
  const handleAnalyze = async (inputUrl: string = url) => {
    const targetUrl = inputUrl.trim();
    if (!targetUrl) {
      toast({
        title: "Input required",
        description: "Please specify a creator profile URL.",
        variant: "destructive"
      });
      return;
    }

    setUrl(targetUrl);
    setLogs([`cc-pulse:~$ analyze --url "${targetUrl}"`]);
    setCurrentLogIdx(0);
    setStage('scraping');
    setIsLoading(true);

    try {
      const res = await apiCall('/api/ai/pulse', {
        method: 'POST',
        body: JSON.stringify({ url: targetUrl })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'API execution failed');
      }

      const resData = await res.json();
      setData(resData);
    } catch (err: any) {
      toast({
        title: "Telemetry Sweep Failed",
        description: err.message || "An error occurred during sandbox evaluation.",
        variant: "destructive"
      });
      setStage('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setLogs([]);
    setData(null);
    setStage('input');
  };

  // Pie Chart Colors
  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#64748b'];

  // Prepare Sentiment Chart Data
  const getSentimentData = () => {
    if (!data?.pulseMetrics?.sentiment) return [];
    const sentiment = data.pulseMetrics.sentiment;
    return [
      { name: 'Parasocial', value: sentiment.parasocial },
      { name: 'Transactional', value: sentiment.transactional },
      { name: 'Critical', value: sentiment.critical },
      { name: 'General', value: sentiment.general }
    ];
  };

  // Prepare Decay Curve Chart Data
  const getDecayData = () => {
    if (!data?.pulseMetrics?.decay_rate) return [];
    const hl = data.pulseMetrics.decay_rate.half_life_hours;
    const decayK = data.pulseMetrics.decay_rate.decay_coefficient;
    
    // Generate exponential decay curve: E(t) = 100 * e^(-k * t)
    const points = [];
    for (let t = 0; t <= 120; t += 12) {
      points.push({
        hour: `${t}h`,
        Engagement: Math.round(100 * Math.exp(-decayK * t))
      });
    }
    return points;
  };

  return (
    <PageTransition className="min-h-screen bg-[#070a13] text-slate-100 font-sans pb-20 pt-24">
      <SEO
        title="The Pulse — Enterprise Creator Telemetry Sandbox"
        description="Clinical, zero-financial audience intelligence engine sandbox. Drop a URL and analyze engagement authenticity, comment sentiment NLP, and post half-life decay rates."
        path="/pulse"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Premium Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Data Science Sandbox
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-4">
            The Pulse Analytics Engine
          </h1>
          <p className="text-base md:text-lg text-slate-400">
            Audit any Instagram or YouTube creator. Our microservice executes mathematical sweeps, sentiment NLP calculations, and decay modeling—completely isolated from campaign budgets.
          </p>
        </div>

        {/* ──────────── INPUT STAGE ──────────── */}
        {stage === 'input' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
            <Card className="border border-slate-800 bg-[#0c1224] shadow-2xl overflow-hidden rounded-2xl">
              <div className="bg-slate-900 px-6 py-4 flex items-center gap-2 border-b border-slate-800/80">
                <div className="w-3 h-3 bg-rose-500 rounded-full" />
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="ml-2 text-xs font-mono text-slate-500">cc-pulse:~$ guest-session</span>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="creator-url" className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    Creator Profile URL (Instagram or YouTube)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-indigo-500 font-bold">$</span>
                      <input
                        id="creator-url"
                        type="text"
                        placeholder="https://www.instagram.com/creator_handle"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        className="w-full pl-8 pr-4 py-4 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-100 font-mono placeholder:text-slate-600 text-sm"
                      />
                    </div>
                    <Button 
                      onClick={() => handleAnalyze()}
                      className="rounded-xl px-6 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-glow hover:scale-[1.01]"
                    >
                      Run Telemetry Sweep <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-850">
                  <span className="text-xs text-slate-500 block mb-3 font-semibold uppercase tracking-wider">Click one to test instantly:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUGGESTED_CREATORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => handleAnalyze(c.url)}
                        className="p-3 text-left rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors text-xs flex justify-between items-center group font-medium"
                      >
                        <span className="text-slate-350 font-mono">{c.name}</span>
                        <span className="text-indigo-400 flex items-center gap-1 group-hover:underline">
                          Run
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ──────────── SCRAPING STATE ──────────── */}
        {stage === 'scraping' && (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
            <Card className="border border-slate-800 bg-[#090e1b] shadow-2xl rounded-2xl overflow-hidden">
              <div className="bg-slate-900/60 px-6 py-3 flex items-center border-b border-slate-800/80">
                <Terminal className="w-4 h-4 text-indigo-400 mr-2" />
                <span className="text-xs font-mono text-slate-400">Auditing: {url}</span>
              </div>
              <CardContent className="p-6 bg-slate-950/80 min-h-[300px] max-h-[400px] overflow-y-auto font-mono text-sm leading-relaxed text-indigo-300">
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className={log.startsWith('cc-pulse') ? 'text-slate-400 font-bold' : ''}>
                      {log}
                    </div>
                  ))}
                  {currentLogIdx < LOG_PHASES.length && (
                    <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                      <span className="inline-block w-2.5 h-4 bg-indigo-400 animate-pulse" />
                      Processing...
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ──────────── RESULTS STATE ──────────── */}
        {stage === 'results' && data && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Top Stats Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0c1224] p-6 rounded-2xl border border-slate-800/80 shadow-lg">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
                  <Activity className="w-6 h-6 text-indigo-500" />
                  @{data.handle}
                </h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                  Verified Platform: <span className="text-indigo-400 font-bold font-mono">{data.platform}</span> • Audit run: {new Date(data.scrapedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-xl border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyze New Creator
              </Button>
            </div>

            {/* Core Calculations Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Radial Digital Health Score Gauge */}
              <div className="col-span-1 md:col-span-4 bg-[#0c1224] p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-lg relative group">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6 block">Digital Health Score</span>
                <div className="relative flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="68" className="stroke-slate-900 fill-none" strokeWidth="8" />
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="68" 
                      className="stroke-indigo-500 fill-none transition-all duration-1000 ease-out" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 68} 
                      strokeDashoffset={2 * Math.PI * 68 * (1 - (data.pulseMetrics.health_score || 75) / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-4xl font-extrabold text-white">{data.pulseMetrics.health_score}</span>
                    <span className="text-xs text-indigo-400 block font-semibold uppercase tracking-widest mt-0.5">Index</span>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="text-xs font-mono px-3 py-1 bg-indigo-950 text-indigo-400 border border-indigo-900/50 rounded-full font-bold uppercase tracking-wider">
                    {data.followers.toLocaleString()} Audience Pool
                  </span>
                </div>
              </div>

              {/* Data Science Telemetry Grid */}
              <div className="col-span-1 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. Audience Authenticity */}
                <div className="bg-[#0c1224] p-6 rounded-2xl border border-slate-800/80 shadow-md space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Audience Authenticity</span>
                      <span className="text-2xl font-extrabold text-white mt-1 block">
                        {data.pulseMetrics.authenticity_score}%
                      </span>
                    </div>
                    {data.pulseMetrics.authenticity_details.bot_flag ? (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Anomalous</span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Healthy</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {data.pulseMetrics.authenticity_details.description}
                  </p>
                  <div className="pt-2 border-t border-slate-850 grid grid-cols-2 gap-2 text-xxs text-slate-500 font-mono">
                    <div>Likes σ: {data.pulseMetrics.authenticity_details.likes_stddev}</div>
                    <div>Comments σ: {data.pulseMetrics.authenticity_details.comments_stddev}</div>
                  </div>
                </div>

                {/* 2. Content Decay Rate */}
                <div className="bg-[#0c1224] p-6 rounded-2xl border border-slate-800/80 shadow-md space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Content Half-Life</span>
                      <span className="text-2xl font-extrabold text-white mt-1 block">
                        {data.pulseMetrics.decay_rate.half_life_hours} Hrs
                      </span>
                    </div>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Calculated</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Engagement shelf-life curve index: <span className="text-slate-200 font-bold">{data.pulseMetrics.decay_rate.long_tail_value}</span> evergreening potential.
                  </p>
                  <div className="pt-2 border-t border-slate-850 text-xxs text-slate-500 font-mono">
                    Decay Coefficient λ: {data.pulseMetrics.decay_rate.decay_coefficient}
                  </div>
                </div>

                {/* 3. Overlap / Funnel */}
                <div className="bg-[#0c1224] p-6 rounded-2xl border border-slate-800/80 shadow-md space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Cross-Platform Overlap</span>
                      <span className="text-2xl font-extrabold text-white mt-1 block">
                        {data.pulseMetrics.cross_platform.overlap_ratio}%
                      </span>
                    </div>
                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Estimated</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Estimated migration overlap between core visual platforms and secondary search hubs.
                  </p>
                  <div className="pt-2 border-t border-slate-850 text-xxs text-slate-500 font-mono">
                    Efficiency: {data.pulseMetrics.cross_platform.migration_efficiency}
                  </div>
                </div>

                {/* 4. Audience Semantics */}
                <div className="bg-[#0c1224] p-6 rounded-2xl border border-slate-800/80 shadow-md space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Audience Semantics</span>
                      <span className="text-2xl font-extrabold text-white mt-1 block">
                        {data.pulseMetrics.sentiment.transactional}% Commercial
                      </span>
                    </div>
                    <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">NLP</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Comments categorize as <span className="text-slate-200 font-semibold">{data.pulseMetrics.sentiment.parasocial}% Parasocial</span> (adoration) and <span className="text-slate-200 font-semibold">{data.pulseMetrics.sentiment.critical}% Critical</span>.
                  </p>
                  <div className="pt-2 border-t border-slate-850 text-xxs text-slate-500 font-mono flex justify-between">
                    <span>Transactional: {data.pulseMetrics.sentiment.transactional}%</span>
                    <span>Critical: {data.pulseMetrics.sentiment.critical}%</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Engagement decay line chart */}
              <div className="col-span-1 lg:col-span-7 bg-[#0c1224] p-6 rounded-2xl border border-slate-800/80 shadow-lg space-y-6">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Engagement Shelf-Life & Velocity Decay</h3>
                  <p className="text-xs text-slate-400 mt-1">Calculates relative engagement degradation over 120 hours following post-publication.</p>
                </div>
                <div className="h-64 w-full font-mono text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getDecayData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="decayColor" cx="0" cy="0" r="1" gradientTransform="rotate(90)">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                      />
                      <Area type="monotone" dataKey="Engagement" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#decayColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sentiment Pie chart */}
              <div className="col-span-1 lg:col-span-5 bg-[#0c1224] p-6 rounded-2xl border border-slate-800/80 shadow-lg space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Semantic Comment Classification</h3>
                  <p className="text-xs text-slate-400 mt-1">NLP categorizations of user interactions sorted by conversational archetype.</p>
                </div>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getSentimentData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {getSentimentData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xxs font-mono text-slate-450 border-t border-slate-850 pt-4">
                  {getSentimentData().map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index] }} />
                      <span>{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* AI Narrative Report */}
            <div className="bg-[#0c1224] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                  <span className="text-xs font-mono text-slate-350">telemetry_audit_report.md</span>
                </div>
                <span className="text-xxs font-mono bg-indigo-950 text-indigo-400 border border-indigo-900/50 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                  Lead Data Scientist AI
                </span>
              </div>
              <div className="p-8 prose prose-invert max-w-none prose-sm leading-relaxed text-slate-350 font-normal">
                <div className="markdown-body space-y-4">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold text-slate-100 mt-6 mb-2 border-b border-slate-800 pb-1 first:mt-0" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-bold text-indigo-400 mt-5 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-sm font-semibold text-slate-200 mt-4 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="text-xs text-slate-300 leading-relaxed mb-4" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-4 text-xs text-slate-300" {...props} />,
                      li: ({node, ...props}) => <li className="marker:text-indigo-500" {...props} />,
                      code: ({node, ...props}) => <code className="bg-slate-950 text-indigo-300 px-1 rounded font-mono text-xxs border border-slate-900" {...props} />,
                    }}
                  >
                    {data.aiReport}
                  </ReactMarkdown>
                </div>
              </div>
              
              {/* Disclaimer info */}
              <div className="bg-slate-950 px-6 py-4 border-t border-slate-800/80 flex items-center gap-2.5 text-xxs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Clinical sandbox evaluation complete. No campaign budgets, pricing metrics, or rate variables were referenced or analyzed.</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </PageTransition>
  );
}
