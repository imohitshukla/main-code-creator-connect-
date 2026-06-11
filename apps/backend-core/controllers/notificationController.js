import { client } from '../config/database.js';

// Get unread notifications
export const getUnreadNotifications = async (c) => {
    try {
        const userId = c.get('userId');

        const result = await client.query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 AND is_read = FALSE 
      ORDER BY created_at DESC
    `, [userId]);

        return c.json({
            notifications: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Error fetching unread notifications:', error);
        return c.json({ error: 'Failed to fetch notifications' }, 500);
    }
};

// Get ALL notifications (with pagination limit 20)
export const getAllNotifications = async (c) => {
    try {
        const userId = c.get('userId');

        const result = await client.query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [userId]);

        return c.json({ notifications: result.rows });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return c.json({ error: 'Failed to fetch notifications' }, 500);
    }
};

// Mark notification as read
export const markAsRead = async (c) => {
    try {
        const id = c.req.param('id');
        const userId = c.get('userId');

        // Security check: ensure notification belongs to user
        const check = await client.query('SELECT * FROM notifications WHERE id = $1 AND user_id = $2', [id, userId]);

        if (check.rows.length === 0) {
            return c.json({ error: 'Notification not found' }, 404);
        }

        await client.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);

        return c.json({ success: true });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        return c.json({ error: 'Failed to update notification' }, 500);
    }
};

// Mark ALL as read
export const markAllAsRead = async (c) => {
    try {
        const userId = c.get('userId'); // Assuming userId is available in context

        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        await client.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);

        return c.json({ success: true, message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return c.json({ error: 'Failed to update notifications' }, 500);
    }
};
