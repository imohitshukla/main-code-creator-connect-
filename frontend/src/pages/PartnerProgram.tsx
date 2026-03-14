import { Building2, Users, Target, ShieldCheck, HeadphonesIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';

export default function PartnerProgram() {
  // We'll use a mailto link as the default CTA per the developer brief
  const partnerApplicationLink = "mailto:creatorconnect.tech@gmail.com?subject=Partner%20Application";

  return (
    <PageTransition className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
      {/* Hero Section */}
      <section className="bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-block bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase mb-2">
            Creator Connect Partnership
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-6">
            Scale your agency. We'll provide the infrastructure.
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Creator Connect is the operating system for modern Talent Managers and PR Agencies. Bring your roster or your brands, and let our tech handle the contracts, escrow, and tracking.
          </p>
          <div className="pt-8">
            <Button size="lg" className="rounded-full px-8 py-6 h-auto text-lg hover:-translate-y-1 transition-transform" asChild>
              <a href={partnerApplicationLink}>
                Apply for Partnership <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Choose Your Track (Split Layout) */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
            Choose Your Track
          </h2>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card 1: Talent Managers */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 md:p-12 border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              🌟
            </div>
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-8">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-50">
              For Talent Managers & Boutique Agencies
            </h3>
            <h4 className="text-xl font-semibold mb-4 text-amber-600 dark:text-amber-500">Monetize Your Roster</h4>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 leading-relaxed">
              Stop chasing brand payments in WhatsApp. Onboard your exclusive talent to Creator Connect and get them in front of top-tier D2C brands.
            </p>
            <ul className="space-y-4">
              {[
                { title: 'Guaranteed Payouts:', desc: 'Razorpay Escrow ensures you and your talent get paid on time, every time.' },
                { title: 'Deal Flow:', desc: 'Access our pipeline of vetted brand mandates.' },
                { title: 'Centralized Tracking:', desc: 'Manage 10+ creators from one dashboard without the chaos.' }
              ].map((item, idx) => (
                <li key={idx} className="flex flex-col sm:flex-row gap-2">
                  <span className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-200 shrink-0">
                    <span className="text-amber-500">✓</span> {item.title}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: PR & Marketing Agencies */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 md:p-12 border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              🏢
            </div>
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-8">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-50">
              For PR & Marketing Agencies
            </h3>
            <h4 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-500">Supercharge Your Client Campaigns</h4>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 leading-relaxed">
              Don't have an in-house influencer team? Use our platform as a white-glove extension for your brand clients.
            </p>
            <ul className="space-y-4">
              {[
                { title: 'Vetted Network:', desc: 'Instant access to our exclusive, high-ROI creator network.' },
                { title: 'Zero Inventory Risk:', desc: 'Use our Barter Protection Engine to secure your clients\' physical products.' },
                { title: 'Client Reporting:', desc: 'Use our 7-Step Deal Tracker to show your clients real-time campaign progress.' }
              ].map((item, idx) => (
                <li key={idx} className="flex flex-col sm:flex-row gap-2">
                  <span className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-200 shrink-0">
                    <span className="text-purple-500">✓</span> {item.title}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The Partner Benefits (Grid Layout) */}
      <section className="bg-white dark:bg-black border-y border-neutral-200 dark:border-neutral-800 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
              The Partner Benefits
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            {[
              {
                icon: Target,
                title: 'Revenue Share',
                desc: 'Earn volume-based incentives and priority placement for bringing top-tier brands or creators to the ecosystem.',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
              },
              {
                icon: ShieldCheck,
                title: 'Legal & Compliance Handled',
                desc: 'We generate the digital SLAs and handle the Escrow. You focus on strategy; we absorb the operational friction.',
                color: 'text-green-500',
                bg: 'bg-green-50'
              },
              {
                icon: HeadphonesIcon,
                title: 'Dedicated Account Manager',
                desc: 'Enterprise partners get a direct line to our founding team to request custom features and tailored talent shortlists.',
                color: 'text-purple-500',
                bg: 'bg-purple-50'
              }
            ].map((benefit, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-shadow">
                <div className={`w-14 h-14 mx-auto md:mx-0 ${benefit.bg} dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-6`}>
                  <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-neutral-50">{benefit.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="bg-neutral-900 dark:bg-neutral-900 text-white rounded-[2.5rem] p-12 md:p-20 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Ready to upgrade your operations?
            </h2>
            <p className="text-xl md:text-2xl text-neutral-300 font-medium pb-4 max-w-2xl mx-auto">
              Join the network of agencies powering the future of the creator economy.
            </p>
            <div className="pt-4 flex justify-center">
              <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-full px-10 py-7 h-auto text-xl font-bold shadow-xl hover:-translate-y-1 transition-transform" asChild>
                <a href={partnerApplicationLink}>
                  Submit Partner Application
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
