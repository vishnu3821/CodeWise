import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import Modal from '../components/Modal';
import { useTransition } from '../context/TransitionContext';
import './Login.css';

const Login = () => {
    // Mode toggle between Login and Signup
    const [isLogin, setIsLogin] = useState(true);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot Password State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');

    const navigate = useNavigate();
    const { triggerTransition } = useTransition();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const { data } = await axios.post('http://localhost:5001/api/auth/google', {
                    token: tokenResponse.access_token
                });

                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.token) localStorage.setItem('token', data.token);

                if (data.user.role === 'admin') navigate('/admin-dashboard');
                else if (data.user.role === 'content_manager') navigate('/content-dashboard');
                else navigate('/dashboard');
            } catch (err) {
                console.error('Google Login Error:', err);
                setError('Google sign-in failed. Please try again.');
            }
        },
        onError: () => setError('Google Login Failed'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

            if (!isLogin && formData.password !== formData.confirmPassword) {
                throw new Error("Passwords do not match");
            }

            const { data } = await axios.post(`http://localhost:5001${endpoint}`, formData);

            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            if (data.user.role === 'admin') navigate('/admin-dashboard');
            else if (data.user.role === 'content_manager') navigate('/content-dashboard');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotMessage('');
        try {
            const { data } = await axios.post('http://localhost:5001/api/auth/forgot-password', { email: forgotEmail });
            setForgotMessage(data.message || 'Reset link sent!');
        } catch (err) {
            setForgotMessage(err.response?.data?.message || 'Failed to send reset link');
        }
    };

    return (
        <div className="auth-page">
            <div className="blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            <div className="blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            <Link to="/" className="back-link">
                <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="auth-card">
                <div className="auth-header">
                    <h1>{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
                </div>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={16} style={{ display: 'inline', marginRight: '5px' }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="input-wrapper">
                            <UserPlus size={18} className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Full Name"
                                className="auth-input"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="auth-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            className="auth-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                className="auth-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {isLogin && (
                        <div className="forgot-password">
                            <Link to="#" onClick={() => setShowForgotModal(true)} className="forgot-link">Forgot Password?</Link>
                        </div>
                    )}

                    <button type="submit" className="btn-auth-primary" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="divider">
                    <span>Or continue with</span>
                </div>

                <div className="social-actions">
                    <button className="btn-google" onClick={() => googleLogin()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                {/* Toggle between Sign In / Sign Up */}
                <div className="auth-switch">
                    {isLogin ? (
                        <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign up</button></p>
                    ) : (
                        <p>Already have an account? <button onClick={() => setIsLogin(true)}>Sign in</button></p>
                    )}
                </div>
            </div>

            {/* Forgot Password Modal */}
            <Modal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} title="Reset Password">
                <div style={{ padding: '1rem' }}>
                    <p style={{ marginBottom: '1.5rem', color: '#64748B' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <form onSubmit={handleForgotSubmit}>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="Enter your email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                required
                            />
                        </div>
                        {forgotMessage && (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                marginTop: '1rem',
                                background: forgotMessage.includes('Failed') ? '#FEF2F2' : '#F0FDF4',
                                color: forgotMessage.includes('Failed') ? '#EF4444' : '#166534'
                            }}>
                                {forgotMessage}
                            </div>
                        )}
                        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                            Send Reset Link
                        </button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Login;
