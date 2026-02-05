import { client } from '../config/database.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Deal, DealTimelineLog, User } = require('../models/index.cjs');
import { validateStageMetadata, validateDealCreation } from '../validators/dealValidators.js';

// Stage transition rules
const VALID_TRANSITIONS = {
  AGREEMENT_SIGNED: ['SHIPPING_LOGISTICS'],
  SHIPPING_LOGISTICS: ['SCRIPT_APPROVAL'],
  SCRIPT_APPROVAL: ['DRAFT_REVIEW'],
  DRAFT_REVIEW: ['GO_LIVE'],
  GO_LIVE: ['PAYMENT_RELEASE'],
  PAYMENT_RELEASE: ['COMPLETED']
};

const EARLY_STAGES = ['AGREEMENT_SIGNED', 'SHIPPING_LOGISTICS', 'SCRIPT_APPROVAL'];

// Create new deal
export const createDeal = async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input data
    const validation = validateDealCreation(body);
    if (!validation.isValid) {
      return c.json({ 
        error: 'Invalid deal data', 
        details: validation.error 
      }, 400);
    }
    
    const { brand_id, creator_id, title, description, budget } = validation.data;
    
    const deal = await Deal.create({
      brand_id,
      creator_id,
      title,
      description,
      budget,
      current_stage: 'AGREEMENT_SIGNED',
      stage_metadata: {},
      agreement_signed_at: new Date()
    });

    // Log the creation
    await DealTimelineLog.create({
      deal_id: deal.id,
      old_stage: null,
      new_stage: 'AGREEMENT_SIGNED',
      changed_by: c.get('userId'),
      notes: 'Deal created'
    });

    return c.json({ success: true, deal });
  } catch (error) {
    console.error('Create deal error:', error);
    return c.json({ error: 'Failed to create deal', details: error.message }, 500);
  }
};

// Update deal stage with validation
export const updateDealStage = async (c) => {
  try {
    const dealId = c.req.param('id');
    const { stage, metadata = {} } = await c.req.json();
    const userId = c.get('userId');

    const deal = await Deal.findByPk(dealId);
    if (!deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    // Validate user permissions (brand or creator)
    if (deal.brand_id !== userId && deal.creator_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Validate transition
    const validNextStages = VALID_TRANSITIONS[deal.current_stage];
    if (validNextStages && !validNextStages.includes(stage)) {
      return c.json({ 
        error: 'Invalid stage transition', 
        current: deal.current_stage,
        requested: stage,
        allowed: validNextStages 
      }, 400);
    }

    // Validate metadata for this stage
    const metadataValidation = validateStageMetadata(stage, metadata);
    if (!metadataValidation.isValid) {
      return c.json({ 
        error: 'Invalid metadata for this stage', 
        details: metadataValidation.error 
      }, 400);
    }

    // Update stage and metadata
    const updateData = {
      current_stage: stage,
      stage_metadata: {
        ...deal.stage_metadata,
        ...metadataValidation.data
      }
    };

    if (stage === 'AGREEMENT_SIGNED') {
      updateData.agreement_signed_at = new Date();
    }

    await deal.update(updateData);

    // Log the stage change
    await DealTimelineLog.create({
      deal_id: deal.id,
      old_stage: deal.current_stage,
      new_stage: stage,
      changed_by: userId,
      metadata: metadataValidation.data,
      notes: `Stage updated from ${deal.current_stage} to ${stage}`
    });

    return c.json({ success: true, deal: await Deal.findByPk(dealId) });
  } catch (error) {
    console.error('Update stage error:', error);
    return c.json({ error: 'Failed to update stage', details: error.message }, 500);
  }
};

// Cancel deal with reason and dispute logic
export const cancelDeal = async (c) => {
  try {
    const dealId = c.req.param('id');
    const { cancellation_reason } = await c.req.json();
    const userId = c.get('userId');

    const deal = await Deal.findByPk(dealId);
    if (!deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    // Validate user permissions
    if (deal.brand_id !== userId && deal.creator_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const isEarlyStage = EARLY_STAGES.includes(deal.current_stage);
    const updateData = {
      status: 'CANCELLED',
      cancellation_reason,
      cancelled_by: userId,
      updated_at: new Date()
    };

    // If late stage, mark as dispute for admin review
    if (!isEarlyStage) {
      updateData.status = 'DISPUTE';
    }

    await deal.update(updateData);

    return c.json({ 
      success: true, 
      deal: await Deal.findByPk(dealId),
      isDispute: !isEarlyStage 
    });
  } catch (error) {
    console.error('Cancel deal error:', error);
    return c.json({ error: 'Failed to cancel deal', details: error.message }, 500);
  }
};

// Get deal details
export const getDeal = async (c) => {
  try {
    const dealId = c.req.param('id');
    const userId = c.get('userId');

    const deal = await Deal.findByPk(dealId, {
      include: [
        { model: User, as: 'brand', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }

    // Validate user permissions
    if (deal.brand_id !== userId && deal.creator_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ deal });
  } catch (error) {
    console.error('Get deal error:', error);
    return c.json({ error: 'Failed to get deal', details: error.message }, 500);
  }
};

// Get user's deals
export const getUserDeals = async (c) => {
  try {
    const userId = c.get('userId');
    const { role } = await c.req.query();
    
    const whereClause = role === 'brand' 
      ? { brand_id: userId }
      : { creator_id: userId };

    const deals = await Deal.findAll({
      where: whereClause,
      include: [
        { model: User, as: role, attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return c.json({ deals });
  } catch (error) {
    console.error('Get user deals error:', error);
    return c.json({ error: 'Failed to get deals', details: error.message }, 500);
  }
};
