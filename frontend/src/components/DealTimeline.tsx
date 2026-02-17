import React, { useState } from 'react';
import { Deal, DealStatus } from '../types/Deal';

interface DealTimelineProps {
    deal: Deal;
    currentUserId: number;
    userRole: 'BRAND' | 'CREATOR';
    onStatusUpdate: (newStatus: DealStatus, metadata?: any) => Promise<void>;
    onTerminate: (reason: string) => Promise<void>;
    onUploadDraft: (file: File) => Promise<void>; // 🆕 Prop
}

const steps: { status: DealStatus; label: string; description: string }[] = [
    { status: 'OFFER', label: 'Offer', description: 'Proposal sent' },
    { status: 'SIGNING', label: 'Signing', description: 'Contract' },
    { status: 'LOGISTICS', label: 'Logistics', description: 'Shipping/Brief' },
    { status: 'PRODUCTION', label: 'Production', description: 'Creating content' },
    { status: 'REVIEW', label: 'Review', description: 'Feedback loop' },
    { status: 'APPROVED', label: 'Approved', description: 'Work accepted' },
    { status: 'COMPLETED', label: 'Completed', description: 'Payment released' },
];

const DealTimeline: React.FC<DealTimelineProps> = ({ deal, currentUserId, userRole, onStatusUpdate, onTerminate, onUploadDraft }) => {
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');
    const [loading, setLoading] = useState(false);

    // Logistics State
    const [trackingNumber, setTrackingNumber] = useState('');

    // Rejection State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const getCurrentStepIndex = () => {
        if (deal.status === 'CANCELLED') return -1;
        return steps.findIndex(s => s.status === deal.status);
    };

    const currentStepIndex = getCurrentStepIndex();

    // 1. Consent Gate (OFFER -> SIGNING or CANCELLED)
    const handleAcceptOffer = async () => {
        setLoading(true);
        try {
            await onStatusUpdate('SIGNING');
        } finally {
            setLoading(false);
        }
    };

    // 2. Signing (SIGNING -> LOGISTICS)
    const handleSign = async () => {
        setLoading(true);
        try {
            const metadata = { ...deal.current_stage_metadata };
            if (userRole === 'BRAND') metadata.brand_signed = true;
            if (userRole === 'CREATOR') metadata.creator_signed = true;

            let newStatus = deal.status;
            // Move to LOGISTICS (not PRODUCTION yet)
            if (metadata.brand_signed && metadata.creator_signed) {
                newStatus = 'LOGISTICS';
            }

            await onStatusUpdate(newStatus, metadata);
        } finally {
            setLoading(false);
        }
    };

    // 3. Logistics (LOGISTICS -> PRODUCTION)
    const handleSubmitTracking = async () => {
        if (!trackingNumber) return;
        setLoading(true);
        try {
            await onStatusUpdate('LOGISTICS', { tracking_number: trackingNumber });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReceived = async () => {
        setLoading(true);
        try {
            await onStatusUpdate('PRODUCTION', { received_at: new Date().toISOString() });
        } finally {
            setLoading(false);
        }
    };

    // 4. Rejection Loop (REVIEW -> PRODUCTION)
    const handleRequestChanges = async () => {
        if (!rejectReason) return;
        setLoading(true);
        try {
            await onStatusUpdate('PRODUCTION', { feedback: rejectReason, revision_requested: true });
            setShowRejectModal(false);
            setRejectReason('');
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateSubmit = async () => {
        if (!terminationReason) return;
        setLoading(true);
        try {
            await onTerminate(terminationReason);
            setShowTerminateModal(false);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            await onUploadDraft(file);
        } catch (e) {
            console.error(e);
            alert('Upload failed');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (deal.status === 'CANCELLED') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                    <span>🚫</span> Deal Cancelled
                </h3>
                <p className="text-red-700 mt-2">
                    This deal was terminated on {new Date(deal.updated_at).toLocaleDateString()}.
                </p>
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
            {/* Header with Kill Switch */}
            <div className="flex justify-between items-start mb-8">
                <h2 className="text-xl font-bold text-gray-900">Deal Progress</h2>
                <button
                    onClick={() => setShowTerminateModal(true)}
                    className="text-sm text-red-600 hover:text-red-800 hover:underline font-medium"
                >
                    Cancel Deal
                </button>
            </div>

            {/* Stepper */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex items-center justify-between relative min-w-[600px]">
                    {/* Progress Bar Background */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />

                    {/* Active Progress Bar */}
                    <div
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.status} className="flex flex-col items-center bg-white px-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white
                    ${isCompleted ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-300'}
                    ${isCurrent ? 'ring-4 ring-green-100' : ''}
                  `}
                                >
                                    {index < currentStepIndex ? (
                                        <span>✓</span>
                                    ) : (
                                        <span className="text-xs">{index + 1}</span>
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p className={`text-xs font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Area based on Status */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">

                {/* 1. OFFER STAGE (Consent Gate) */}
                {deal.status === 'OFFER' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Offer Pending</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {userRole === 'CREATOR'
                                ? "Brand has sent you an offer. Do you accept?"
                                : "Waiting for Creator to accept your offer."}
                        </p>

                        {userRole === 'CREATOR' && (
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowTerminateModal(true)}
                                    className="bg-white text-red-600 border border-red-200 px-6 py-2 rounded-md font-medium hover:bg-red-50"
                                >
                                    Decline Offer
                                </button>
                                <button
                                    onClick={handleAcceptOffer}
                                    disabled={loading}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Accept Offer
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. SIGNING STAGE */}
                {deal.status === 'SIGNING' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Contract Signing Pending</h3>
                        <p className="text-sm text-gray-600 mb-6">Both parties must agree to proceed to Logistics.</p>

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

                        {/* Show Sign Button only if current user hasn't signed yet */}
                        {((userRole === 'BRAND' && !deal.current_stage_metadata?.brand_signed) ||
                            (userRole === 'CREATOR' && !deal.current_stage_metadata?.creator_signed)) && (
                                <button
                                    onClick={handleSign}
                                    disabled={loading}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Signing...' : 'I Agree & Sign Contract'}
                                </button>
                            )}
                    </div>
                )}

                {/* 3. LOGISTICS STAGE [NEW] */}
                {deal.status === 'LOGISTICS' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Logistics & Briefing</h3>
                        <p className="text-sm text-gray-600 mb-6">Coordinate product shipping or share the creative brief.</p>

                        {/* Brand View: Add Tracking */}
                        {userRole === 'BRAND' && (
                            <div className="max-w-md mx-auto">
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Tracking Number or Brief URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="e.g., UPS12345 or Brief Link"
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    />
                                    <button
                                        onClick={handleSubmitTracking}
                                        disabled={!trackingNumber || loading}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Update
                                    </button>
                                </div>
                                {deal.current_stage_metadata?.tracking_number && (
                                    <p className="mt-2 text-sm text-green-600 text-left">
                                        ✓ Tracking Provided: {deal.current_stage_metadata.tracking_number}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Creator View: Confirm Receipt */}
                        {userRole === 'CREATOR' && (
                            <div>
                                {deal.current_stage_metadata?.tracking_number && (
                                    <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded text-blue-800 text-sm">
                                        <strong>Incoming Shipment/Brief:</strong> {deal.current_stage_metadata.tracking_number}
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 mb-4">Click below once you have received the product or brief to start production.</p>
                                <button
                                    onClick={handleMarkReceived}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Mark as Received & Start Production'}
                                </button>
                            </div>
                        )}

                        {/* Brand Helper Text if already submitted */}
                        {userRole === 'BRAND' && deal.current_stage_metadata?.tracking_number && (
                            <p className="text-xs text-gray-500 mt-4">Waiting for Creator to confirm receipt...</p>
                        )}
                    </div>
                )}


                {/* 4. PRODUCTION STAGE (Upload V2) */}
                {deal.status === 'PRODUCTION' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">In Production</h3>

                        {/* Show feedback if returned from Review */}
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
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Uploading...' : (deal.current_stage_metadata?.feedback ? 'Upload Revision' : 'Upload Draft')}
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">Waiting for creator to submit deliverables.</p>
                        )}
                    </div>
                )}

                {/* 5. REVIEW STAGE (Rejection Loop) */}
                {deal.status === 'REVIEW' && (
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Review Pending</h3>

                        {deal.current_stage_metadata?.draft_url && (
                            <div className="mb-4">
                                <a href={deal.current_stage_metadata.draft_url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                                    View Submitted Draft
                                </a>
                                <p className="text-xs text-gray-400 mt-1">Uploaded: {new Date(deal.current_stage_metadata.draft_uploaded_at || deal.updated_at).toLocaleString()}</p>
                            </div>
                        )}

                        {userRole === 'BRAND' ? (
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => onStatusUpdate('APPROVED')}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Approve Work
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200 border border-yellow-200"
                                >
                                    Request Changes
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">Waiting for brand approval.</p>
                        )}
                    </div>
                )}
                {/* APPROVED & COMPLETED */}
                {(deal.status === 'APPROVED' || deal.status === 'COMPLETED') && (
                    <div className="text-center">
                        <h3 className="font-bold text-green-700 mb-2">Deal Approved! 🎉</h3>
                        <p className="text-sm text-gray-600">The work has been approved. Payment will be processed shortly.</p>
                        {/* Payment Button could go here for COMPLETED */}
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
                        <p className="text-sm text-gray-600 mb-4">
                            Please provide a reason for {deal.status === 'OFFER' ? 'declining' : 'cancellation'}.
                        </p>
                        <textarea
                            value={terminationReason}
                            onChange={(e) => setTerminationReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 mb-4 h-24 text-sm"
                            placeholder="Reason..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowTerminateModal(false)}
                                className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTerminateSubmit}
                                disabled={!terminationReason || loading}
                                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                            >
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
                        <p className="text-sm text-gray-600 mb-4">
                            Provide specific feedback for the creator. This will send the deal back to Production.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 mb-4 h-32 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                            placeholder="e.g., The audio is too low in the second clip..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestChanges}
                                disabled={!rejectReason || loading}
                                className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                            >
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
