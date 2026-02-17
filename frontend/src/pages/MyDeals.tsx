import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Deal } from '../types/Deal'; // Ensure types/Deal.ts exists
import Navbar from '../components/Navbar';

const MyDeals: React.FC = () => {
    const { token, user } = useAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/my-deals`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch deals');
                }

                const data = await response.json();
                setDeals(data.deals);
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDeals();
        }
    }, [token]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OFFER': return 'bg-yellow-100 text-yellow-800';
            case 'SIGNING': return 'bg-blue-100 text-blue-800';
            case 'PRODUCTION': return 'bg-purple-100 text-purple-800';
            case 'REVIEW': return 'bg-orange-100 text-orange-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Deals</h1>

                {loading ? (
                    <div className="text-center py-10">Loading deals...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">{error}</div>
                ) : deals.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900">No active deals</h3>
                        <p className="mt-2 text-gray-500">You don't have any deals yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {deals.map((deal) => (
                            <div
                                key={deal.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                                            {deal.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ID: #{deal.id}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {user?.role === 'BRAND' ? deal.creator_name : deal.brand_name || 'Counterparty'}
                                    </h3>

                                    <p className="text-gray-600 mt-1 line-clamp-2">
                                        {deal.deliverables}
                                    </p>

                                    <div className="mt-2 text-sm text-gray-500">
                                        updated {new Date(deal.updated_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                    <span className="text-lg font-bold text-gray-900">
                                        {deal.currency} {deal.amount}
                                    </span>
                                    <a
                                        href={`/deals/${deal.id}`}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        View Details
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDeals;
