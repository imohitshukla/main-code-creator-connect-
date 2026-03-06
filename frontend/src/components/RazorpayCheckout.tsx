import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RazorpayCheckoutProps {
    dealId: number;
    amount: number;
    currency?: string;
    onSuccess: () => void;
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
    dealId,
    amount,
    currency = 'INR',
    onSuccess,
}) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePayNow = async () => {
        setLoading(true);
        setError('');

        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
            }

            // Step 1: Create order on backend
            const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ deal_id: dealId }),
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json();
                throw new Error(errData.error || 'Failed to create payment order');
            }

            const orderData = await orderRes.json();

            // Step 2: Open Razorpay modal
            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Creator Connect',
                description: `Escrow for Deal #${dealId}`,
                order_id: orderData.order_id,
                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    // Step 3: Verify payment on backend
                    const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            deal_id: dealId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });

                    if (!verifyRes.ok) {
                        setError('Payment verification failed. Please contact support.');
                        return;
                    }

                    onSuccess();
                },
                prefill: {
                    name: 'Brand',
                    email: '',
                },
                theme: {
                    color: '#4F46E5',
                },
                modal: {
                    ondismiss: () => setLoading(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Payment failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-3xl">🔐</span>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Secure Escrow Payment</h3>
                        <p className="text-sm text-gray-500">Funds held safely until work is approved</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-100 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Amount to Secure</p>
                    <p className="text-3xl font-bold text-indigo-700">
                        {currency} {Number(amount).toLocaleString('en-IN')}
                    </p>
                </div>

                <div className="space-y-2 text-xs text-gray-500 mb-5 text-left">
                    <p>✅ Your money is held securely — not released until you approve</p>
                    <p>✅ Creator gets a "Funds Secured" badge for full confidence</p>
                    <p>✅ Automatic release only after final post goes live</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    onClick={handlePayNow}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin">⏳</span> Processing...
                        </>
                    ) : (
                        <>
                            <span>💳</span> Pay & Secure Funds
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default RazorpayCheckout;
