import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Deal, DealStatus } from '../types/Deal';
import Navbar from '../components/Navbar';
import DealTimeline from '../components/DealTimeline';

const DealDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDeal = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch deal');
            }

            const data = await response.json();
            setDeal(data.deal);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && id) {
            fetchDeal();
        }
    }, [token, id]);

    const handleStatusUpdate = async (newStatus: DealStatus, metadata?: any) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, metadata })
            });

            if (!response.ok) throw new Error('Failed to update status');

            const data = await response.json();
            setDeal(data.deal);
        } catch (err) {
            console.error(err);
            alert('Failed to update deal status');
        }
    };

    const handleTerminate = async (reason: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${id}/terminate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason })
            });

            if (!response.ok) throw new Error('Failed to terminate deal');

            const data = await response.json();
            setDeal(data.deal);
        } catch (err) {
            console.error(err);
            alert('Failed to terminate deal');
        }
    };

    const handleUploadDraft = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type for FormData, browser sets it with boundary
                },
                body: formData
            });

            if (!uploadResponse.ok) throw new Error('Upload failed');

            const uploadData = await uploadResponse.json();
            const fileUrl = uploadData.url;

            // Update Deal Metadata & Status
            // Move to REVIEW status automatically after upload
            await handleStatusUpdate('REVIEW', {
                ...deal?.current_stage_metadata,
                draft_url: fileUrl,
                draft_uploaded_at: new Date().toISOString()
            });

        } catch (err) {
            console.error(err);
            alert('Failed to upload draft. Please try again.');
            throw err; // Re-throw to let child component know
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;
    if (!deal || !user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Deal not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate('/my-deals')}
                    className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                    ← Back to My Deals
                </button>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {user.role === 'BRAND' ? `Deal with ${deal.creator_name}` : `Deal with ${deal.brand_name}`}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">ID: #{deal.id}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">Started: {new Date(deal.created_at).toLocaleDateString()}</span>
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100 font-semibold">
                            {deal.currency} {deal.amount}
                        </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-1">Deliverables</h3>
                        <p className="text-gray-700">{deal.deliverables}</p>
                    </div>
                </div>

                {/* The Tracker Component */}
                <DealTimeline
                    deal={deal}
                    currentUserId={user.id}
                    userRole={user.role as 'BRAND' | 'CREATOR'}
                    onStatusUpdate={handleStatusUpdate}
                    onTerminate={handleTerminate}
                    onUploadDraft={handleUploadDraft}
                />
            </div>
        </div>
    );
};

export default DealDetails;
