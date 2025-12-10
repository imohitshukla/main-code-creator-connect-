import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AIAnalysisSection = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-black text-white">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Powered by Advanced AI
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
                    >
                        Real-time Growth Analysis
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-400"
                    >
                        Leverage our proprietary AI to analyze campaign performance and predict future growth for both brands and creators.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Brand Analysis Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="group relative rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>

                            <h3 className="text-2xl font-bold mb-4">For Brands</h3>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                    Predictive ROI modeling
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                    Audience sentiment analysis
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                    Competitor benchmarking
                                </li>
                            </ul>

                            <div className="h-48 rounded-xl bg-black/40 border border-white/5 p-4 relative overflow-hidden">
                                {/* Abstract Graph UI */}
                                <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-between px-4 pb-4 gap-2">
                                    {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.4 + (i * 0.1), duration: 1, ease: "easeOut" }}
                                            className="w-full bg-gradient-to-t from-purple-600 to-purple-400/50 rounded-t-sm opacity-80"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Creator Analysis Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="group relative rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                                <Users className="w-6 h-6" />
                            </div>

                            <h3 className="text-2xl font-bold mb-4">For Creators</h3>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    Content performance insights
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    Brand affinity matching
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    Growth trajectory forecasts
                                </li>
                            </ul>

                            <div className="h-48 rounded-xl bg-black/40 border border-white/5 p-4 relative flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full border-2 border-blue-500/30 flex items-center justify-center relative">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-t-2 border-r-2 border-blue-400 rounded-full"
                                        />
                                        <Zap className="w-8 h-8 text-blue-400" />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                    <span className="text-sm text-gray-400">Match Confidence</span>
                                    <div className="text-2xl font-bold text-white">98.5%</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-16 text-center">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8 h-12 text-lg font-semibold">
                        Explore AI Features
                    </Button>
                </div>
            </div>
        </section>
    );
};
