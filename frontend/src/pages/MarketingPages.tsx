
import React from 'react';
import CMSPage from './CMSPage';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Zap, BarChart3, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/* --- PLatform Page --- */
export const PlatformPage = () => (
    <CMSPage
        title="The All-in-One Creator Management Platform"
        subtitle="Streamline your entire influencer marketing workflow, from discovery to payment."
        content={
            <div className="space-y-16">
                {/* Feature Grid */}
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold">AI-Powered Discovery</h3>
                        <p className="text-muted-foreground text-lg">
                            Stop guessing. Our AI analyzes millions of data points to match you with creators who actually reach your target audience. Filter by niche, engagement rate, location, and audience demographics.
                        </p>
                        <ul className="space-y-2">
                            {['Audience Credibility Score', 'Lookalike Creator Search', 'Content Style Matching'].map(item => (
                                <li key={item} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-100 dark:border-purple-900/50">
                        {/* Placeholder for platform UI screenshot */}
                        <div className="aspect-video bg-background rounded-lg shadow-sm border flex items-center justify-center text-muted-foreground">
                            Interactive Discovery Dashboard
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="order-2 md:order-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/50">
                        <div className="aspect-video bg-background rounded-lg shadow-sm border flex items-center justify-center text-muted-foreground">
                            Campaign Analytics View
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold">Real-Time ROI Tracking</h3>
                        <p className="text-muted-foreground text-lg">
                            Track every click, conversion, and dollar spent. Our pixel integration and unique tracking links give you full visibility into campaign performance.
                        </p>
                        <ul className="space-y-2">
                            {['Automated Reporting', 'Cross-Platform Aggregation', 'Cost-Per-Acquisition (CPA) Analysis'].map(item => (
                                <li key={item} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
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
