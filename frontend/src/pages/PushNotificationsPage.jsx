import React, { useState } from 'react';
import axios from 'axios';
import { Send, Users, Shield, Globe, Check } from 'lucide-react';
import { useTransition } from '../context/TransitionContext';
import './PushNotificationsPage.css';

const PushNotificationsPage = () => {
    const { startLoading, stopLoading } = useTransition();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
    const [isSending, setIsSending] = useState(false);

    const isFormValid = title.trim() !== '' && message.trim() !== '' && targetRole !== '';

    const handleSendPush = async (e) => {
        e.preventDefault();
        setStatusMsg({ text: '', type: '' });

        if (!isFormValid) {
            return;
        }

        try {
            setIsSending(true);
            startLoading();
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/notifications/admin/push`,
                { title, message, target_role: targetRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMsg({ text: res.data.message || 'Notification sent successfully!', type: 'success' });
            setTitle('');
            setMessage('');
            setTargetRole('');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setStatusMsg({ text: '', type: '' });
            }, 3000);
        } catch (err) {
            console.error(err);
            setStatusMsg({
                text: err.response?.data?.message || 'Failed to send notification.',
                type: 'error'
            });
        } finally {
            setIsSending(false);
            stopLoading();
        }
    };

    return (
        <div className="push-notification-page">
            <div className="pn-header">
                <h1 className="pn-title">Broadcast Notification</h1>
                <p className="pn-subtitle">Send instant notifications to platform users.</p>
            </div>
            <hr className="pn-divider" />

            <div className="pn-card-container">
                <form onSubmit={handleSendPush} className="pn-form">

                    {/* Section 1: Title */}
                    <div className="pn-form-section">
                        <label className="pn-label">Notification Title</label>
                        <input
                            type="text"
                            className="pn-input"
                            placeholder="e.g. Scheduled Maintenance"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Section 2: Message */}
                    <div className="pn-form-section">
                        <label className="pn-label">Message Content</label>
                        <textarea
                            className="pn-textarea"
                            placeholder="Write your push notification message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                        <div className="pn-char-counter">
                            {message.length} characters
                        </div>
                    </div>

                    {/* Section 3: Target Audience */}
                    <div className="pn-form-section">
                        <label className="pn-label">Target Audience</label>
                        <div className="pn-radio-group">
                            <label className={`pn-radio-card ${targetRole === 'student' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="targetRole"
                                    value="student"
                                    checked={targetRole === 'student'}
                                    onChange={() => setTargetRole('student')}
                                    className="pn-radio-input"
                                />
                                <div className="pn-card-content">
                                    <Users size={20} className="pn-icon" />
                                    <span className="pn-card-text">Students</span>
                                </div>
                                {targetRole === 'student' && <div className="pn-check"><Check size={16} /></div>}
                            </label>

                            <label className={`pn-radio-card ${targetRole === 'content_manager' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="targetRole"
                                    value="content_manager"
                                    checked={targetRole === 'content_manager'}
                                    onChange={() => setTargetRole('content_manager')}
                                    className="pn-radio-input"
                                />
                                <div className="pn-card-content">
                                    <Shield size={20} className="pn-icon" />
                                    <span className="pn-card-text">Managers</span>
                                </div>
                                {targetRole === 'content_manager' && <div className="pn-check"><Check size={16} /></div>}
                            </label>

                            <label className={`pn-radio-card ${targetRole === 'all' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="targetRole"
                                    value="all"
                                    checked={targetRole === 'all'}
                                    onChange={() => setTargetRole('all')}
                                    className="pn-radio-input"
                                />
                                <div className="pn-card-content">
                                    <Globe size={20} className="pn-icon" />
                                    <span className="pn-card-text">All Users</span>
                                </div>
                                {targetRole === 'all' && <div className="pn-check"><Check size={16} /></div>}
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pn-form-actions">
                        <button
                            type="submit"
                            className={`pn-submit-btn ${!isFormValid || isSending ? 'disabled' : ''}`}
                            disabled={!isFormValid || isSending}
                        >
                            {isSending ? (
                                <div className="pn-spinner"></div>
                            ) : (
                                <>
                                    <Send size={18} /> Send Notification Now
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Success/Error Toast */}
                {statusMsg.text && (
                    <div className={`pn-toast ${statusMsg.type}`}>
                        {statusMsg.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PushNotificationsPage;
