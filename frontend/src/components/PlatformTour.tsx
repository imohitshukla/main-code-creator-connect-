import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Search, BarChart3, Users, Mail, Zap, Shield } from "lucide-react";

const FEATURES = {
    discovery: {
        title: "Discovery",
        icon: Search,
        headline: "Find your perfect brand ambassadors",
        description: "Search through our vetted network of 100k+ creators. Filter by niche, engagement rate, audience demographics, and more to find the authentic voices that resonate with your brand.",
        points: ["Advanced filtering options", "Audience demographics analysis", "Content style matching", "Vetted creator network"]
    },
    management: {
        title: "Management",
        icon: Users,
        headline: "Streamline your entire workflow",
        description: "Stop juggling spreadsheets and emails. Manage applications, content approvals, shipping, and payments all in one centralized dashboard designed for scale.",
        points: ["Automated workflow stages", "In-app messaging", "Content approval system", "One-click payments"]
    },
    analytics: {
        title: "Analytics",
        icon: BarChart3,
        headline: "Measure real ROI, not just vanity metrics",
        description: "Track every click, conversion, and sale. Our comprehensive reporting suite gives you the data you need to optimize your campaigns and prove the value of your influencer marketing.",
        points: ["Real-time performance tracking", "Conversion attribution", "Cost-per-engagement analysis", "Automated reporting"]
    }
};

export function PlatformTour() {
    return (
        <section className="py-24 bg-secondary/20">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                        One platform for your entire creator journey
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        From first contact to final payment, we provide the tools you need to scale your influencer marketing program.
                    </p>
                </div>

                <Tabs defaultValue="discovery" className="w-full max-w-6xl mx-auto">
                    <TabsList className="grid w-full grid-cols-3 mb-12 h-auto p-1 bg-background/50 backdrop-blur border border-border/50 rounded-full">
                        {Object.entries(FEATURES).map(([key, feature]) => (
                            <TabsTrigger
                                key={key}
                                value={key}
                                className="py-4 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <feature.icon className="w-5 h-5" />
                                    <span className="font-semibold">{feature.title}</span>
                                </div>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {Object.entries(FEATURES).map(([key, feature]) => (
                        <TabsContent key={key} value={key} className="mt-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="grid lg:grid-cols-2 gap-12 items-center"
                            >
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-bold">{feature.headline}</h3>
                                        <p className="text-lg text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    <ul className="grid grid-cols-1 gap-4">
                                        {feature.points.map((point, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Zap className="w-3 h-3" />
                                                </div>
                                                <span className="font-medium">{point}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button className="text-primary font-semibold hover:underline inline-flex items-center gap-2 group">
                                        Learn more about {feature.title}
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                </div>

                                <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-background to-secondary border border-border shadow-2xl">
                                    {/* Placeholder UI for the screenshot */}
                                    <div className="absolute inset-0 p-8 flex flex-col">
                                        <div className="w-full h-8 bg-muted/50 rounded-lg mb-6 flex items-center px-4 gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-400/50" />
                                        </div>
                                        <div className="flex-1 bg-background rounded-xl shadow-sm border border-border/50 p-6 space-y-4">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-12 h-12 rounded-full bg-primary/20" />
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-muted rounded" />
                                                    <div className="w-24 h-3 bg-muted/50 rounded" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="w-full h-4 bg-muted/30 rounded" />
                                                <div className="w-full h-4 bg-muted/30 rounded" />
                                                <div className="w-2/3 h-4 bg-muted/30 rounded" />
                                            </div>
                                            <div className="pt-8 grid grid-cols-3 gap-4">
                                                <div className="h-20 bg-muted/20 rounded-lg" />
                                                <div className="h-20 bg-muted/20 rounded-lg" />
                                                <div className="h-20 bg-muted/20 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>
    );
}
