import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, LogOut, Settings, PenTool } from 'lucide-react';
// import EditProfileModal from './EditProfileModal'; // Removed

const UserProfileDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    // const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Removed
    const dropdownRef = useRef(null);

    // Needed to force update parent user state if changed in modal
    // Actually, onLogout handles logout, but we need onUpdate to update Dashboard state.
    // Dashboard passes 'user' prop. We can't update it directly here without a callback.
    // For now, we'll update localStorage in Modal, but UI won't reflect instantly unless we reload or have context.
    // Dashboard reads from localStorage on mount.
    // Let's add an onUpdate prop or just reload for simplicity if prop missing.
    // Ideally, App context should verify user.
    // Since we don't have global state, we can emit an event or reloading.

    // Better: Dashboard passes `setUser`? No, it passes `user`.
    // Let's assume for now we just show success and reload or just update local view if possible.
    // But wait, the dropdown "user" prop comes from Dashboard -> Header -> Dropdown.
    // So if I update localStorage, Dashboard won't know. 
    // I can trigger a window reload or custom event. 
    // Let's use window.location.reload() for simplicity after successful edit, 
    // OR just use a simple event listener in Dashboard if I want to be fancy.
    // Given the constraints, I will try to support an 'onUserUpdate' prop if passed, or reload.

    const toggleDropdown = () => setIsOpen(!isOpen);

    // handleEditProfileData removed as page handles it independently with reload/redirect logic or just internal state update


    // ... (useEffect clickOutside and fetchProgress remain same)

    if (!user) return null;

    return (
        <>
            <div className="profile-dropdown-container" ref={dropdownRef}>
                {/* Trigger Btn (Same) */}
                <div className="profile-trigger-btn" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                    {/* ... Same Avatar Logic ... */}
                    {user?.profile_picture ? (
                        <img
                            src={user.profile_picture}
                            alt={user.name}
                            className="user-avatar-small"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="user-avatar-small">
                            <User size={20} />
                        </div>
                    )}
                </div>

                {isOpen && (
                    <div className="profile-dropdown-panel">
                        <div className="profile-header">
                            {/* ... Same Header ... */}
                            <div className="user-avatar-large">
                                {user?.profile_picture ? (
                                    <img
                                        src={user.profile_picture}
                                        alt={user.name}
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user.name ? user.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <div className="user-details">
                                <h3 className="user-name">{user.name}</h3>
                                <span className="user-email">{user.email}</span>
                                <span className="member-since">Member since {new Date().getFullYear()}</span>
                            </div>
                        </div>

                        {/* Stats Section (Same) */}
                        {/* Stats Section Removed */}

                        <div className="profile-actions" style={{ marginTop: '20px' }}>

                            {/* Edit Profile Link */}
                            <Link
                                to="/profile"
                                className="edit-profile-btn"
                                onClick={() => setIsOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '8px',
                                    marginBottom: '8px',
                                    borderRadius: '6px',
                                    backgroundColor: '#EFF6FF',
                                    color: '#2563EB',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textDecoration: 'none'
                                }}
                            >
                                <PenTool size={16} />
                                Edit Profile
                            </Link>

                            <button
                                className="logout-action-btn"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to log out?')) {
                                        onLogout();
                                    }
                                }}
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default UserProfileDropdown;
