import { motion } from "framer-motion";

const IMAGES = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1529139574466-a302d2d3f524?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=800&fit=crop"
];

export function UGCGallery() {
    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-4 mb-16 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    Content that converts
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Source high-quality user-generated content that looks native to the platform and drives real engagement.
                </p>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 px-4 max-w-7xl mx-auto">
                {IMAGES.map((src, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="break-inside-avoid relative group rounded-2xl overflow-hidden"
                    >
                        <img
                            src={src}
                            alt="UGC Example"
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                            <div className="text-white">
                                <p className="font-medium text-sm">@creator_handle</p>
                                <p className="text-xs text-white/80">Fashion & Lifestyle</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
