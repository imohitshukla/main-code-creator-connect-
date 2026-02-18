import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiCall } from '@/utils/apiHelper';
import { Link } from 'react-router-dom';

interface Notification {
    id: number;
    message: string;
    link: string;
    is_read: boolean;
    created_at: string;
}

const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            // Fetch unread count/items
            const res = await apiCall('/api/notifications/unread');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await apiCall(`/api/notifications/${id}/read`, { method: 'PATCH' });
            // Updates local state optimistically
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await apiCall('/api/notifications/mark-all-read', { method: 'PATCH' });
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-2 h-10 w-10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white text-xs p-0">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs h-auto p-1 text-primary" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} className="cursor-pointer flex flex-col items-start gap-1 p-3 focus:bg-accent" asChild>
                                <Link
                                    to={notification.link}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="w-full"
                                >
                                    <p className="text-sm font-medium leading-none">{notification.message}</p>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(notification.created_at).toLocaleDateString()}
                                    </span>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer justify-center text-primary font-medium">
                    {/* Could link to a full notifications page later */}
                    <span className="w-full text-center">View all</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
