import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Users, Zap, Shield, Star, Sparkles, ShieldCheck, TrendingUp, Briefcase, BarChart3, FileSignature, CreditCard, Palette, GraduationCap, CalendarDays } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

const Home = () => {
  const features = [
    {
      icon: Users,
      title: 'Verified Creator Network',
      description: 'Access our curated network of verified content creators across all niches and platforms'
    },
    {
      icon: Zap,
      title: 'Streamlined Campaign Management',
      description: 'Professional tools to create, manage, and track influencer marketing campaigns efficiently'
    },
    {
      icon: Shield,
      title: 'Secure & Trusted Platform',
      description: 'Enterprise-grade security with verified profiles and protected partnerships'
    },
    {
      icon: Star,
      title: 'Data-Driven Results',
      description: 'Comprehensive analytics and reporting to measure ROI and campaign performance'
    }
  ];

  const aiHighlights = [
    {
      icon: Sparkles,
      title: 'Smart Match Intelligence',
      description: 'Natural-language briefs are parsed via NLP, computer vision, and historical performance to recommend the top creators with context-rich match scores.'
    },
    {
      icon: ShieldCheck,
      title: 'Fraud & Authenticity Radar',
      description: 'Continuous AI scanning flags fake followers, suspicious spikes, and unsafe content so brands trust every “Creator Connect Verified Authentic” badge.'
    },
    {
      icon: TrendingUp,
      title: 'Dynamic Pricing Engine',
      description: 'Real-time engagement, niche demand, and growth trends inform fair-market pricing and budget unlock tips before you send a brief.'
    }
  ];

  const brandFeatures = [
    {
      icon: Briefcase,
      title: 'Campaign Control Center',
      description: 'Plan, brief, and track every collaboration from one dashboard with creator milestones, approvals, and message threads.'
    },
    {
      icon: BarChart3,
      title: 'Performance & ROI Analytics',
      description: 'Plug into Instagram and YouTube APIs for live KPIs—views, clicks, sentiment, CTR, and ROI benchmarks.'
    },
    {
      icon: FileSignature,
      title: 'Contracts & Compliance',
      description: 'Generate agreements, capture e-signatures, and store every scope, brief, and disclosure in a compliant audit trail.'
    },
    {
      icon: CreditCard,
      title: 'Escrow & Payments',
      description: 'Fund projects upfront with escrow releases tied to milestones so both brands and creators collaborate with confidence.'
    }
  ];

  const creatorTools = [
    {
      icon: Palette,
      title: 'Media Kit Builder',
      description: 'Auto-generate a beautiful deck using live social stats, audience demographics, and signature content formats.'
    },
    {
      icon: GraduationCap,
      title: 'Creator School',
      description: 'Educational paths on pricing, negotiation, marketing metrics, and financial hygiene help creators scale sustainably.'
    },
    {
      icon: CalendarDays,
      title: 'Content Calendar & Scheduling',
      description: 'Stay on top of deliverables and organic posts with reminders, workflow templates, and shared visibility for brands.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Verified Creators' },
    { number: '100+', label: 'Partner Brands' },
    { number: '98%', label: 'Client Satisfaction' },
    { number: '24/7', label: 'Dedicated Support' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <PageTransition className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section id="main-content" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <div className="space-y-4">
                <motion.h1 variants={itemVariants} className="text-hero font-bold text-foreground leading-tight">
                  Professional Creator-Brand
                  <span className="bg-gradient-hero bg-clip-text text-transparent"> Partnership Platform</span>
                </motion.h1>
                <motion.p variants={itemVariants} className="text-xl text-muted-foreground leading-relaxed">
                  Creator Connect provides enterprise-grade services connecting innovative brands with verified content creators.
                  Streamline your influencer marketing with our comprehensive platform designed for professional partnerships.
                </motion.p>
              </div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-hero hover:shadow-glow transition-all duration-300">
                  <Link to="/filter">
                    Explore Services
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary-soft">
                  <Link to="/campaign">Launch Campaign</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img
                src={heroImage}
                alt="Creators working together"
                className="rounded-2xl shadow-hover w-full"
              />
              <div className="absolute inset-0 bg-gradient-hero opacity-10 rounded-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-display font-bold bg-gradient-hero bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display font-bold text-foreground mb-4">
              Why Choose Creator Connect?
            </h2>
            <p className="text-xl text-muted-foreground">
              Professional services and tools designed for successful brand-creator partnerships
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="group hover:shadow-hover transition-all duration-300 bg-gradient-card border-0 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:shadow-glow transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-primary group-hover:text-white transition-smooth" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Revolution Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/60">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl text-center mx-auto space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Part 2 · The AI Revolution</p>
            <h2 className="text-display font-bold text-foreground">Intelligent, Predictive Partnerships</h2>
            <p className="text-lg text-muted-foreground">
              We are layering advanced AI across every workflow so brands get curated match lists, verified authenticity, and budget guidance in minutes—not weeks.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {aiHighlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-card border-0 shadow-soft h-full hover:shadow-hover transition-all duration-300">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Platform Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">For Brands & Companies</p>
            <h2 className="text-display font-bold text-foreground">Campaign Management, Analytics, and Trust in One Place</h2>
            <p className="text-lg text-muted-foreground">
              Manage briefs, content approvals, communication threads, KPIs, contracts, and payments inside one secure dashboard.
              Integrate social APIs for real-time performance, monitor ROI, and unlock escrow-backed payouts tied to milestones.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {brandFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border border-border/60 shadow-soft h-full hover:border-primary/50 transition-colors duration-300">
                  <CardContent className="p-5 space-y-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Platform Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/60">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="grid sm:grid-cols-2 gap-4 order-2 lg:order-1">
            {creatorTools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border border-border/60 shadow-soft h-full hover:border-primary/50 transition-colors duration-300">
                  <CardContent className="p-5 space-y-3">
                    <tool.icon className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold text-foreground">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="space-y-4 order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">For Creators</p>
            <h2 className="text-display font-bold text-foreground">Grow Your Brand, Not Just Your Inbox</h2>
            <p className="text-lg text-muted-foreground">
              From automated media kits and education tracks to content scheduling, Creator Connect acts like your operations team.
              Learn how to price confidently, track your pipeline, and keep every collaboration on schedule.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-display font-bold text-white mb-4">
            Ready to Elevate Your Marketing Strategy?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join leading brands and creators leveraging our professional platform for successful partnerships
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link to="/filter">Explore Creator Network</Link>
            </Button>
            <Button asChild size="lg" className="bg-black text-white border-black hover:bg-gray-800">
              <Link to="/contact">Schedule a Consultation</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </PageTransition>
  );
};

export default Home;