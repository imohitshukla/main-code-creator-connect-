
import React from 'react';
import CMSPage from './CMSPage';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Zap, BarChart3, Globe2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

/* --- PLatform Page --- */
export const PlatformPage = () => (
    <CMSPage
        title="The All-in-One Creator Management Platform"
        subtitle="Streamline your entire influencer marketing workflow, from discovery to payment."
        content={
            <div className="space-y-16">
                {/* Feature Grid */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold">Vetted Creator Marketplace</h3>
                        <p className="text-muted-foreground text-lg">
                            Stop scrolling, start scaling. Access an exclusive roster of cinematic creators and lifestyle authorities. Every profile comes with verified audience demographics and a direct line to collaborate.
                        </p>
                        <ul className="space-y-2">
                            {['Verified Audience Insights: No more "fake followers"—see the real deal.', 
                              'Aesthetic-First Matching: Find creators who actually fit your brand’s visual identity.', 
                              'Direct-to-Creator Chat: Build relationships, not just one-off posts.'].map(item => (
                                <li key={item} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-100 dark:border-purple-900/50 h-full flex items-center justify-center">
                        <div className="aspect-video bg-background rounded-lg shadow-sm border flex items-center justify-center p-6 text-center text-muted-foreground w-full">
                            [Image: High-res screenshot of "Find Your Perfect Creator" grid showing Shivam and Abhishek]
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
                    <div className="order-2 md:order-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/50 h-full flex items-center justify-center">
                        <div className="aspect-video bg-background rounded-lg shadow-sm border flex items-center justify-center p-6 text-center text-muted-foreground w-full">
                            [Image: Screenshot of "Hire Shivam" modal showing Product Barter/MRP fields]
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold">The Barter Protection Engine™</h3>
                        <p className="text-muted-foreground text-lg">
                            Scaling high-ticket physical products shouldn't be a gamble. Our platform acts as your insurance policy, tracking every unit shipped and holding creators to a strict delivery timeline.
                        </p>
                        <ul className="space-y-2">
                            {['SLA Protection: Creators digitally sign a binding delivery agreement before you ship.', 
                              'MRP Tracking: Input your product value to ensure total inventory accountability.', 
                              'The 7-Step Deal Tracker: A live visual pipeline from "Offer Sent" to "Content Approved."'].map(item => (
                                <li key={item} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold">Razorpay-Backed Escrow</h3>
                        <p className="text-muted-foreground text-lg">
                            Take the stress out of payments. For paid campaigns, your budget is held securely in Escrow and is only released once you’ve approved the final content.
                        </p>
                        <ul className="space-y-2">
                            {['100% Control: You are the final authority on every release.', 
                              'Transparent Pricing: No hidden agency markups—what you pay goes to the creator.', 
                              'Instant Finalization: The second you hit "Approve," the deal is done.'].map(item => (
                                <li key={item} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-2xl p-8 border border-green-100 dark:border-green-900/50 h-full flex items-center justify-center">
                        <div className="aspect-video bg-background rounded-lg shadow-sm border flex items-center justify-center p-6 text-center text-muted-foreground w-full">
                            [Image: Screenshot of Escrow payment interface or success screen]
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center bg-muted/50 rounded-3xl p-12">
                    <h3 className="text-3xl font-bold mb-4">Ready to scale your influence?</h3>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Join 1,000+ brands using Creator Connect to drive measurable growth.</p>
                    <div className="flex justify-center gap-4">
                        <Button asChild size="lg"><Link to="/auth?mode=signup">Get Started Free</Link></Button>
                        <Button asChild variant="outline" size="lg"><Link to="/contact">Request Demo</Link></Button>
                    </div>
                </div>
            </div>
        }
    />
);

/* --- Agency Page --- */
export const AgencyPage = () => (
    <CMSPage
        title=""
        subtitle=""
        content={
            <div className="bg-black text-white p-8 md:p-16 rounded-3xl border border-neutral-800 shadow-2xl space-y-16">
                
                {/* Header Section */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <div className="inline-block bg-neutral-900 border border-neutral-800 text-neutral-300 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase mb-2">
                        🏛️ The "No-Hassle" Engine
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                        We Surf. We Catch. You Scale.
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-400 leading-relaxed font-light font-serif italic">
                        "Stop gambling on influencers. Stop chasing DMs. Stop losing sleep over ghosting. We’ve turned influencer marketing into a precision science so you can stop trying and start winning."
                    </p>
                </div>

                {/* Workflow Section */}
                <div className="pt-8 border-t border-neutral-800">
                    <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3">
                        <span className="text-4xl text-blue-500">🌊</span> The "Surf & Catch" Logic
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { 
                                icon: '🏄', 
                                step: '1. We Surf (The Hunt)', 
                                desc: "Our team is constantly scanning the grid for the 'Main Characters.' We don't just look at follower counts; we look at cinematic quality, engagement velocity, and brand fit. We find the creators before they go viral, so you get the best ROI." 
                            },
                            { 
                                icon: '🎣', 
                                step: '2. We Catch (The Lockdown)', 
                                desc: "Once we find the talent, we reel them in. We handle the outreach, the brief alignment, and the legal SLAs. We use our Barter Protection Engine to ensure every 'catch' is a guaranteed delivery. Your inventory is never at risk." 
                            },
                            { 
                                icon: '💰', 
                                step: '3. You Bet (The Scale)', 
                                desc: "You choose the creator. You set the goal. You bet on the talent we've secured. With our Razorpay Escrow, your money stays in your pocket until the content is live and approved. No hassle. No drama. Just results." 
                            }
                        ].map((card, idx) => (
                            <div key={idx} className="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 hover:border-neutral-600 transition-colors relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform duration-500">{card.icon}</div>
                                <div className="text-4xl mb-6">{card.icon}</div>
                                <h3 className="text-2xl font-bold mb-4 text-neutral-100">{card.step}</h3>
                                <p className="text-neutral-400 leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Brands Bet Section */}
                <div className="pt-12 pb-8">
                    <div className="max-w-3xl mx-auto bg-neutral-900 rounded-3xl p-8 md:p-12 border border-neutral-800">
                        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
                            <span className="text-red-500">🚀</span> Why Brands "Bet" on Creator Connect
                        </h2>
                        <ul className="space-y-6">
                            {[
                                { title: 'Zero Agency Markup:', desc: 'You pay what the creator gets.' },
                                { title: 'Total Transparency:', desc: 'Watch the 7-Step Tracker like a hawk. You’ll see the second the product is received and the second the draft is ready.' },
                                { title: 'Founders-to-Founders:', desc: 'We move at your speed. No corporate red tape.' }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                        ✓
                                    </div>
                                    <div>
                                        <span className="font-bold text-neutral-200 block md:inline mr-2">{item.title}</span>
                                        <span className="text-neutral-400">{item.desc}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="mt-12 flex justify-center">
                            <Button size="lg" className="bg-white text-black hover:bg-neutral-200 px-8 py-6 text-lg rounded-full font-bold w-full md:w-auto" asChild>
                                <Link to="/contact">Enter The War Room (Contact Sales)</Link>
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        }
    />
);

/* --- Careers Page --- */
export const CareersPage = () => (
    <CMSPage
        title="Careers"
        subtitle="Join our team."
        content={
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🚧</span>
                </div>
                <h3 className="text-2xl font-bold">Under Updates</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    We are currently updating our careers page and open positions. Please check back soon.
                </p>
                <div className="mt-8">
                    <Button asChild variant="outline"><Link to="/">Back to Home</Link></Button>
                </div>
            </div>
        }
    />
);
