import React, { useState, useEffect } from 'react';
import { AlertCircle, Send, Check } from 'lucide-react';
import axios from 'axios';

const VerificationBanner = ({ user }) => {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animation trigger on load
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let interval;
        if (cooldown > 0) {
            interval = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [cooldown]);

    if (user?.email_verified) return null;

    const handleResend = async () => {
        if (cooldown > 0 || sending) return;

        setSending(true);
        setError('');
        try {
            await axios.post('http://localhost:5001/api/auth/send-verification-email', { email: user.email });
            setSent(true);
            setCooldown(60); // 60s cooldown
            setTimeout(() => setSent(false), 3000); // Reset "Sent" icon state after 3s, but keep cooldown
        } catch (err) {
            setError('Failed to send email. Try again later.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div
            style={{
                backgroundColor: '#FFF7E6',
                borderLeft: '4px solid #F59E0B',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                marginBottom: '16px', // 12-16px margin as requested
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity 220ms ease-out, transform 220ms ease-out',
                width: '100%'
            }}
            className="p-4 hover:brightness-[0.99] transition-all duration-300"
        >
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                    <div
                        className="flex items-center justify-center shrink-0 mr-3"
                        style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: 'rgba(245, 158, 11, 0.15)', // Amber circle
                            borderRadius: '50%'
                        }}
                    >
                        <AlertCircle size={18} color="#F59E0B" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-base m-0 leading-tight">
                            Verify your email
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 leading-normal">
                            Your email is not verified. Progress tracking and submissions are restricted.
                        </p>
                        {error && <p className="text-red-600 text-xs mt-1 font-medium">{error}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Secondary Link */}
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || sending}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend'}
                    </button>

                    {/* Primary Button */}
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || sending}
                        className="flex items-center justify-center px-5 py-2 rounded-full text-white font-medium text-sm transition-all transform active:scale-[0.98]"
                        style={{
                            backgroundColor: sent ? '#10B981' : '#2563EB', // Blue or Green
                            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                        }}
                        onMouseEnter={(e) => {
                            if (!sent && cooldown === 0) {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.backgroundColor = '#1D4ED8'; // Darker blue
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!sent && cooldown === 0) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.backgroundColor = '#2563EB';
                            }
                        }}
                    >
                        {sending ? (
                            <span className="flex items-center">
                                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Sending...
                            </span>
                        ) : sent ? (
                            <span className="flex items-center">
                                <Check size={16} className="mr-1" /> Sent
                            </span>
                        ) : (
                            'Verify Email'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationBanner;
