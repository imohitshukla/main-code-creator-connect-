
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

interface CMSPageProps {
    title: string;
    subtitle?: string;
    content?: React.ReactNode;
}

const CMSPage = ({ title, subtitle, content }: CMSPageProps) => {
    return (
        <PageTransition className="min-h-screen bg-background pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-xl text-muted-foreground">{subtitle}</p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-lg dark:prose-invert mx-auto bg-card p-8 rounded-2xl border shadow-sm"
                >
                    {content || (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <p className="text-lg">Content for {title} is currently being updated.</p>
                            <p className="text-sm">Please check back soon.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default CMSPage;
