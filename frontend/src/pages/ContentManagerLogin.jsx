import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Lock, AlertCircle } from 'lucide-react';
import './ContentManagerLogin.css';

const ContentManagerLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData);
            const { token, user } = res.data;

            if (user.role !== 'content_manager' && user.role !== 'admin') {
                setError('Access Denied. This portal is for Content Managers only.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/content-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cm-login-container">
            <div className="cm-login-card">
                <div className="cm-login-header">
                    <div className="logo-area">
                        <div className="logo-icon">
                            <LayoutDashboard size={24} color="white" />
                        </div>
                        <span className="logo-text">CodeWise</span>
                    </div>
                    <h2>Content Manager Login</h2>
                    <p>Secure access for content creators</p>
                </div>

                <form onSubmit={handleSubmit} className="cm-login-form">
                    {error && (
                        <div className="error-alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="cmvai@codewise.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Login to Dashboard'}
                    </button>
                </form>

                <div className="cm-login-footer">
                    <Lock size={14} />
                    <span>Restricted Area. Authorized Personnel Only.</span>
                </div>
            </div>
        </div>
    );
};

export default ContentManagerLogin;
