import { client } from '../config/database.js';

export const getMessages = async (c) => {
  try {
    const conversationId = c.req.param('conversationId');
    const userId = c.get('userId'); // From auth middleware

    // Verify user is part of conversation
    const convCheck = await client.query(`
      SELECT participants FROM conversations 
      WHERE id = $1 AND participants @> $2::jsonb
    `, [conversationId, JSON.stringify([userId])]);

    if (convCheck.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const messages = await client.query(`
      SELECT m.id, m.content, m.sender_id, m.created_at,
             u.email as sender_name  -- Use email since username may not exist; adjust if username added
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversationId]);

    return c.json({ messages: messages.rows });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
};

export const sendMessage = async (c) => {
  try {
    const { conversationId, content } = await c.req.json();
    const userId = c.get('userId');

    // Verify user is part of conversation and check Deal Status
    const convCheck = await client.query(`
      SELECT c.participants, c.deal_id, d.status as deal_status
      FROM conversations c
      LEFT JOIN deals d ON c.deal_id = d.id
      WHERE c.id = $1 AND c.participants @> $2::jsonb
    `, [conversationId, JSON.stringify([userId])]);

    if (convCheck.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const conversation = convCheck.rows[0];

    // 🔒 CONTEXTUAL CHAT LOCK
    // If there is a linked deal, strict chat rules apply.
    if (conversation.deal_id) {
      if (conversation.deal_status === 'OFFER') {
        return c.json({ error: 'Chat is locked until the proposal is accepted.' }, 403);
      }
      if (conversation.deal_status === 'CANCELLED' || conversation.deal_status === 'REJECTED') {
        return c.json({ error: 'Chat is disabled for this deal.' }, 403);
      }
    }

    const result = await client.query(`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, sender_id, created_at
    `, [conversationId, userId, content]);

    // Update conversation updated_at
    await client.query(`
      UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1
    `, [conversationId]);

    // Notify recipient (simplified, could use WebSockets later)
    const newMessage = result.rows[0];

    return c.json({ message: newMessage });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
};

export const getConversations = async (c) => {
  try {
    const userId = c.get('userId');

    const conversations = await client.query(`
      SELECT DISTINCT ON (conv.id) conv.id, conv.participants, conv.campaign_id, conv.updated_at,
             m.content as last_message, m.created_at as last_message_time,
             (other.participant::integer) as other_participant
      FROM conversations conv
      LEFT JOIN LATERAL (
        SELECT m.content, m.created_at
        FROM messages m
        WHERE m.conversation_id = conv.id
        ORDER BY m.created_at DESC LIMIT 1
      ) m ON true
      LEFT JOIN LATERAL (
        SELECT elem.participant
        FROM jsonb_array_elements(conv.participants) as elem(participant)
        WHERE (elem.participant::integer) != $1 AND elem.participant IS NOT NULL
        LIMIT 1
      ) other ON true
      WHERE conv.participants @> $2::jsonb
      ORDER BY conv.id, conv.updated_at DESC
    `, [userId, JSON.stringify([userId])]);

    return c.json({ conversations: conversations.rows });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
};

export const createConversation = async (c) => {
  try {
    const { receiverId, campaignId, dealId } = await c.req.json();
    const userId = c.get('userId');

    if (userId === receiverId) {
      return c.json({ error: 'Cannot create conversation with self' }, 400);
    }

    // Check if conversation already exists (modified to include dealId if present)
    // If dealId is present, we specifically look for a conversation for this deal.
    let existing;
    if (dealId) {
      existing = await client.query(`
            SELECT id FROM conversations 
            WHERE participants = $1::jsonb AND deal_id = $2
            ORDER BY created_at ASC LIMIT 1
        `, [JSON.stringify([userId, receiverId].sort((a, b) => a - b)), dealId]);
    } else {
      // Fallback to existing logic for generic/campaign chats
      existing = await client.query(`
            SELECT id FROM conversations 
            WHERE participants = $1::jsonb AND deal_id IS NULL AND campaign_id = $2
            ORDER BY created_at ASC LIMIT 1
        `, [JSON.stringify([userId, receiverId].sort((a, b) => a - b)), campaignId || null]);
    }

    if (existing.rows.length > 0) {
      return c.json({ conversation: { id: existing.rows[0].id } });
    }

    // Create new conversation
    const result = await client.query(`
      INSERT INTO conversations (participants, campaign_id, deal_id)
      VALUES ($1, $2, $3)
      RETURNING id, participants, created_at
    `, [JSON.stringify([userId, receiverId].sort((a, b) => a - b)), campaignId || null, dealId || null]);

    return c.json({ conversation: result.rows[0] });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to create conversation' }, 500);
  }
};

export const getDealConversation = async (c) => {
  try {
    const dealId = c.req.param('dealId');
    const userId = c.get('userId');

    // 1. Fetch deal to verify existence and get participants
    const dealCheck = await client.query('SELECT brand_id, creator_id FROM deals WHERE id = $1', [dealId]);
    if (dealCheck.rows.length === 0) {
      return c.json({ error: 'Deal not found' }, 404);
    }
    const { brand_id, creator_id } = dealCheck.rows[0];

    // Ensure user is part of the deal
    if (userId !== brand_id && userId !== creator_id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // 2. Find conversation by deal_id
    let convCheck = await client.query(`
      SELECT id, participants, deal_id 
      FROM conversations 
      WHERE deal_id = $1
    `, [dealId]);

    let conversation;
    if (convCheck.rows.length === 0) {
      // Auto-create conversation
      const participants = JSON.stringify([brand_id, creator_id].sort((a, b) => a - b));
      const newConv = await client.query(`
        INSERT INTO conversations (participants, deal_id)
        VALUES ($1::jsonb, $2)
        RETURNING id, participants, deal_id
      `, [participants, dealId]);
      conversation = newConv.rows[0];
    } else {
      conversation = convCheck.rows[0];
    }

    // 3. Fetch messages for conversation
    const messages = await client.query(`
      SELECT m.id, m.content, m.sender_id, m.created_at,
             u.email as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversation.id]);

    // Mark messages as read for this user
    await client.query(`
      UPDATE messages 
      SET is_read = true 
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false
    `, [conversation.id, userId]);

    return c.json({ conversation, messages: messages.rows });
  } catch (error) {
    console.error('Get deal conversation error:', error);
    return c.json({ error: 'Failed to get deal conversation', details: error.message }, 500);
  }
};
