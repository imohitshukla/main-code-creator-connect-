import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Conversation, Message } = require('../models/index.cjs');

/**
 * Shared helper function to log deal events as system messages
 * This keeps Deal Logic clean and separated from Chat Logic
 * 
 * @param {number} dealId - The deal ID to log event for
 * @param {string} message - The system message to insert
 * @param {object} metadata - Additional metadata to store with the message
 */
export const logDealEvent = async (dealId, message, metadata = {}) => {
  try {
    // Find conversation associated with this deal
    let conversation = await Conversation.findOne({
      where: { deal_id: dealId }
    });

    if (!conversation) {
      console.error(`No conversation found for deal ${dealId}`);
      return null;
    }

    // Insert system message
    const systemMessage = await Message.create({
      conversation_id: conversation.id,
      sender_id: null, // NULL for system messages
      content: message,
      is_system_message: true
    });

    // Update conversation last message time
    await Conversation.update({ 
      last_message_at: new Date() 
    }, {
      where: { id: conversation.id }
    });

    console.log(`Deal event logged: Deal ${dealId} - ${message}`);
    return systemMessage;

  } catch (error) {
    console.error('Error logging deal event:', error);
    throw error;
  }
};

/**
 * Get conversation ID for a deal (helper function)
 * @param {number} dealId - The deal ID
 * @returns {Promise<number|null>} - Conversation ID or null if not found
 */
export const getDealConversationId = async (dealId) => {
  try {
    const conversation = await Conversation.findOne({
      where: { deal_id: dealId },
      attributes: ['id']
    });

    return conversation ? conversation.id : null;
  } catch (error) {
    console.error('Error getting deal conversation:', error);
    return null;
  }
};
