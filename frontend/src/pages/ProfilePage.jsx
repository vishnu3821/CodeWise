import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Camera, Lock, Save, AlertCircle } from 'lucide-react';
import ReportIssueForm from '../components/ReportIssueForm';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password Change State
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        // Fetch fresh user data on mount if needed, or use localStorage
        // Ideally verify with backend, but for now stick to localStorage + optional re-fetch logic
        // We'll use the user from state initialized from localStorage
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPreview(user.profile_picture || null);
        }
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 2 * 1024 * 1024) {
                setError('File size must be less than 2MB');
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError('');
        }
    };

    const [activeTab, setActiveTab] = useState('settings');

    const handleBack = () => {
        if (user.role === 'content_manager' || user.role === 'admin') {
            navigate('/content-dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };

        try {
            if (showPasswordChange) {
                // Change Password Logic
                if (!currentPassword || !newPassword || !confirmPassword) {
                    throw new Error('All password fields are required');
                }
                if (newPassword !== confirmPassword) {
                    throw new Error('New passwords do not match');
                }
                if (newPassword.length < 8) {
                    throw new Error('Password must be at least 8 characters');
                }

                await axios.post('http://localhost:5001/api/users/change-password', {
                    currentPassword,
                    newPassword
                }, config);

                setSuccess('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordChange(false);
            } else {
                // Update Profile Logic
                if (!name.trim()) {
                    throw new Error('Name is required');
                }

                const formData = new FormData();
                formData.append('name', name);
                if (file) {
                    formData.append('profilePicture', file);
                }

                const response = await axios.post('http://localhost:5001/api/users/update-profile', formData, {
                    headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
                });

                // Update local storage
                const updatedUser = response.data.user;
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const newUserData = { ...currentUser, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(newUserData));
                setUser(newUserData);

                setSuccess('Profile updated successfully');
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="profile-page-container">
            <div className="profile-page-content" style={{ display: 'flex', gap: '2rem', maxWidth: '900px' }}>

                {/* Profile Sidebar */}
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <div className="profile-page-header" style={{ marginBottom: '2rem' }}>
                        <h1>My Account</h1>
                        <button onClick={handleBack} className="back-dashboard-btn" style={{ fontSize: '0.85rem' }}>
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                            className={`btn-cancel ${activeTab === 'settings' ? 'active-profile-tab' : ''}`}
                            onClick={() => setActiveTab('settings')}
                            style={{
                                textAlign: 'left', border: activeTab === 'settings' ? '1px solid #3B82F6' : '1px solid transparent',
                                background: activeTab === 'settings' ? '#EFF6FF' : 'transparent',
                                color: activeTab === 'settings' ? '#1D4ED8' : '#64748B'
                            }}
                        >
                            <User size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> Profile Settings
                        </button>
                        <button
                            className={`btn-cancel ${activeTab === 'report' ? 'active-profile-tab' : ''}`}
                            onClick={() => setActiveTab('report')}
                            style={{
                                textAlign: 'left', border: activeTab === 'report' ? '1px solid #EF4444' : '1px solid transparent',
                                background: activeTab === 'report' ? '#FEF2F2' : 'transparent',
                                color: activeTab === 'report' ? '#B91C1C' : '#64748B'
                            }}
                        >
                            <AlertCircle size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> Report an Issue
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1 }}>
                    {activeTab === 'settings' ? (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <form onSubmit={handleSubmit}>
                                {/* Avatar Section */}
                                <div className="profile-avatar-section">
                                    <div className="profile-avatar-wrapper">
                                        {preview ? (
                                            <img src={preview} alt="Profile" className="profile-avatar-img" />
                                        ) : (
                                            <div className="profile-avatar-placeholder">
                                                <User size={48} />
                                            </div>
                                        )}
                                        <label className="profile-avatar-overlay">
                                            <Camera size={24} />
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/jpeg, image/png"
                                                onChange={handleFileChange}
                                                disabled={showPasswordChange}
                                            />
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        className="change-avatar-btn"
                                        disabled={showPasswordChange}
                                        onClick={() => document.querySelector('input[type=file]').click()}
                                    >
                                        Change photo
                                    </button>
                                </div>

                                {/* Basic Info */}
                                <div className="profile-form-group">
                                    <label className="profile-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="profile-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your full name"
                                        disabled={showPasswordChange}
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label className="profile-label">Email Address</label>
                                    <div className="form-input-container">
                                        <Lock size={16} className="lock-icon" />
                                        <input
                                            type="email"
                                            className="profile-input"
                                            value={email}
                                            disabled
                                            style={{ paddingLeft: 35 }}
                                        />
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="password-toggle-container">
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => {
                                            setShowPasswordChange(!showPasswordChange);
                                            setError('');
                                            setSuccess('');
                                        }}
                                    >
                                        {showPasswordChange ? 'Cancel Change Password' : 'Change Password'}
                                    </button>
                                </div>

                                <div className={`password-fields-section ${showPasswordChange ? 'open' : ''}`}>
                                    <div className="profile-form-group">
                                        <label className="profile-label">Current Password</label>
                                        <input
                                            type="password"
                                            className="profile-input"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div className="profile-form-group">
                                        <label className="profile-label">New Password</label>
                                        <input
                                            type="password"
                                            className="profile-input"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min 8 characters"
                                        />
                                    </div>
                                    <div className="profile-form-group">
                                        <label className="profile-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="profile-input"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter new password"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="profile-actions">
                                    {error && <span style={{ color: '#EF4444', marginRight: 'auto' }}>{error}</span>}
                                    {success && <span style={{ color: '#10B981', marginRight: 'auto' }}>{success}</span>}

                                    <button type="submit" className="profile-save-btn" disabled={loading}>
                                        {loading ? 'Saving...' : (showPasswordChange ? 'Update Password' : (
                                            <>
                                                <Save size={18} /> Save Changes
                                            </>
                                        ))}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <ReportIssueForm
                                onCancel={() => setActiveTab('settings')}
                                onSuccess={() => { }} // Could refresh a list if we implemented the list view here too
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
