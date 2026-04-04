import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import PageTransition from '@/components/PageTransition';
import SEO from '@/components/SEO';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BLOG_POSTS } from './Blog';

export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const post = BLOG_POSTS.find(p => p.id === slug);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Post not found</h1>
                <Button asChild>
                    <Link to="/blog">Return to Blog</Link>
                </Button>
            </div>
        );
    }

    return (
        <PageTransition className="min-h-screen bg-background pt-24 pb-20">
            <SEO 
                title={post.title}
                description={post.excerpt}
                path={`/blog/${post.id}`}
                type="article"
            />
            
            <article className="container mx-auto px-4 max-w-3xl">
                {/* Back button */}
                <div className="mb-8 animate-fade-in">
                    <Link to="/blog" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to all articles
                    </Link>
                </div>

                {/* Article Header */}
                <header className="mb-10 animate-fade-in-delay-1">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                            {post.category}
                        </span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
                        {post.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y py-4">
                        <div className="flex items-center gap-2 font-medium">
                            <User className="w-4 h-4" />
                            {post.author}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                <div className="mb-12 rounded-2xl overflow-hidden shadow-lg animate-fade-in-delay-1 h-[400px]">
                    <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Article Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none animate-fade-in-delay-2 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
                    <ReactMarkdown>
                        {post.content}
                    </ReactMarkdown>
                </div>
                
                {/* CTA Footer */}
                <div className="mt-16 bg-gradient-subtle border rounded-2xl p-8 text-center animate-fade-in">
                    <h3 className="text-2xl font-bold mb-3">Ready to start collaborating?</h3>
                    <p className="text-muted-foreground mb-6">Join Creator Connect today to find vetted creators and run zero-fee campaigns.</p>
                    <div className="flex justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full shadow-lg">
                            <Link to="/auth?type=brand">Join as Brand</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="rounded-full">
                            <Link to="/auth?type=creator">Join as Creator</Link>
                        </Button>
                    </div>
                </div>
            </article>
        </PageTransition>
    );
}
