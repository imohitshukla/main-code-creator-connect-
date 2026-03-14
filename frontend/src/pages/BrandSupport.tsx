import { useState } from 'react';
import { Search, Package, ShieldCheck, Handshake, AlertTriangle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageTransition from '@/components/PageTransition';

export default function BrandSupport() {
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    "How does the Barter Protection Engine work?",
    "How is my budget secured with Razorpay Escrow?",
    "What happens if a creator misses a deadline?",
    "How do I use the 7-Step Deal Tracker?"
  ];

  const categories = [
    {
      title: "Campaigns & Barter Logistics",
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      faqs: [
        {
          q: "How do I ship a physical product for a Barter deal?",
          a: "When creating a Barter-only or Hybrid deal, input the Product Name and exact MRP. Once the creator accepts the digital SLA, their verified shipping address will unlock. You are required to input the tracking AWB into the dashboard to start the SLA countdown."
        },
        {
          q: "What is the Barter SLA (Service Level Agreement)?",
          a: "It is a binding digital contract. Once the creator marks the physical product as \"Received,\" they have a strict 14-day window to upload the first draft. Failure to do so results in platform penalties or a permanent ban."
        }
      ]
    },
    {
      title: "Escrow & Payments",
      icon: ShieldCheck,
      color: "text-green-500",
      bg: "bg-green-500/10",
      faqs: [
        {
          q: "When is my budget actually charged?",
          a: "For paid campaigns, your funds are captured upfront and held securely in our Razorpay-backed Escrow vault. The creator does not receive these funds until you hit the \"Approve Content\" button in Step 6 of the Deal Tracker."
        },
        {
          q: "What if I cancel a deal? How do refunds work?",
          a: "If a deal is mutually canceled before content production begins, or if a creator fails to deliver within the SLA, your Escrow funds are refunded directly to your original payment method without hassle."
        }
      ]
    },
    {
      title: "Collaboration & Approvals",
      icon: Handshake,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      faqs: [
        {
          q: "Can I ask the creator for revisions?",
          a: "Yes. During Step 5 (Review) of the Deal Tracker, you can review the creator's draft. If it doesn't meet the brief, use the in-built chat to request specific edits before approving the release of funds."
        },
        {
          q: "How do I know the creator's followers are real?",
          a: "Every creator on Creator Connect goes through a manual vetting process. We provide transparent, API-pulled audience demographics directly on their Media Kit so you know exactly who you are reaching."
        }
      ]
    },
    {
      title: "Trust, Safety & Disputes",
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      faqs: [
        {
          q: "What happens if a creator \"ghosts\" after receiving my product?",
          a: "Ghosting is a zero-tolerance offense on Creator Connect. If a creator violates the Barter SLA, they are permanently blacklisted from our network, losing access to all future brand deals. Our support team will also intervene to help recover the asset or its MRP value."
        },
        {
          q: "How do I open a dispute?",
          a: "If there is a fundamental disagreement on deliverables, you can pause the Escrow payout and click \"Request Platform Mediation\" inside the Deal Tracker. Our human QA team will step in to resolve it based on the original chat brief."
        }
      ]
    }
  ];

  return (
    <PageTransition className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
      {/* Hero Section */}
      <section className="bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-6">
            How can we help you scale today?
          </h1>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
            <Input 
              type="text" 
              placeholder="Search guides, tutorials, and FAQs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-6 text-lg rounded-2xl shadow-sm border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus-visible:ring-primary h-16"
            />
          </div>

          <div className="pt-8 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-2 mr-2">Quick Links:</span>
            {quickLinks.map((link, i) => (
              <button key={i} className="text-sm bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-full transition-colors border border-transparent flex-shrink-0 text-left">
                {link}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Core Categories Hub */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((category, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-xl ${category.bg} ${category.color}`}>
                  <category.icon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{category.title}</h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-neutral-100 dark:border-neutral-800">
                    <AccordionTrigger className="text-left font-semibold text-lg text-neutral-800 dark:text-neutral-200 hover:text-primary transition-colors py-4 px-2">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed pb-6 px-2">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-indigo-600 dark:bg-indigo-600 text-white rounded-3xl p-10 md:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Didn't find what you're looking for?</h2>
            <p className="text-lg md:text-xl text-white/90 font-medium pb-4">
              We don't do bots. Talk to our in-house campaign managers.
            </p>
            <div className="pt-4 flex justify-center">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-neutral-100 dark:bg-white dark:text-indigo-700 dark:hover:bg-neutral-100 rounded-full px-8 py-6 h-auto text-lg font-bold shadow-lg hover:-translate-y-1 transition-transform" asChild>
                <a href="mailto:creatorconnect.tech@gmail.com" className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  Chat with Concierge Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
