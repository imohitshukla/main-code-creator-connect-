import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Users, Zap, Shield, Star } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

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

  const stats = [
    { number: '500+', label: 'Verified Creators' },
    { number: '100+', label: 'Partner Brands' },
    { number: '98%', label: 'Client Satisfaction' },
    { number: '24/7', label: 'Dedicated Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section id="main-content" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-hero font-bold text-foreground leading-tight">
                  Professional Creator-Brand 
                  <span className="bg-gradient-hero bg-clip-text text-transparent"> Partnership Platform</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Niche Connect provides enterprise-grade services connecting innovative brands with verified content creators. 
                  Streamline your influencer marketing with our comprehensive platform designed for professional partnerships.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-hero hover:shadow-glow transition-all duration-300">
                  <Link to="/filter">
                    Explore Services
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary-soft">
                  <Link to="/campaign">Launch Campaign</Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img
                src={heroImage}
                alt="Creators working together"
                className="rounded-2xl shadow-hover w-full"
              />
              <div className="absolute inset-0 bg-gradient-hero opacity-10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-display font-bold bg-gradient-hero bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
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
              <Card key={index} className="group hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 bg-gradient-card border-0">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:shadow-glow transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-white transition-smooth" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
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
        </div>
      </section>
    </div>
  );
};

export default Home;