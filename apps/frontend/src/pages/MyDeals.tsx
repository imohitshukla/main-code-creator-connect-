import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Deal } from '../types/Deal';
import Navbar from '../components/Navbar';

const MyDeals: React.FC = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/my-deals`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch deals');
                const data = await response.json();
                setDeals(data.deals);
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchDeals();
    }, [token]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OFFER': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'SIGNING': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'LOGISTICS': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'PRODUCTION': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'REVIEW': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentBadge = (deal: Deal) => {
        const status = deal.payment_status;
        if (status === 'RELEASED') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    ✅ Payment Released
                </span>
            );
        }
        if (status === 'FUNDED') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                    💰 Funds Secured
                </span>
            );
        }
        if (deal.status !== 'OFFER' && deal.status !== 'CANCELLED') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    ⏳ Escrow Pending
                </span>
            );
        }
        return null;
    };

    const getStageProgress = (deal: Deal) => {
        const stageMap: Record<string, number> = {
            'OFFER': 12, 'SIGNING': 25, 'LOGISTICS': 40, 'PRODUCTION': 55,
            'REVIEW': 70, 'APPROVED': 85, 'COMPLETED': 100
        };
        return stageMap[deal.status] ?? 0;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Deals</h1>
                        <p className="text-gray-500 mt-1 text-sm">Track your active collaborations and escrow status</p>
                    </div>
                    {user?.role === 'CREATOR' && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                            <span className="text-lg">🔒</span>
                            <span className="text-sm font-semibold text-emerald-700">0% Commission Guarantee</span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <div className="text-center">
                            <div className="animate-spin text-4xl mb-4">⏳</div>
                            <p>Loading deals...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">{error}</div>
                ) : deals.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <p className="text-4xl mb-4">🤝</p>
                        <h3 className="text-lg font-semibold text-gray-900">No active deals yet</h3>
                        <p className="mt-2 text-gray-500 text-sm">
                            {user?.role === 'CREATOR'
                                ? 'When brands send you proposals, they will appear here.'
                                : 'Browse creators and send proposals to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {deals.map((deal) => {
                            const progress = getStageProgress(deal);
                            const counterparty = user?.role === 'BRAND' ? deal.creator_name : deal.brand_name || 'Counterparty';
                            return (
                                <div
                                    key={deal.id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group"
                                >
                                    {/* Progress Bar top strip */}
                                    <div className="h-1 bg-gray-100">
                                        <div
                                            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        {/* Left: Deal info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(deal.status)}`}>
                                                    {deal.status.replace('_', ' ')}
                                                </span>
                                                {getPaymentBadge(deal)}
                                                <span className="text-xs text-gray-400">Deal #{deal.id}</span>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 truncate">
                                                {counterparty}
                                            </h3>

                                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">{deal.deliverables}</p>

                                            <div className="mt-3 flex items-center gap-3 text-xs text-gray-600 font-medium">
                                                <span>Updated {new Date(deal.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                <span>•</span>
                                                <span>{progress}% complete</span>
                                            </div>
                                        </div>

                                        {/* Right: Amount + action */}
                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5">
                                                    {deal.payment_status === 'FUNDED' && (
                                                        <span title="Funds Verified & Held by Creator Connect" className="text-emerald-600 text-lg">🔒</span>
                                                    )}
                                                    <span className="text-xl font-bold text-gray-900">
                                                        {deal.currency || '₹'} {Number(deal.amount || 0).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                {deal.payment_status === 'FUNDED' && (
                                                    <p className="text-xs text-emerald-600 font-medium">Funds Verified & Held by Creator Connect</p>
                                                )}
                                            </div>
                                            <a
                                                href={`/deals/${deal.id}`}
                                                className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm shadow-indigo-200"
                                            >
                                                Open Tracker →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDeals;
