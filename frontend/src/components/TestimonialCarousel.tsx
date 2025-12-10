import useEmblaCarousel from 'embla-carousel-react';
import { Star, Quote } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
    {
        quote: "Creator Connect has completely transformed how we scale our influencer marketing. The ROI tracking is a game-changer.",
        author: "Sarah Jenkins",
        role: "CMO at GlowUp Beauty",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces"
    },
    {
        quote: "The quality of creators on this platform is unmatched. We found our top 5 brand ambassadors within a week.",
        author: "Michael Chen",
        role: "Marketing Director at TechFlow",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
    },
    {
        quote: "Finally, a platform that understands both the brand and creator side. The workflow tools saved us 20+ hours a week.",
        author: "Emma Wilson",
        role: "Founder of EcoLife",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces"
    }
];

export function TestimonialCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Loved by marketing teams</h2>
                    <p className="text-xl text-muted-foreground">Don't just take our word for it.</p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                            {TESTIMONIALS.map((testimonial, index) => (
                                <div key={index} className="flex-[0_0_100%] min-w-0 px-4">
                                    <div className="bg-secondary/10 border border-border/50 rounded-2xl p-8 md:p-12 text-center relative">
                                        <Quote className="w-12 h-12 text-primary/20 absolute top-8 left-8" />

                                        <div className="flex justify-center gap-1 mb-8">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                                            ))}
                                        </div>

                                        <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-10">
                                            "{testimonial.quote}"
                                        </blockquote>

                                        <div className="flex items-center justify-center gap-4">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.author}
                                                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                                            />
                                            <div className="text-left">
                                                <div className="font-bold text-lg">{testimonial.author}</div>
                                                <div className="text-muted-foreground">{testimonial.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-full rounded-full w-12 h-12 border-2"
                        onClick={scrollPrev}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-full rounded-full w-12 h-12 border-2"
                        onClick={scrollNext}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
