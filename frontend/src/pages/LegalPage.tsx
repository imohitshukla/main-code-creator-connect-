
import { useParams } from 'react-router-dom';
import CMSPage from './CMSPage';

const LegalPage = ({ type }: { type?: string }) => {
    // If using a route param, we could extract it here, but props are easier for direct routing

    const contentMap: Record<string, { title: string, subtitle: string, content: React.ReactNode }> = {
        'privacy': {
            title: "Privacy Policy",
            subtitle: "Last updated: December 2024",
            content: (
                <div className="space-y-6">
                    <p>At Creator Connect, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our platform.</p>

                    <h3>1. Information We Collect</h3>
                    <p>We collect information that you provide directly to us when you register for an account, create or modify your profile, set preferences, sign up for our newsletter, or make a purchase.</p>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you related information, and to communicate with you.</p>

                    <h3>3. Data Security</h3>
                    <p>We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.</p>
                </div>
            )
        },
        'terms': {
            title: "Terms of Service",
            subtitle: "Last updated: December 2024",
            content: (
                <div className="space-y-6">
                    <p>Please read these Terms of Service ("Terms") carefully before using the Creator Connect platform.</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>

                    <h3>2. Accounts</h3>
                    <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
                </div>
            )
        },
        'subscription': {
            title: "Subscription Agreement",
            subtitle: "Last updated: December 2024",
            content: (
                <div className="space-y-6">
                    <p>This Subscription Agreement governs your use of premium features on Creator Connect.</p>
                </div>
            )
        },
        'fees': {
            title: "Handling Fees",
            subtitle: "Platform Fee Structure",
            content: (
                <div className="space-y-6">
                    <p>Our fee structure is transparent and fair for both creators and brands.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Brands:</strong> 0% platform fee on all campaigns.</li>
                        <li><strong>Creators:</strong> 5% processing fee on payouts.</li>
                    </ul>
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
