import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, MessageSquareX, BadgeDollarSign, GitPullRequestArrow } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { CreatorList } from '@/components/CreatorList';
import SEO from '@/components/SEO';
import { HeroDemo } from '@/components/ui/demo';

// ✏️ Replace with your actual Calendly link
const CALENDLY_URL = 'https://calendly.com/creatorconnect/15min';

const Home = () => {
  return (
    <PageTransition className="min-h-screen bg-background">
      <main>
      <SEO
        title="Creator Connect — Brand-Creator Collaboration Marketplace"
        description="Creator Connect is India's #1 marketplace for brand-creator collaborations. Find vetted creators, run barter and paid deals with a visual 7-step tracker, and pay securely via Razorpay escrow. Zero agency fees."
        path="/"
      />
      {/* Hero Section */}
      <HeroDemo />

      {/* ──────────────────────────────────────────────
          LIVE DEAL TRACKER SPOTLIGHT
      ────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">

          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              ✦ Your Biggest Advantage
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              The Live Deal Tracker
            </h2>
            <p className="text-lg text-muted-foreground">
              Replace your WhatsApp group threads and email chains with a visual approval pipeline — from pitch to payment, in one screen.
            </p>
          </div>

          {/* 3-column pain → solution cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: <MessageSquareX className="w-6 h-6 text-red-500" />,
                bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40',
                label: 'Before: WhatsApp chaos',
                points: ['Approvals lost in chat', 'No single source of truth', 'Brands chasing creators on DM'],
                bad: true,
              },
              {
                icon: <GitPullRequestArrow className="w-6 h-6 text-primary" />,
                bg: 'bg-primary/5 border-primary/20',
                label: 'Creator Connect Deal Tracker',
                points: ['Visual stage pipeline', 'Built-in consent gate & approval flow', 'Rejection & revision loop built in'],
                bad: false,
              },
              {
                icon: <BadgeDollarSign className="w-6 h-6 text-green-600" />,
                bg: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/40',
                label: 'Affordable. Always.',
                points: ['Transparent, flat pricing', 'No hidden cuts or markups', 'More budget goes to the creator'],
                bad: false,
              },
            ].map((card) => (
              <div key={card.label} className={`rounded-2xl border p-6 ${card.bg}`}>
                <div className="mb-4">{card.icon}</div>
                <h3 className="font-bold text-base mb-4">{card.label}</h3>
                <ul className="space-y-2">
                  {card.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${card.bad ? 'text-red-400' : 'text-green-500'}`} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Deal pipeline mockup */}
          <div className="bg-background rounded-2xl border shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="bg-muted/60 px-6 py-3 flex items-center gap-2 border-b">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">creatorconnect.tech/deals/123</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Proposed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', active: false },
                  { label: 'Accepted', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', active: false },
                  { label: 'Logistics', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', active: true },
                  { label: 'Approval', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', active: false },
                  { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', active: false },
                ].map((stage, i) => (
                  <div
                    key={stage.label}
                    className={`rounded-xl p-4 text-center text-sm font-semibold transition-all border-2 ${stage.color} ${stage.active ? 'border-amber-400 scale-105 shadow-lg' : 'border-transparent'}`}
                  >
                    <div className="text-xs font-medium mb-1">Step {i + 1}</div>
                    {stage.label}
                    {stage.active && <div className="text-xs mt-1 font-normal">← You are here</div>}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                <div className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium text-center">✓ Approve Content</div>
                <div className="px-4 py-2 bg-muted border text-sm rounded-lg font-medium text-center">Request Revision</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CreatorList />

      {/* Final CTA */}
      <section className="py-32 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight">
            Ready to scale your <br /> influencer program?
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-20">
            Join forward-thinking brands using Creator Connect to run clean, trackable influencer campaigns — no agency middleman, no WhatsApp chaos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full shadow-xl hover:scale-105 transition-transform">
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                Book a 15-min Demo — It's Free
              </a>
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/50 mt-6">No commitment. Book for tomorrow.</p>
        </div>
      </section>
      </main>
    </PageTransition>
  );
};

export default Home;