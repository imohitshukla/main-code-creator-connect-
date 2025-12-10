import { motion } from 'framer-motion';

const BRANDS = [
    "Vogue", "Glossier", "Sephora", "Nike", "Adidas", "Samsung", "Dyson", "Canon", "Sony", "Lululemon"
];

export function TrustedByStrip() {
    return (
        <div className="w-full py-12 bg-background border-y border-border/40 overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Trusted by world-class brands
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

                <motion.div
                    className="flex gap-16 whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30
                    }}
                >
                    {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, i) => (
                        <div key={i} className="flex items-center justify-center">
                            <span className="text-2xl font-bold text-muted-foreground/50 hover:text-primary transition-colors cursor-default">
                                {brand}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
