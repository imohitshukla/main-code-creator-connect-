import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import PageTransition from '@/components/PageTransition';
import SEO from '@/components/SEO';
import { ArrowRight, Calendar, User, Clock } from 'lucide-react';

export const BLOG_POSTS = [
    {
        id: "how-to-start-creator-collaboration",
        title: "How to Start a Creator Collaboration: A Step-by-Step Guide for Brands",
        excerpt: "Learn the exact process for finding vetted influencers, negotiating barter vs. paid deals, and running a successful creator collaboration campaign without agency fees.",
        author: "Creator Connect Team",
        date: "April 4, 2026",
        readTime: "5 min read",
        category: "Brand Guides",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
        content: `
## Why Creator Collaborations Matter in 2026

If you are a D2C brand trying to scale, you already know that traditional ads are getting more expensive. The solution? **Creator collaborations**. 

A successful creator collaboration builds instant trust, taps into pre-existing communities, and generates authentic UGC (User Generated Content) that you can repurpose for your ads. 

But how do you actually start one?

## Step 1: Define Your Goal (Barter vs. Paid)

Before reaching out, decide what you want:
*   **Barter Deals:** You send a free product in exchange for a dedicated reel or story. Ideal for micro-influencers (<50k followers).
*   **Paid Collaborations:** You pay a flat fee. Required for mid-tier and macro-influencers, and guarantees creative control and usage rights.

## Step 2: Scout Vetted Creators

Finding the right creator is the hardest part. Do not rely on random Instagram outreach where DMs get lost. 

Instead, use a creator marketplace like **Creator Connect**. Our platform allows you to filter creators by niche, engagement rate, and audience demographics—ensuring you find the perfect match instantly.

## Step 3: Use a Visual Deal Tracker

The biggest mistake brands make is managing campaigns via chaotic WhatsApp threads. 

With **Creator Connect**, you get a 7-step visual deal tracker. From the initial pitch to content approval and final escrow payment via Razorpay, every step is automated and transparent. 

## Conclusion

Starting a creator collaboration doesn't have to mean paying 20% commission to an agency. By using the right creator tech platform, you can scale your influencer marketing in-house. 
        `
    },
    {
        id: "best-tools-for-creator-connect",
        title: "Top 5 Tools for Creator Connect and Influencer Management",
        excerpt: "Stop managing influencer campaigns in Google Sheets. Discover the top platforms and tools that modern brands use to manage creator connect pipelines.",
        author: "Creator Connect Team",
        date: "April 2, 2026",
        readTime: "4 min read",
        category: "Industry Trends",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
        content: `
## The Shift from Agencies to SaaS

Brands are realizing that traditional influencer agencies are too slow and too expensive. The future of influencer marketing is SaaS-driven. Here are the top tools you need to manage a seamless creator connect pipeline.

### 1. Creator Connect (The OS for Creators)
Yes, we are biased, but **Creator Connect** is the only platform in India that offers an end-to-end OS for creators and brands. With zero agency fees, a built-in visual pipeline tracker, and Razorpay-powered escrow, it replaces half a dozen disparate tools.

### 2. Notion
For drafting creative briefs and mood boards. We recommend creating a standard "Creator Brief" template in Notion that you can duplicate for every new campaign.

### 3. Figma
For reviewing video thumbnails and static UGC assets before they go live. 

### 4. Razorpay Escrow
If you aren't using a platform that has built-in escrow, you run the risk of creators ghosting after payment, or brands delaying invoices for 90 days. Always use escrow for safe creator collaborations.

### 5. Instagram Insights
The classic. Always ask creators to screen-record their last 30 days of Instagram Insights. Static screenshots can be easily faked. 

## The All-in-One Solution
Why pay for multiple tracking tools when you can have it all in one place? Creator Connect brings discovery, negotiation, approval, and payments under one roof.
        `
    },
    {
        id: "collab-strategies-for-creators",
        title: "How to Pitch Brands for High-Paying Collaborations",
        excerpt: "Are you a creator struggling to get brand deals? Learn how to optimize your portfolio and pitch brands directly for high-paying collabs.",
        author: "Creator Connect Team",
        date: "March 28, 2026",
        readTime: "6 min read",
        category: "Creator Tips",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
        content: `
## Stop Waiting for Inbound DMs

If you want to turn your content into a full-time business, you cannot sit and wait for brands to DM you. You need a proactive strategy for sourcing brand collaborations.

### 1. Build a Professional Public Profile
Your Instagram bio is not enough. Brands need to see your engagement rates, audience demographics, and past campaign ROI. 

Create a free **Public Profile on Creator Connect**. It acts as your dynamic media kit. When you send it to a brand, they can see your verified stats and immediately initiate a deal request without leaving the platform.

### 2. Focus on Engagement, Not Followers
Brands care about conversions. A creator with 10k highly engaged followers will secure more paid collaborations than a creator with 100k fake followers. In your pitches, highlight your CTR (Click-Through Rate) on stories.

### 3. The "Free Sample" Pitch
If you really want to work with a specific brand but they are hesitant, offer a risk-free trial. Propose a barter deal for a piece of UGC (User Generated Content) they can use for their ads. If the ad performs well, negotiate a retainer for 4 videos a month.

### 4. Use Secure Payment Platforms
Never start work without an advance or a secure escrow agreement. Platforms like **Creator Connect** protect creators by holding the brand's funds in escrow until the collaboration is approved. No more chasing unpaid invoices.
        `
    }
];

const Blog = () => {
    return (
        <PageTransition className="min-h-screen bg-gradient-subtle pt-24 pb-20">
            <SEO 
                title="Blog | Influencer Marketing & Creator Collab Tips"
                description="Read the latest guides on how to start creator collaborations, the best influencer marketing tools, and tips for growing your creator business."
                path="/blog"
            />
            
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
                        Creator Connect <span className="text-primary">Insights</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Actionable strategies to scale your brand with creator collaborations and influencer marketing.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post, index) => (
                        <div 
                            key={post.id} 
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <Link to={`/blog/${post.id}`} className="block group h-full">
                                <Card className="h-full border-0 shadow-soft hover:-translate-y-1 hover:shadow-hover transition-all duration-300 overflow-hidden bg-gradient-card">
                                    <div className="relative h-48 overflow-hidden">
                                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10" />
                                        <img 
                                            src={post.image} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex flex-col h-[calc(100%-12rem)]">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {post.date}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {post.readTime}
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-3">
                                            {post.title}
                                        </h2>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-auto flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                                            Read Article <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </PageTransition>
    );
};

export default Blog;
