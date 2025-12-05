import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-card border-t border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">CC</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                                Creator Connect
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Connecting innovative brands with verified content creators for impactful partnerships.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/filter" className="hover:text-primary transition-colors">Find Creators</Link></li>
                            <li><Link to="/campaign" className="hover:text-primary transition-colors">Post Campaign</Link></li>
                            <li><Link to="/ai-match" className="hover:text-primary transition-colors">AI Match</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Creator Connect. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
