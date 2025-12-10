
import { motion } from 'framer-motion';
import { Users, Globe, Award, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';

const About = () => {
    const stats = [
        { label: 'Creators', value: '50K+', icon: Users },
        { label: 'Brands', value: '1,000+', icon: Award },
        { label: 'Countries', value: '30+', icon: Globe },
        { label: 'Campaigns', value: '10K+', icon: Heart },
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
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-black text-white">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/90 z-0" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                        >
                            We're on a mission to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                democratize influence.
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
                        >
                            Creator Connect builds the infrastructure that powers the creator economy. We help brands tell authentic stories and creators get paid for their passion.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-b bg-card">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <div className="text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold mb-6">Built for the future of marketing</h2>
                            <div className="space-y-4 text-lg text-muted-foreground">
                                <p>
                                    Founded in 2024, Creator Connect emerged from a simple observation: the most powerful way to sell a product is through a trusted recommendation.
                                </p>
                                <p>
                                    Traditional advertising was losing its impact, while the creator economy was booming. However, brands struggled to find the right creators, and creators struggled to monetize their influence consistently.
                                </p>
                                <p>
                                    We built Creator Connect to bridge this gap. Our platform uses advanced technology to match brands with creators who genuinely love their products, resulting in authentic content that drives real results.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-3xl transform rotate-3" />
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                                alt="Team collaboration"
                                className="relative rounded-3xl shadow-2xl"
                            />
                        </motion.div>
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
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {value.description}
                                </p>
                            </motion.div>
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
