export type DealStatus = 'OFFER' | 'SIGNING' | 'LOGISTICS' | 'PRODUCTION' | 'REVIEW' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface Deal {
    id: number;
    brand_id: number;
    creator_id: number;
    campaign_id?: number;
    status: DealStatus;
    amount: number;
    currency: string;
    deliverables: string;
    current_stage_metadata: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Joined fields
    // Joined fields
    brand_name?: string;
    creator_name?: string;
    brand_user_id: number;
    creator_user_id: number;
}
