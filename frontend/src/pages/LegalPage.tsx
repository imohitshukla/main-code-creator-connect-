
import { useParams } from 'react-router-dom';
import CMSPage from './CMSPage';

const LegalPage = ({ type }: { type?: string }) => {
    // If using a route param, we could extract it here, but props are easier for direct routing

    const contentMap: Record<string, { title: string, subtitle: string, content: React.ReactNode }> = {
        'privacy': {
            title: "Privacy Policy",
            subtitle: "Last updated: January 2025",
            content: (
                <div className="space-y-8 text-lg leading-relaxed text-muted-foreground">
                    <section className="space-y-4">
                        <p>At Creator Connect ("we," "our," or "us"), we respect your privacy and are committed to protecting responsible data practices. This Privacy Policy describes how we collect, use, and share your personal information when you visit or use our platform.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-2xl font-semibold text-foreground">1. Information We Collect</h3>
                        <p><strong>Personal Information associated with your account:</strong> Name, email address, password, social media handles, and payment information (processed via Stripe).</p>
                        <p><strong>Creator Data:</strong> If you verify your account as a creator, we collect public metrics such as follower counts, engagement rates, and content samples via authorised API connections (YouTube Data API, Instagram Graph API).</p>
                        <p><strong>Usage Data:</strong> We automatically track how you interact with our services, including IP address, browser type, and page views, to improve platform performance.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To provide the core functionality of connecting Brands with Creators.</li>
                            <li>To process payments and payouts securely.</li>
                            <li>To send important account notifications and optional marketing newsletters.</li>
                            <li>To prevent fraud and ensure platform safety.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-2xl font-semibold text-foreground">3. Data Sharing & Disclosure</h3>
                        <p>We do not sell your personal data. We only share data with:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Service Providers:</strong> Cloud hosting (AWS/Vercel), email delivery (Brevo), and payment processing (Stripe).</li>
                            <li><strong>Legal Authorities:</strong> If required by law or to protect our rights.</li>
                        </ul>
                    </section>
                </div>
            )
        },
        'terms': {
            title: "Terms of Service",
            subtitle: "Effective Date: January 1, 2025",
            content: (
                <div className="space-y-8 text-lg leading-relaxed text-muted-foreground">
                    <section className="space-y-4">
                        <p>Welcome to Creator Connect. By accessing or using our website, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-2xl font-semibold text-foreground">1. Eligibility</h3>
                        <p>You must be at least 18 years old to use our services. By using Creator Connect, you represent and warrant that you meet this requirement.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-2xl font-semibold text-foreground">2. User Conduct</h3>
                        <p>You agree not to use the platform for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. Harassment, abuse, or fraudulent activity regarding campaign deliverables will result in immediate account termination.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-2xl font-semibold text-foreground">3. Payments & Fees</h3>
                        <p>Brands are charged immediately upon campaign funding. Funds are held in escrow until deliverables are approved. Creator Connect charges a 5% platform fee on payouts to creators, which is deducted automatically.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-2xl font-semibold text-foreground">4. Intellectual Property</h3>
                        <p>Unless otherwise agreed in a separate contract, creators retain ownership of their content but grant brands a non-exclusive license to use the content for the duration of the campaign.</p>
                    </section>
                </div>
            )
        },
        'subscription': {
            title: "Subscription Agreement",
            subtitle: "For Enterprise Plans",
            content: (
                <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                    <p>This agreement applies to Brands subscribing to our "Pro" or "Agency" tiers.</p>
                    <p>Subscriptions are billed monthly or annually. You may cancel at any time, but refunds are not issued for partial billing periods.</p>
                </div>
            )
        },
        'fees': {
            title: "Handling Fees",
            subtitle: "Transparent Pricing",
            content: (
                <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                    <p>Our goal is to keep more money in the pocket of the creator.</p>
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <h4 className="text-xl font-bold text-foreground mb-4">Fee Schedule</h4>
                        <ul className="space-y-3">
                            <li className="flex justify-between border-b pb-2">
                                <span>Brand Campaign Fee</span>
                                <span className="font-mono font-bold text-green-500">0%</span>
                            </li>
                            <li className="flex justify-between border-b pb-2">
                                <span>Creator Payout Fee</span>
                                <span className="font-mono font-bold">5%</span>
                            </li>
                            <li className="flex justify-between pt-2">
                                <span>Payment Processing (Stripe)</span>
                                <span className="font-mono text-muted-foreground">Standard Rates (2.9% + 30¢)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        }
    };

    const data = contentMap[type || 'privacy'] || {
        title: "Legal Document",
        subtitle: "",
        content: <p>Document not found.</p>
    };

    return <CMSPage title={data.title} subtitle={data.subtitle} content={data.content} />;
};

export default LegalPage;
