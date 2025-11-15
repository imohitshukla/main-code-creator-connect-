import { client } from '../config/database.js';

export const getMessages = async (c) => {
  try {
    const conversationId = c.req.param('conversationId');
    const userId = c.get('userId'); // From auth middleware

    // Verify user is part of conversation
    const convCheck = await db.query(`
      SELECT participants FROM conversations 
      WHERE id = $1 AND participants @> $2::jsonb
    `, [conversationId, JSON.stringify([userId])]);

    if (convCheck.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const messages = await db.query(`
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

    // Verify user is part of conversation
    const convCheck = await db.query(`
      SELECT participants FROM conversations 
      WHERE id = $1 AND participants @> $2::jsonb
    `, [conversationId, JSON.stringify([userId])]);

    if (convCheck.rows.length === 0) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const result = await db.query(`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, sender_id, created_at
    `, [conversationId, userId, content]);

    // Update conversation updated_at
    await db.query(`
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

    const conversations = await db.query(`
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
    const { receiverId, campaignId } = await c.req.json();
    const userId = c.get('userId');

    if (userId === receiverId) {
      return c.json({ error: 'Cannot create conversation with self' }, 400);
    }

    // Check if conversation already exists
    const existing = await db.query(`
      SELECT id FROM conversations 
      WHERE participants = $1::jsonb
      ORDER BY created_at ASC LIMIT 1
    `, [JSON.stringify([userId, receiverId].sort((a, b) => a - b))]);

    if (existing.rows.length > 0) {
      return c.json({ conversation: { id: existing.rows[0].id } });
    }

    // Create new conversation
    const result = await db.query(`
      INSERT INTO conversations (participants, campaign_id)
      VALUES ($1, $2)
      RETURNING id, participants, created_at
    `, [JSON.stringify([userId, receiverId].sort((a, b) => a - b)), campaignId]);

    return c.json({ conversation: result.rows[0] });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to create conversation' }, 500);
  }
};
