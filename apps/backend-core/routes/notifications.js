import { Hono } from 'hono';
import { getUnreadNotifications, markAsRead, getAllNotifications, markAllAsRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const notifications = new Hono();

notifications.use('*', authMiddleware);

notifications.get('/unread', getUnreadNotifications);
notifications.get('/', getAllNotifications);
notifications.patch('/:id/read', markAsRead);
notifications.patch('/mark-all-read', markAllAsRead);

export default notifications;
