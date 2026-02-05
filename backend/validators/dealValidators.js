import { z } from 'zod';

// Stage-specific metadata schemas
const shippingLogisticsSchema = z.object({
  tracking_number: z.string().min(1, 'Tracking number is required'),
  courier_name: z.string().optional(),
  shipping_address: z.string().optional(),
  estimated_delivery: z.string().optional()
});

const scriptApprovalSchema = z.object({
  draft_video_url: z.string().url('Invalid video URL'),
  concept_notes: z.string().optional(),
  brand_feedback: z.string().optional()
});

const draftReviewSchema = z.object({
  draft_video_url: z.string().url('Invalid video URL'),
  revision_notes: z.string().optional(),
  final_approval: z.boolean().optional()
});

const goLiveSchema = z.object({
  social_post_url: z.string().url('Invalid social post URL'),
  go_live_timestamp: z.string().optional(),
  platform: z.string().optional()
});

const paymentReleaseSchema = z.object({
  payment_amount: z.number().positive('Payment amount must be positive'),
  escrow_release: z.boolean(),
  rating_given: z.number().min(1).max(5).optional(),
  rating_notes: z.string().optional()
});

// Stage validation mapping
const stageMetadataSchemas = {
  SHIPPING_LOGISTICS: shippingLogisticsSchema,
  SCRIPT_APPROVAL: scriptApprovalSchema,
  DRAFT_REVIEW: draftReviewSchema,
  GO_LIVE: goLiveSchema,
  PAYMENT_RELEASE: paymentReleaseSchema
};

// Validate metadata based on current stage
export const validateStageMetadata = (stage, metadata) => {
  const schema = stageMetadataSchemas[stage];
  
  if (!schema) {
    // No validation required for this stage
    return { isValid: true, data: metadata };
  }

  try {
    const validatedData = schema.parse(metadata);
    return { isValid: true, data: validatedData };
  } catch (error) {
    return {
      isValid: false,
      error: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      }))
    };
  }
};

// Common deal creation validation
export const validateDealCreation = (data) => {
  const dealSchema = z.object({
    brand_id: z.number().positive('Brand ID is required'),
    creator_id: z.number().positive('Creator ID is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    budget: z.number().positive('Budget must be positive').optional()
  });

  try {
    const validatedData = dealSchema.parse(data);
    return { isValid: true, data: validatedData };
  } catch (error) {
    return {
      isValid: false,
      error: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      }))
    };
  }
};
