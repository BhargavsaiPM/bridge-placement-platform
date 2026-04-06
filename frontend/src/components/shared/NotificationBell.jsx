import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';

const formatTimestamp = (value) => {
    if (!value) {
        return 'Just now';
    }

    return new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshNotifications = async () => {
        try {
            const [notificationsResponse, unreadResponse] = await Promise.all([
                notificationApi.getNotifications(),
                notificationApi.getUnreadCount(),
            ]);

            setNotifications(Array.isArray(notificationsResponse.data) ? notificationsResponse.data : []);
            setUnreadCount(Number(unreadResponse.data?.count || 0));
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    useEffect(() => {
        refreshNotifications();

        const intervalId = window.setInterval(refreshNotifications, 60000);
        return () => window.clearInterval(intervalId);
    }, []);

    const visibleNotifications = useMemo(() => notifications.slice(0, 6), [notifications]);

    const handleNotificationClick = async (notification) => {
        if (!notification?.id || notification.readFlag) {
            return;
        }

        try {
            await notificationApi.markAsRead(notification.id);
            setNotifications((currentNotifications) =>
                currentNotifications.map((item) =>
                    item.id === notification.id ? { ...item, readFlag: true } : item
                )
            );
            setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllVisibleAsRead = async () => {
        const unreadNotifications = visibleNotifications.filter((notification) => !notification.readFlag);
        if (!unreadNotifications.length) {
            return;
        }

        await Promise.allSettled(unreadNotifications.map((notification) => notificationApi.markAsRead(notification.id)));
        setNotifications((currentNotifications) =>
            currentNotifications.map((notification) => ({ ...notification, readFlag: true }))
        );
        setUnreadCount(0);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((currentOpen) => !currentOpen)}
                className="group relative rounded-full border border-white/10 bg-white/[0.04] p-2.5 transition-colors hover:bg-white/[0.08]"
                title="Notifications"
            >
                <Bell className="h-5 w-5 text-text-secondary transition-colors group-hover:text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-14 z-50 w-[340px] rounded-3xl border border-white/10 bg-[#0C1324]/95 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Notifications</p>
                            <p className="mt-1 text-sm text-white">Latest account activity</p>
                        </div>
                        <button
                            type="button"
                            onClick={markAllVisibleAsRead}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-white"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark visible read
                        </button>
                    </div>

                    <div className="mt-4 space-y-2">
                        {visibleNotifications.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-text-secondary">
                                No notifications yet.
                            </div>
                        ) : (
                            visibleNotifications.map((notification) => (
                                <button
                                    type="button"
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                                        notification.readFlag
                                            ? 'border-white/8 bg-white/[0.03]'
                                            : 'border-primary/20 bg-primary/10'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{notification.title}</p>
                                            <p className="mt-1 text-xs leading-5 text-text-secondary">{notification.message}</p>
                                        </div>
                                        {!notification.readFlag && (
                                            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-text-secondary/80">
                                        {formatTimestamp(notification.createdAt)}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
