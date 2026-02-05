import { client } from '../config/database.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Conversation, Message, User, Deal, sequelize } = require('../models/index.cjs');
import { sendEmailNotification, generateMessageEmailHTML } from '../services/emailService.js';

// Create or get conversation
export const createOrGetConversation = async (participant1Id, participant2Id, dealId = null) => {
  try {
    // Check if conversation already exists using two separate queries
    let existingConversation = await Conversation.findOne({
      where: {
        participant_1_id: participant1Id,
        participant_2_id: participant2Id
      }
    });

    if (!existingConversation) {
      existingConversation = await Conversation.findOne({
        where: {
          participant_1_id: participant2Id,
          participant_2_id: participant1Id
        }
      });
    }

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participant_1_id: participant1Id,
      participant_2_id: participant2Id,
      deal_id: dealId
    });

    return conversation;
  } catch (error) {
    console.error('Create/get conversation error:', error);
    throw error;
  }
};

// Send message (Hybrid: In-App + Email)
export const sendMessage = async (c) => {
  try {
    const { conversationId, senderId, content, dealId = null } = await c.req.json();
    const userId = c.get('userId');

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findByPk(conversationId);
    } else if (dealId) {
      // Create conversation from deal
      const deal = await Deal.findByPk(dealId);
      if (deal) {
        conversation = await createOrGetConversation(deal.brand_id, deal.creator_id, dealId);
      }
    }

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    // Verify user is participant in conversation
    if (conversation.participant_1_id !== userId && conversation.participant_2_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Create message
    const message = await Message.create({
      conversation_id: conversation.id,
      sender_id: userId,
      content,
      is_system_message: false
    });

    // Update conversation last message time
    await conversation.update({ last_message_at: new Date() });

    // Get recipient details
    const recipientId = conversation.participant_1_id === userId 
      ? conversation.participant_2_id 
      : conversation.participant_1_id;
    
    const recipient = await User.findByPk(recipientId);
    const sender = await User.findByPk(userId);

    // Send email notification
    if (recipient && recipient.email) {
      const emailHTML = generateMessageEmailHTML(
        sender.name || 'A Creator Connect User',
        content,
        conversation.id
      );

      await sendEmailNotification({
        to: recipient.email,
        subject: `New Message from ${sender.name || 'Creator Connect'}`,
        html: emailHTML
      });
    }

    return c.json({ 
      success: true, 
      message: await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'email'] }
        ]
      })
    });
  } catch (error) {
    console.error('Send message error:', error);
    return c.json({ error: 'Failed to send message', details: error.message }, 500);
  }
};

// Get conversation messages
export const getConversationMessages = async (c) => {
  try {
    const conversationId = c.req.param('id');
    const userId = c.get('userId');

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    // Verify user is participant
    if (conversation.participant_1_id !== userId && conversation.participant_2_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'ASC']]
    });

    // Mark messages as read for this user
    await Message.update(
      { read_at: new Date() },
      { 
        where: { 
          conversation_id: conversationId,
          sender_id: { [sequelize.Sequelize.Op.ne]: userId }
        }
      }
    );

    return c.json({ messages });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    return c.json({ error: 'Failed to get messages', details: error.message }, 500);
  }
};

// Get user conversations
export const getUserConversations = async (c) => {
  try {
    const userId = c.get('userId');

    const conversations = await Conversation.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { participant_1_id: userId },
          { participant_2_id: userId }
        ]
      },
      include: [
        { model: User, as: 'participant1', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'participant2', attributes: ['id', 'name', 'email'] },
        { model: Deal, as: 'deal', attributes: ['id', 'title', 'current_stage'] }
      ],
      order: [['last_message_at', 'DESC']]
    });

    return c.json({ conversations });
  } catch (error) {
    console.error('Get user conversations error:', error);
    return c.json({ error: 'Failed to get conversations', details: error.message }, 500);
  }
};

// Add system message from deal tracker
export const addSystemMessage = async (conversationId, content, metadata = {}) => {
  try {
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: null, // NULL for system messages
      content,
      is_system_message: true
    });

    // Update conversation last message time
    await Conversation.update({ last_message_at: new Date() }, {
      where: { id: conversationId }
    });

    return message;
  } catch (error) {
    console.error('Add system message error:', error);
    throw error;
  }
};
