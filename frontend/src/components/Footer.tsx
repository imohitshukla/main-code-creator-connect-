import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Twitter, Facebook, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Mock API call
        setTimeout(() => {
            toast.success("Thanks for subscribing! You're in the loop.");
            setEmail('');
        }, 500);
    };

    return (
        <footer className="bg-[#0f172a] text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                    {/* Newsletter Section - Takes up 4 columns on large screens */}
                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-3xl font-semibold tracking-tight">Stay in the loop</h3>
                        <p className="text-gray-300 leading-relaxed">
                            We'll send you a helpful letter once a week. No spam.
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white text-black placeholder:text-gray-500 h-12"
                                required
                            />
                            <Button
                                type="submit"
                                className="w-full h-12 bg-purple-600 text-white hover:bg-purple-700 font-semibold text-lg"
                            >
                                Subscribe
                            </Button>
                        </form>
                    </div>

                    {/* Links Section - Takes up 8 columns on large screens */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {/* Company */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-purple-400">Company</h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
                                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            </ul>
                        </div>

                        {/* What we do */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-purple-400">What we do</h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li><Link to="/platform" className="hover:text-white transition-colors">Platform overview</Link></li>
                                <li><Link to="/campaign" className="hover:text-white transition-colors">By campaign strategy</Link></li>
                                <li><Link to="/agency" className="hover:text-white transition-colors">Agency services</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-purple-400">Support</h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li><Link to="/support/brand" className="hover:text-white transition-colors">Brand support</Link></li>
                                <li><Link to="/support/creator" className="hover:text-white transition-colors">Creator support</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact sales</Link></li>
                                <li><Link to="/auth?mode=signup" className="hover:text-white transition-colors">Creator sign up</Link></li>
                                <li><Link to="/partners" className="hover:text-white transition-colors">Partner program</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Join the Slack Community</a></li>
                            </ul>
                        </div>

                        {/* Free Resources */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-purple-400">Free Resources</h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li><Link to="/resources/brief" className="hover:text-white transition-colors">Influencer brief</Link></li>
                                <li><Link to="/resources/roi" className="hover:text-white transition-colors">Campaign ROI deck</Link></li>
                                <li><Link to="/resources/templates" className="hover:text-white transition-colors">Email templates</Link></li>
                                <li><Link to="/resources/report" className="hover:text-white transition-colors">State of influencer marketing</Link></li>
                                <li><Link to="/education" className="hover:text-white transition-colors">Marketing courses</Link></li>
                                <li><Link to="/resources/budget" className="hover:text-white transition-colors">Budget template</Link></li>
                                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            </ul>
                        </div>

                        {/* Trust center */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-purple-400">Trust center</h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy policy</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of service</Link></li>
                                <li><Link to="/subscription-agreement" className="hover:text-white transition-colors">Subscription agreement</Link></li>
                                <li><Link to="/disclosure" className="hover:text-white transition-colors">Responsible disclosure</Link></li>
                                <li><Link to="/acceptable-use" className="hover:text-white transition-colors">Acceptable use policy</Link></li>
                                <li><Link to="/fees" className="hover:text-white transition-colors">Handling Fees</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-bold tracking-tight">Creator Connect</span>
                        <div className="flex flex-col text-xs text-gray-400 mt-1">
                            <span>© 2025 Creator Connect, Inc. All rights reserved</span>
                            <span>moitshukla57662@gmail.com</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                            <Youtube className="w-5 h-5" />
                        </a>
                        <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
