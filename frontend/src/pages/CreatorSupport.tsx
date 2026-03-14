import { useState } from 'react';
import { Search, DollarSign, Package, Handshake, TrendingUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageTransition from '@/components/PageTransition';

export default function CreatorSupport() {
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    "When do I get paid from Escrow?",
    "How does the 0% Commission work?",
    "What are the rules for Barter Collabs?",
    "How do I handle brand revisions?"
  ];

  const categories = [
    {
      title: "Getting Paid (Escrow & Payouts)",
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
      faqs: [
        {
          q: "How does the Escrow system protect me?",
          a: "For paid campaigns, brands are required to deposit the full budget into our Razorpay-backed Escrow before you start working. This guarantees the money is locked in. Once the brand hits \"Approve Content,\" the funds are automatically released to your linked bank account. No more chasing invoices."
        },
        {
          q: "How much commission does Creator Connect take?",
          a: "0%. We believe creators should keep what they earn. There are no hidden fees or agency markups taken from your agreed payout. You receive 100% of the campaign budget."
        },
        {
          q: "How long do payouts take after approval?",
          a: "Once the brand approves your final content, Escrow releases the funds immediately. Depending on your bank, it typically reflects in your account within 24 to 48 business hours."
        }
      ]
    },
    {
      title: "Barter Deals & Logistics",
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      faqs: [
        {
          q: "What is the Barter SLA I have to sign?",
          a: "For barter deals, you must digitally agree to a 14-day delivery timeline. This means you commit to uploading the first content draft within 14 days of marking the physical product as \"Received.\""
        },
        {
          q: "What happens if I miss the 14-day Barter deadline?",
          a: "Missing deadlines damages platform trust. If you fail to deliver within the SLA without communicating with the brand, you risk having your profile temporarily frozen or permanently banned, and you may be liable to return the product."
        },
        {
          q: "What if the brand never ships the product?",
          a: "Your SLA countdown does not start until the brand inputs the tracking AWB and you physically receive the item. If a brand ghosts, simply cancel the deal in your dashboard without penalty."
        }
      ]
    },
    {
      title: "Content Approvals & Revisions",
      icon: Handshake,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      faqs: [
        {
          q: "How many revisions can a brand ask for?",
          a: "Brands can request revisions during Step 5 of the Deal Tracker. However, all requests must align with the original creative brief agreed upon in your chat."
        },
        {
          q: "What if a brand is being unreasonable or unresponsive?",
          a: "If a brand requests endless revisions outside the original brief, or goes silent for over 5 days after you upload the draft, click \"Request Platform Mediation.\" Our QA team will step in, review the chat history, and can manually release your Escrow funds if you fulfilled the brief."
        }
      ]
    },
    {
      title: "Profile & Account Settings",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      faqs: [
        {
          q: "How do I update my rates or media kit?",
          a: "Go to your 'Profile Settings' dashboard. You can update your bio, adjust your base rates, and link your latest Instagram analytics so brands always see your most up-to-date metrics."
        },
        {
          q: "How do I get the \"Verified\" blue checkmark on my profile?",
          a: "Blue checkmarks are awarded to creators who complete their KYC, link their social accounts for API verification, and successfully complete 3 campaigns on the platform with positive brand ratings."
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
            Focus on creating. We'll handle the business.
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
            <h2 className="text-3xl md:text-4xl font-bold">Still need help?</h2>
            <p className="text-lg md:text-xl text-white/90 font-medium pb-4">
              Our creator success team is here for you.
            </p>
            <div className="pt-4 flex justify-center">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-neutral-100 dark:bg-white dark:text-indigo-700 dark:hover:bg-neutral-100 rounded-full px-8 py-6 h-auto text-lg font-bold shadow-lg hover:-translate-y-1 transition-transform" asChild>
                <a href="mailto:creatorconnect.tech@gmail.com" className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  Message Creator Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
