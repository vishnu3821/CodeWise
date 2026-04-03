import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, Clock } from 'lucide-react';
import './NotificationBell.css'; // We'll create minimal styles for this

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (e, id) => {
        e.stopPropagation(); // prevent closing if clicking specific action
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${process.env.REACT_APP_API_URL}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // instantly update locally
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const markAllAsRead = async (e) => {
        e.preventDefault();
        if (unreadCount === 0) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${process.env.REACT_APP_API_URL}/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <div className="bell-icon-wrapper" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={24} className="bell-icon text-gray-700" />
                {unreadCount > 0 && (
                    <span className="bell-badge">{unreadCount}</span>
                )}
            </div>

            {isOpen && (
                <div className="notification-dropdown slide-down">
                    <div className="notification-header border-b pb-2 mb-2">
                        <h4 className="font-semibold text-lg m-0">Notifications</h4>
                        {unreadCount > 0 && (
                            <button className="mark-all-read-btn text-sm text-blue-600 hover:text-blue-800" onClick={markAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">
                                <Bell className="text-gray-300 mb-2" size={32} />
                                <p>No notifications yet.</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`notification-item ${n.is_read ? 'read' : 'unread'}`}>
                                    <div className="notification-content">
                                        <div className="notification-title">
                                            {n.title}
                                            {!n.is_read && <span className="new-dot"></span>}
                                        </div>
                                        <div className="notification-message">
                                            {n.message}
                                        </div>
                                        <div className="notification-time text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Clock size={12} /> {formatTime(n.created_at)}
                                        </div>
                                    </div>
                                    {!n.is_read && (
                                        <button className="mark-read-btn" onClick={(e) => markAsRead(e, n.id)} title="Mark as read">
                                            <Check size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
