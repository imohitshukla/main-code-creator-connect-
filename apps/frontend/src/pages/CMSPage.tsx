
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
                <div className="mb-12 text-center animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-xl text-muted-foreground">{subtitle}</p>
                    )}
                </div>

                <div className="prose prose-lg dark:prose-invert mx-auto bg-card p-8 rounded-2xl border shadow-sm animate-fade-in-delay-1">
                    {content || (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <p className="text-lg">Content for {title} is currently being updated.</p>
                            <p className="text-sm">Please check back soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default CMSPage;
