import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { TrustedByStrip } from '@/components/TrustedByStrip';
import { PlatformTour } from '@/components/PlatformTour';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { UGCGallery } from '@/components/UGCGallery';
import { AIAnalysisSection } from '@/components/AIAnalysisSection';

const Home = () => {
  return (
    <PageTransition className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
            >
              Drive word-of-mouth <br />
              <span className="text-primary">commerce at scale</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Creator Connect is the all-in-one platform to find creators, manage relationships, and measure the ROI of your influencer marketing programs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Button asChild size="xl" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                <Link to="/contact">
                  Request a Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Hero Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
        </div>
      </section>

      <AIAnalysisSection />

      <PlatformTour />

      <UGCGallery />

      <TestimonialCarousel />

      {/* Final CTA */}
      <section className="py-32 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            Ready to scale your <br /> influencer program?
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-12">
            Join 1,000+ brands using Creator Connect to drive real business results through creator partnerships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl" variant="secondary" className="h-14 px-8 text-lg rounded-full shadow-xl hover:scale-105 transition-transform">
              <Link to="/contact">Get a Demo</Link>
            </Button>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] border-[100px] border-white/5 rounded-full" />
          <div className="absolute -bottom-1/2 -right-1/4 w-[1000px] h-[1000px] border-[100px] border-white/5 rounded-full" />
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;