
import { Users, Globe, Award, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import SEO from '@/components/SEO';

const About = () => {
    const stats = [
        { label: 'Vetted Creators', value: '500+', icon: Users },
        { label: 'Agency Fees', value: '0%', icon: Award },
        { label: 'Secured', value: 'Razorpay', icon: Globe },
        { label: 'Delivery SLA', value: '14-Day', icon: Heart },
    ];

    const values = [
        {
            title: "Creator First",
            description: "We believe in empowering creators to build sustainable businesses doing what they love."
        },
        {
            title: "Transparency",
            description: "We're building a marketplace where data and pricing are open and fair for everyone."
        },
        {
            title: "Innovation",
            description: "We leverage cutting-edge AI to make connections smarter and campaigns more effective."
        }
    ];

    return (
        <PageTransition className="min-h-screen bg-background">
            <SEO
                title="About Creator Connect"
                description="Creator Connect is building the infrastructure for India's creator economy. Zero agency fees, Razorpay escrow payments, and a 7-step deal tracker for brand-creator collaborations."
                path="/about"
            />
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-black text-white">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/90 z-0" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
                            We're on a mission to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                democratize influence.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay-1">
                            Creator Connect builds the infrastructure that powers the creator economy. We help brands tell authentic stories and creators get paid for their passion.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-b bg-card">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className="text-center animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <div className="text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in">
                            <h2 className="text-4xl font-bold mb-6">Built for the High-Velocity Creator Economy</h2>
                            <div className="space-y-4 text-lg text-muted-foreground">
                                <p>
                                    Founded in 2025, Creator Connect was built to solve a single, expensive problem: the trust gap in influencer marketing.
                                </p>
                                <p>
                                    We watched as brands lost inventory to ghosting and creators struggled with delayed payments. We knew there was a better way. We built a platform that replaces messy WhatsApp chats with a 7-Step Automated Deal Tracker and insecure payments with Razorpay-backed Escrow.
                                </p>
                                <p>
                                    Today, Creator Connect serves as the infrastructure for India's most aesthetic D2C brands and cinematic creators. We don't just connect people; we de-risk the entire collaboration process so you can focus on what matters—scaling your brand.
                                </p>
                            </div>
                        </div>
                        <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-3xl transform rotate-3" />
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                                alt="Team collaboration"
                                className="relative rounded-3xl shadow-2xl"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-muted-foreground text-lg">
                            These principles guide every decision we make and every feature we build.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={value.title}
                                className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to join the revolution?</h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="rounded-full h-12 px-8">
                            <Link to="/contact">Work with us</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8">
                            <Link to="/careers">
                                View Careers
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </PageTransition>
    );
};

export default About;
