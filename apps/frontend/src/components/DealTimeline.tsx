import React, { useState, useEffect } from 'react';
import { Deal, DealStatus } from '../types/Deal';
import RazorpayCheckout from './RazorpayCheckout';
import { useAuth } from '@/contexts/AuthContext';

interface DealTimelineProps {
    deal: Deal;
    currentUserId: number;
    userRole: 'BRAND' | 'CREATOR';
    onStatusUpdate: (newStatus: DealStatus, metadata?: any, amount?: number) => Promise<void>;
    onTerminate: (reason: string) => Promise<void>;
    onUploadDraft: (file: File) => Promise<void>;
}

const steps: { status: DealStatus | 'ESCROW_FUNDED'; label: string; description: string; icon: string }[] = [
    { status: 'OFFER', label: 'Offer', description: 'Proposal sent', icon: '📋' },
    { status: 'SIGNING', label: 'Signing', description: 'Contract', icon: '✍️' },
    { status: 'ESCROW_FUNDED', label: 'Funds Secured', description: 'Escrow funded', icon: '💰' },
    { status: 'LOGISTICS', label: 'Logistics', description: 'Shipping / Brief', icon: '📦' },
    { status: 'PRODUCTION', label: 'Production', description: 'Creating content', icon: '🎬' },
    { status: 'REVIEW', label: 'Review', description: 'Feedback loop', icon: '🔍' },
    { status: 'APPROVED', label: 'Approved', description: 'Work accepted', icon: '✅' },
    { status: 'COMPLETED', label: 'Completed', description: 'Payment released', icon: '🎉' },
];

// Escrow status types
interface EscrowPayment {
    id: number;
    deal_id: number;
    status: 'PENDING' | 'FUNDED' | 'RELEASED';
    amount: number;
    currency: string;
    funded_at?: string;
    released_at?: string;
    live_post_url?: string;
}

const DealTimeline: React.FC<DealTimelineProps> = ({ deal, currentUserId, userRole, onStatusUpdate, onTerminate, onUploadDraft }) => {
    const { token } = useAuth();
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [livePostUrl, setLivePostUrl] = useState('');
    const [releasingEscrow, setReleasingEscrow] = useState(false);
    const [escrowPayment, setEscrowPayment] = useState<EscrowPayment | null>(null);
    const [escrowLoading, setEscrowLoading] = useState(true);
    const [finalAmount, setFinalAmount] = useState('');
    const [barterTosAccepted, setBarterTosAccepted] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Fetch escrow payment status
    useEffect(() => {
        const fetchEscrow = async () => {
            if (!token || !deal.id) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/deal/${deal.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setEscrowPayment(data.payment);
                }
            } catch (err) {
                console.error('Failed to fetch escrow status:', err);
            } finally {
                setEscrowLoading(false);
            }
        };
        fetchEscrow();
    }, [deal.id, token]);

    const getDraftUrl = (path?: string) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    };

    // For progress bar: treat ESCROW_FUNDED as a virtual step between SIGNING & LOGISTICS
    const getCurrentStepIndex = () => {
        if (deal.status === 'CANCELLED') return -1;
        // Map deal status to step index
        const statusToIndex: Record<string, number> = {
            'OFFER': 0,
            'SIGNING': escrowPayment?.status === 'FUNDED' ? 2 : 1,
            'LOGISTICS': 3,
            'PRODUCTION': 4,
            'REVIEW': 5,
            'APPROVED': 6,
            'COMPLETED': 7,
        };
        return statusToIndex[deal.status] ?? 0;
    };

    const currentStepIndex = getCurrentStepIndex();

    // ────── handlers ──────
    const handleAcceptOffer = async () => {
        setLoading(true);
        try { await onStatusUpdate('SIGNING'); } finally { setLoading(false); }
    };

    const handleSign = async () => {
        setLoading(true);
        try {
            const metadata = { ...deal.current_stage_metadata };
            if (userRole === 'BRAND') metadata.brand_signed = true;
            if (userRole === 'CREATOR') {
                metadata.creator_signed = true;
                if (deal.compensation_type === 'BARTER' || deal.compensation_type === 'HYBRID') {
                    metadata.barter_tos_accepted_at = new Date().toISOString();
                }
            }
            let newStatus = deal.status;
            if (metadata.brand_signed && metadata.creator_signed) newStatus = 'LOGISTICS';
            await onStatusUpdate(newStatus, metadata);
        } finally { setLoading(false); }
    };

    const handleSubmitTracking = async () => {
        if (!trackingNumber) return;
        setLoading(true);
        try { await onStatusUpdate('LOGISTICS', { tracking_number: trackingNumber }); } finally { setLoading(false); }
    };

    const handleMarkReceived = async () => {
        setLoading(true);
        try { await onStatusUpdate('PRODUCTION', { received_at: new Date().toISOString() }); } finally { setLoading(false); }
    };

    const handleRequestChanges = async () => {
        if (!rejectReason) return;
        setLoading(true);
        try {
            await onStatusUpdate('PRODUCTION', { feedback: rejectReason, revision_requested: true });
            setShowRejectModal(false);
            setRejectReason('');
        } finally { setLoading(false); }
    };

    const handleTerminateSubmit = async () => {
        if (!terminationReason) return;
        setLoading(true);
        try { await onTerminate(terminationReason); setShowTerminateModal(false); } finally { setLoading(false); }
    };

    const handleSetFinalAmount = async () => {
        if (!finalAmount) return;
        setLoading(true);
        try {
            await onStatusUpdate(deal.status, deal.current_stage_metadata, Number(finalAmount));
            setFinalAmount('');
        } finally { setLoading(false); }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try { await onUploadDraft(file); } catch (e) { console.error(e); alert('Upload failed'); }
        finally { setLoading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    // Release escrow — creator submits live post link
    const handleReleaseEscrow = async () => {
        if (!livePostUrl.trim()) return;
        setReleasingEscrow(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/release/${deal.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ live_post_url: livePostUrl }),
            });
            if (!res.ok) throw new Error('Failed to release escrow');
            // Trigger parent to refresh deal
            await onStatusUpdate('COMPLETED' as DealStatus);
        } catch (err) {
            console.error(err);
            alert('Failed to submit live link. Please try again.');
        } finally {
            setReleasingEscrow(false);
        }
    };

    // ────── Escrow Banner ──────
    const EscrowBanner = () => {
        if (escrowLoading) return null;
        const isFunded = escrowPayment?.status === 'FUNDED';
        const isReleased = escrowPayment?.status === 'RELEASED';
        const isPending = !escrowPayment || escrowPayment.status === 'PENDING';

        if (isReleased) {
            return (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                        <p className="font-semibold text-green-800">Payment Released to Creator</p>
                        {escrowPayment?.released_at && (
                            <p className="text-xs text-green-600">Released on {new Date(escrowPayment.released_at).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>
            );
        }
        if (isFunded) {
            return (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                        <p className="font-semibold text-emerald-800">
                            Funds Secured in Escrow — {escrowPayment?.currency} {Number(escrowPayment?.amount).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-emerald-600">Your payment is safe. Released only after final post goes live.</p>
                    </div>
                </div>
            );
        }
        if (isPending && deal.status !== 'OFFER') {
            return (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                        <p className="font-semibold text-amber-800">Escrow Not Yet Funded</p>
                        <p className="text-xs text-amber-600">{userRole === 'BRAND' ? 'Please fund the escrow to start.' : 'Waiting for brand to secure payment.'}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (deal.status === 'CANCELLED') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-red-800 flex items-center gap-2"><span>🚫</span> Deal Cancelled</h3>
                <p className="text-red-700 mt-2">This deal was terminated on {new Date(deal.updated_at).toLocaleDateString()}.</p>
                {deal.current_stage_metadata?.termination_reason && (
                    <div className="mt-4 bg-white p-4 rounded border border-red-100">
                        <span className="font-semibold text-red-900">Reason:</span>
                        <p className="text-gray-700">{deal.current_stage_metadata.termination_reason}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
            {/* Escrow Status Banner */}
            <EscrowBanner />

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <h2 className="text-xl font-bold text-gray-900">Deal Progress</h2>
                <button onClick={() => setShowTerminateModal(true)} className="text-sm text-red-600 hover:text-red-800 hover:underline font-medium">
                    Cancel Deal
                </button>
            </div>

            {/* ── Milestone Stepper ── */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex items-start justify-between relative min-w-[700px]">
                    {/* Background bar */}
                    <div className="absolute left-4 right-4 top-4 h-1 bg-gray-200 -z-10" />
                    {/* Active progress bar */}
                    <div
                        className="absolute left-4 top-4 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 -z-10 transition-all duration-700"
                        style={{ width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 2rem)` }}
                    />

                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isEscrowStep = step.status === 'ESCROW_FUNDED';
                        const escrowDone = escrowPayment?.status === 'FUNDED' || escrowPayment?.status === 'RELEASED';

                        const circleClass = (isEscrowStep ? escrowDone : isCompleted)
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-indigo-400 text-white shadow-lg'
                            : isCurrent
                                ? 'bg-white border-indigo-500 text-indigo-600 shadow-md ring-4 ring-indigo-100'
                                : 'bg-white border-gray-200 text-gray-300';

                        return (
                            <div key={step.label} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-300 ${circleClass}`}>
                                    {(isEscrowStep ? escrowDone : isCompleted) ? '✓' : step.icon}
                                </div>
                                <p className={`mt-2 text-center text-xs font-semibold ${isCurrent ? 'text-indigo-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {step.label}
                                </p>
                                <p className="text-center text-[10px] text-gray-400 hidden sm:block">{step.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Action Area ── */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">

                {/* 1. OFFER — Consent Gate */}
                {deal.status === 'OFFER' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Offer Pending</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {userRole === 'CREATOR' ? 'Brand has sent you an offer. Do you accept?' : 'Waiting for Creator to accept your offer.'}
                        </p>
                        {userRole === 'CREATOR' && (
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setShowTerminateModal(true)} className="bg-white text-red-600 border border-red-200 px-6 py-2 rounded-md font-medium hover:bg-red-50">Decline Offer</button>
                                <button onClick={handleAcceptOffer} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50">Accept Offer</button>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. SIGNING — Contract */}
                {deal.status === 'SIGNING' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Contract Signing Pending</h3>
                        <p className="text-sm text-gray-600 mb-6">Both parties must agree to proceed.</p>
                        <div className="flex justify-center gap-8 mb-6">
                            <div className={`p-4 rounded border ${deal.current_stage_metadata?.brand_signed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                <span className="block font-semibold">Brand</span>
                                {deal.current_stage_metadata?.brand_signed ? <span className="text-green-600 text-sm">✓ Signed</span> : <span className="text-gray-400 text-sm">Waiting...</span>}
                            </div>
                            <div className={`p-4 rounded border ${deal.current_stage_metadata?.creator_signed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                <span className="block font-semibold">Creator</span>
                                {deal.current_stage_metadata?.creator_signed ? <span className="text-green-600 text-sm">✓ Signed</span> : <span className="text-gray-400 text-sm">Waiting...</span>}
                            </div>
                        </div>

                        {/* Barter Digital Contract */}
                        {userRole === 'CREATOR' && !deal.current_stage_metadata?.creator_signed && 
                         (deal.compensation_type === 'BARTER' || deal.compensation_type === 'HYBRID') && (
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6 text-left max-w-lg mx-auto shadow-sm">
                                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                    <span>⚖️</span> Barter Terms of Service
                                </h4>
                                <p className="text-sm text-orange-700 mb-3">
                                    If the content is not submitted within 14 days of receiving <strong>{deal.product_name || 'the product'}</strong>, the creator agrees to return the product in original condition or be legally invoiced for <strong>₹{deal.product_mrp || '0'}</strong>. Failure to comply results in a permanent ban from Creator Connect.
                                </p>
                                <label className="flex items-start gap-2 text-sm text-gray-800 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={barterTosAccepted}
                                        onChange={(e) => setBarterTosAccepted(e.target.checked)}
                                        className="mt-1"
                                    />
                                    <span>I accept the Barter Terms of Service & authorize the release of my shipping address to the brand.</span>
                                </label>
                            </div>
                        )}

                        {((userRole === 'BRAND' && !deal.current_stage_metadata?.brand_signed) ||
                            (userRole === 'CREATOR' && !deal.current_stage_metadata?.creator_signed)) && (
                                <button 
                                    onClick={handleSign} 
                                    disabled={loading || (userRole === 'CREATOR' && (deal.compensation_type === 'BARTER' || deal.compensation_type === 'HYBRID') && !barterTosAccepted)} 
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Signing...' : 'I Agree & Sign Contract'}
                                </button>
                            )}

                        {/* After both signed — Brand must fund escrow before logistics */}
                        {deal.current_stage_metadata?.brand_signed && deal.current_stage_metadata?.creator_signed && (
                            <div className="mt-6">
                                {escrowPayment?.status === 'FUNDED' ? (
                                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold">
                                        <span>💰</span> Escrow funded! Moving to Logistics...
                                    </div>
                                ) : deal.compensation_type === 'BARTER' ? (
                                    <div className="flex items-center justify-center gap-2 text-indigo-700 font-semibold">
                                        <span>📦</span> Barter Terms Accepted! Moving to Logistics...
                                    </div>
                                ) : userRole === 'BRAND' ? (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-4">Both signed! Now secure the payment in escrow to begin production.</p>
                                        {!(deal.amount || deal.budget) ? (
                                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4 text-left inline-block">
                                                <h4 className="font-semibold text-yellow-800 mb-1">Wait! The final amount is not set.</h4>
                                                <p className="text-sm text-yellow-700 mb-3">Please enter the negotiated deal amount before you can secure the funds.</p>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto focus-within:ring-2 focus-within:ring-indigo-500">
                                                        <span className="font-medium text-gray-500">{deal.currency || 'INR'}</span>
                                                        <input
                                                            type="number"
                                                            value={finalAmount}
                                                            onChange={(e) => setFinalAmount(e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full sm:w-24 outline-none border-none p-0 text-gray-900"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleSetFinalAmount}
                                                        disabled={loading || !finalAmount}
                                                        className="bg-indigo-600 text-white px-4 py-2 flex-shrink-0 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                                    >
                                                        {loading ? 'Saving...' : 'Set Amount'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <RazorpayCheckout
                                                dealId={deal.id}
                                                amount={deal.amount || deal.budget || 0}
                                                currency={deal.currency || 'INR'}
                                                onSuccess={() => { setEscrowPayment({ ...escrowPayment, status: 'FUNDED' } as EscrowPayment); window.location.reload(); }}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
                                        <p className="font-semibold">⏳ Waiting for Brand to Fund Escrow</p>
                                        <p className="mt-1 text-xs">The brand needs to secure the payment before production begins.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. LOGISTICS */}
                {deal.status === 'LOGISTICS' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Logistics & Briefing</h3>
                        <p className="text-sm text-gray-600 mb-6">Coordinate product shipping or share the creative brief.</p>
                        {userRole === 'BRAND' && (
                            <div className="max-w-md mx-auto">
                                {(deal.compensation_type === 'BARTER' || deal.compensation_type === 'HYBRID') && (
                                    <div className="mb-6 bg-orange-50 p-4 border border-orange-200 rounded-lg text-left hidden-print">
                                        <h4 className="font-semibold text-orange-900 flex items-center gap-1">
                                            <span>🔒</span> Creator Logistics Vault Unlocked
                                        </h4>
                                        <p className="text-sm text-orange-800 mt-2 whitespace-pre-line">
                                            <strong>Shipping Address:</strong><br/>
                                            {deal.creator_shipping_address || 'Address pending...'}
                                        </p>
                                    </div>
                                )}
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Tracking Number or Brief URL</label>
                                <div className="flex gap-2">
                                    <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g., UPS12345 or Brief Link" className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
                                    <button onClick={handleSubmitTracking} disabled={!trackingNumber || loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50">Update</button>
                                </div>
                                {deal.current_stage_metadata?.tracking_number && <p className="mt-2 text-sm text-green-600 text-left">✓ Tracking Provided: {deal.current_stage_metadata.tracking_number}</p>}
                            </div>
                        )}
                        {userRole === 'CREATOR' && (
                            <div>
                                {deal.current_stage_metadata?.tracking_number && (
                                    <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded text-blue-800 text-sm">
                                        <strong>Incoming Shipment/Brief:</strong>{' '}
                                        {deal.current_stage_metadata.tracking_number.startsWith('http')
                                            ? <a href={deal.current_stage_metadata.tracking_number} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">{deal.current_stage_metadata.tracking_number}</a>
                                            : deal.current_stage_metadata.tracking_number}
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 mb-4">Click below once you've received the product or brief.</p>
                                <button onClick={handleMarkReceived} disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50">
                                    {loading ? 'Updating...' : 'Mark as Received & Start Production'}
                                </button>
                            </div>
                        )}
                        {userRole === 'BRAND' && deal.current_stage_metadata?.tracking_number && <p className="text-xs text-gray-500 mt-4">Waiting for Creator to confirm receipt...</p>}
                    </div>
                )}

                {/* 4. PRODUCTION */}
                {deal.status === 'PRODUCTION' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">In Production</h3>
                        
                        {/* 14-Day SLA Barter Tracker */}
                        {(deal.compensation_type === 'BARTER' || deal.compensation_type === 'HYBRID') && deal.current_stage_metadata?.received_at && (
                            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-5 mx-auto max-w-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 p-3 rounded-full text-2xl animate-pulse text-red-600">
                                        ⏱️
                                    </div>
                                    <div className="text-left flex-1">
                                        <h4 className="font-bold text-red-900 mb-1 uppercase tracking-wide text-sm">Anti-Ghosting SLA Tracker</h4>
                                        <p className="text-xs text-red-700">Content deadline: <strong>14 days from {new Date(deal.current_stage_metadata.received_at).toLocaleDateString()}</strong></p>
                                        <p className="text-[10px] text-red-500 mt-1 uppercase font-semibold">Legally liable for MRP (₹{deal.product_mrp}) if deadline missed.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {deal.current_stage_metadata?.feedback && (
                            <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-md text-left mx-auto max-w-lg">
                                <h4 className="font-bold text-yellow-800 mb-1">⚠️ Revision Requested</h4>
                                <p className="text-yellow-700 text-sm mb-2">"{deal.current_stage_metadata.feedback}"</p>
                                <p className="text-xs text-yellow-600">Please upload a revised draft.</p>
                            </div>
                        )}
                        {userRole === 'CREATOR' ? (
                            <div>
                                <p className="text-sm text-gray-600 mb-4">{deal.current_stage_metadata?.feedback ? 'Upload Revised Draft' : 'Please upload your draft work when ready.'}</p>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                                    {loading ? 'Uploading...' : (deal.current_stage_metadata?.feedback ? 'Upload Revision' : 'Upload Draft')}
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">Waiting for creator to submit deliverables.</p>
                        )}
                    </div>
                )}

                {/* 5. REVIEW */}
                {deal.status === 'REVIEW' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Review Pending</h3>
                        {deal.current_stage_metadata?.draft_url && (
                            <div className="mb-4">
                                <a href={getDraftUrl(deal.current_stage_metadata.draft_url)} target="_blank" rel="noreferrer" className="text-indigo-600 underline">View Submitted Draft</a>
                                <p className="text-xs text-gray-400 mt-1">Uploaded: {new Date(deal.current_stage_metadata.draft_uploaded_at || deal.updated_at).toLocaleString()}</p>
                            </div>
                        )}
                        {userRole === 'BRAND' ? (
                            <div className="flex justify-center gap-4">
                                <button onClick={() => onStatusUpdate('APPROVED')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve Work</button>
                                <button onClick={() => setShowRejectModal(true)} className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200 border border-yellow-200">Request Changes</button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">Waiting for brand approval.</p>
                        )}
                    </div>
                )}

                {/* 6. APPROVED — Funds locked, creator submits live link */}
                {deal.status === 'APPROVED' && (
                    <div className="text-center">
                        <h3 className="font-bold text-green-700 mb-2 text-lg">Work Approved! 🎉</h3>
                        {escrowPayment?.status === 'FUNDED' ? (
                            <div>
                                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 inline-block">
                                    <p className="font-semibold text-emerald-800">💰 Funds Locked for Release</p>
                                    <p className="text-xs text-emerald-600 mt-1">
                                        {escrowPayment.currency} {Number(escrowPayment.amount).toLocaleString('en-IN')} locked and ready to release
                                    </p>
                                </div>
                                {userRole === 'CREATOR' ? (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-4">Submit your live post link to complete the deal and receive payment.</p>
                                        <div className="max-w-md mx-auto flex gap-2">
                                            <input
                                                type="url"
                                                value={livePostUrl}
                                                onChange={(e) => setLivePostUrl(e.target.value)}
                                                placeholder="https://instagram.com/p/your-post..."
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                            <button
                                                onClick={handleReleaseEscrow}
                                                disabled={!livePostUrl.trim() || releasingEscrow}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {releasingEscrow ? 'Releasing...' : '🚀 Submit & Get Paid'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 mt-2">Waiting for creator to submit the live post link to release payment.</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-600 mb-4">Work approved! Funds need to be secured before payment can be released.</p>
                                {userRole === 'BRAND' && (
                                    <RazorpayCheckout
                                        dealId={deal.id}
                                        amount={deal.amount || deal.budget || 0}
                                        currency={deal.currency || 'INR'}
                                        onSuccess={() => window.location.reload()}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 7. COMPLETED */}
                {deal.status === 'COMPLETED' && (
                    <div className="text-center">
                        <div className="inline-flex flex-col items-center gap-3">
                            <span className="text-5xl">🎉</span>
                            <h3 className="font-bold text-green-700 text-xl">Deal Complete!</h3>
                            <p className="text-sm text-gray-600">Payment has been released to the creator.</p>
                            {deal.live_post_url && (
                                <a href={deal.live_post_url} target="_blank" rel="noopener noreferrer"
                                    className="mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:from-pink-600 hover:to-rose-600 shadow-md">
                                    🔗 View Live Post
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Termination Modal */}
            {showTerminateModal && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 rounded-lg">
                    <div className="w-full max-w-md">
                        <h3 className="text-lg font-bold text-red-600 mb-2">
                            {deal.status === 'OFFER' ? 'Decline Offer' : 'Terminate Deal'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">Please provide a reason for {deal.status === 'OFFER' ? 'declining' : 'cancellation'}.</p>
                        <textarea value={terminationReason} onChange={(e) => setTerminationReason(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 mb-4 h-24 text-sm" placeholder="Reason..." />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowTerminateModal(false)} className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm">Cancel</button>
                            <button onClick={handleTerminateSubmit} disabled={!terminationReason || loading} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50">
                                {loading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 rounded-lg">
                    <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-xl p-6">
                        <h3 className="text-lg font-bold text-yellow-700 mb-2">Request Changes</h3>
                        <p className="text-sm text-gray-600 mb-4">Provide specific feedback for the creator. This will send the deal back to Production.</p>
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 mb-4 h-32 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="e.g., The audio is too low in the second clip..." />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm">Cancel</button>
                            <button onClick={handleRequestChanges} disabled={!rejectReason || loading} className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50">
                                {loading ? 'Sending...' : 'Send Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealTimeline;
