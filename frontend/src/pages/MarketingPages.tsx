
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
        title="Agency Services"
        subtitle="White-glove influencer marketing for enterprise brands."
        content={
            <div className="space-y-12 text-lg text-muted-foreground">
                <p className="lead text-2xl font-medium text-foreground">
                    Don't have the time to manage campaigns? Let our in-house experts handle it.
                </p>
                <div className="grid md:grid-cols-3 gap-8 my-12">
                    {[
                        { title: 'Strategy', desc: 'Custom campaign roadmaps aligned with Q4 goals.' },
                        { title: 'Talent', desc: 'Access to exclusive, high-tier creators not on the public list.' },
                        { title: 'Execution', desc: 'End-to-end management: briefs, contracts, approvals, and payouts.' }
                    ].map(card => (
                        <div key={card.title} className="bg-card p-8 rounded-xl border shadow-sm">
                            <h3 className="text-xl font-bold text-foreground mb-3">{card.title}</h3>
                            <p>{card.desc}</p>
                        </div>
                    ))}
                </div>
                <p>
                    From product launches to brand ambassador programs, our agency team acts as an extension of your marketing department. We guarantee specific reach and engagement KPIs.
                </p>
                <div className="flex justify-center mt-8">
                    <Button size="lg" asChild><Link to="/contact">Contact Sales</Link></Button>
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
