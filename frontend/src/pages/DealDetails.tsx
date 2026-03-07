import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Deal, DealStatus } from '../types/Deal';
import Navbar from '../components/Navbar';
import DealTimeline from '../components/DealTimeline';
import ChatBox from '@/components/ChatBox';

const DealDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Amount Editing State
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [editAmountValue, setEditAmountValue] = useState('');
    const [isSavingAmount, setIsSavingAmount] = useState(false);

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

    const handleStatusUpdate = async (newStatus: DealStatus, metadata?: any, amount?: number) => {
        try {
            const payload: any = { status: newStatus, metadata };
            if (amount !== undefined) payload.amount = amount;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to update status');

            const data = await response.json();
            setDeal(data.deal);
        } catch (err) {
            console.error(err);
            alert('Failed to update deal status');
        }
    };

    const handleEditAmount = async () => {
        if (!editAmountValue || isNaN(Number(editAmountValue))) {
            setIsEditingAmount(false);
            return;
        }

        setIsSavingAmount(true);
        try {
            // Instead of fully updating the amount, we set a proposal in the metadata
            const newMetadata = {
                ...deal!.current_stage_metadata,
                proposed_amount: Number(editAmountValue),
                proposed_by_role: user.role
            };

            // Only update metadata, don't update actual amount yet
            await handleStatusUpdate(deal!.status as DealStatus, newMetadata);
            setIsEditingAmount(false);
        } catch (err) {
            console.error('Failed to propose amount', err);
        } finally {
            setIsSavingAmount(false);
        }
    };

    const handleAcceptProposedAmount = async () => {
        if (!deal?.current_stage_metadata?.proposed_amount) return;
        setIsSavingAmount(true);
        try {
            const acceptedAmount = deal.current_stage_metadata.proposed_amount;
            // Clear the proposal from metadata
            const newMetadata = { ...deal.current_stage_metadata };
            delete newMetadata.proposed_amount;
            delete newMetadata.proposed_by_role;

            // This will actually update the deal.amount and reset signatures because amount is passed
            await handleStatusUpdate(deal!.status as DealStatus, newMetadata, acceptedAmount);
        } catch (err) {
            console.error('Failed to accept amount', err);
        } finally {
            setIsSavingAmount(false);
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
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 items-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">ID: #{deal.id}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">Started: {new Date(deal.created_at).toLocaleDateString()}</span>

                        {deal.current_stage_metadata?.proposed_budget && (
                            <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200" title="Initial Budget Estimate">
                                Budget Est: {deal.current_stage_metadata.proposed_budget}
                            </span>
                        )}

                        {/* Amount Display / Negotiation Edit Logic */}
                        {isEditingAmount ? (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-1 h-8 focus-within:ring-2 focus-within:ring-green-500">
                                    <span className="font-medium text-gray-500 mr-2">{deal.currency}</span>
                                    <input
                                        type="number"
                                        value={editAmountValue}
                                        onChange={(e) => setEditAmountValue(e.target.value)}
                                        placeholder={deal.amount?.toString() || '0'}
                                        className="w-20 outline-none border-none p-0 text-gray-900 bg-transparent text-sm"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleEditAmount();
                                            if (e.key === 'Escape') setIsEditingAmount(false);
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleEditAmount}
                                    disabled={isSavingAmount}
                                    className="bg-green-600 text-white px-3 py-1 rounded h-8 text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isSavingAmount ? 'Sending...' : 'Propose'}
                                </button>
                                <button
                                    onClick={() => setIsEditingAmount(false)}
                                    disabled={isSavingAmount}
                                    className="text-gray-500 hover:text-gray-700 text-xs px-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : deal.current_stage_metadata?.proposed_amount ? (
                            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 p-2 rounded-lg">
                                <span className="text-indigo-800 font-medium whitespace-nowrap">
                                    {deal.current_stage_metadata.proposed_by_role === user.role ? 'You proposed: ' : 'New proposal: '}
                                    {deal.currency} {Number(deal.current_stage_metadata.proposed_amount).toLocaleString('en-IN')}
                                </span>

                                {deal.current_stage_metadata.proposed_by_role !== user.role ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAcceptProposedAmount}
                                            disabled={isSavingAmount}
                                            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditAmountValue(deal.current_stage_metadata?.proposed_amount?.toString() || '');
                                                setIsEditingAmount(true);
                                            }}
                                            className="bg-white border border-indigo-200 text-indigo-600 px-3 py-1 rounded text-xs font-medium hover:bg-indigo-50"
                                        >
                                            Counter
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-indigo-500 italic">Waiting for response...</span>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100 font-semibold flex items-center gap-2 group cursor-pointer"
                                onClick={() => {
                                    // Allow both BRAND and CREATOR to edit during negotiation phases (OFFER, SIGNING)
                                    if (!['LOGISTICS', 'PRODUCTION', 'REVIEW', 'APPROVED', 'COMPLETED', 'CANCELLED'].includes(deal.status)) {
                                        setEditAmountValue(deal.amount?.toString() || '');
                                        setIsEditingAmount(true);
                                    }
                                }}
                            >
                                <span>{deal.currency} {deal.amount ? Number(deal.amount).toLocaleString('en-IN') : '0'}</span>
                                {!['LOGISTICS', 'PRODUCTION', 'REVIEW', 'APPROVED', 'COMPLETED', 'CANCELLED'].includes(deal.status) && (
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs" title="Negotiate Amount">✏️</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Negotiation Warning */}
                    {deal.status === 'SIGNING' && (isEditingAmount || deal.current_stage_metadata?.proposed_amount) && (
                        <div className="text-xs text-orange-600 mb-4 flex items-center gap-1">
                            <span>⚠️</span> Changing the amount during Signing will require both parties to re-sign the contract.
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-1">Deliverables</h3>
                        <p className="text-gray-700">{deal.deliverables}</p>
                    </div>

                    {/* Contextual Chat Strategy */}
                    {deal.status !== 'OFFER' && deal.status !== 'CANCELLED' && (
                        <div className="mb-8">
                            <ChatBox
                                dealId={deal.id}
                                currentUserId={user.id}
                                creatorId={deal.creator_user_id} // We need to ensure we have this in Deal object
                                brandUserId={deal.brand_user_id} // And this
                            />
                        </div>
                    )}

                    {deal.status === 'OFFER' && (
                        <div className="mb-8 bg-blue-50 p-4 rounded-md border border-blue-100 text-blue-700 text-sm">
                            🔒 Chat is locked during the proposal phase. Accept the offer to start messaging.
                        </div>
                    )}
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
