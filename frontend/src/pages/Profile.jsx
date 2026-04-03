import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, User, Award, CheckCircle, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/progress/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setProfile(res.data);
                } catch (err) {
                    console.error('Error fetching profile', err);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="loading-state">Loading profile...</div>;
    if (!profile) return <div className="error-state">Please log in to view profile.</div>;

    const { user, stats } = profile;

    return (
        <div className="profile-page">
            <div className="page-header">
                <Link to="/dashboard" className="back-link">
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>
                <h1>User Profile</h1>
            </div>

            <div className="profile-content">
                <div className="profile-card user-details">
                    <div className="avatar-placeholder">
                        <User size={64} />
                    </div>
                    <h2>{user.name}</h2>
                    <p className="email">{user.email}</p>
                    <p className="joined-date">Member since: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon passed">
                            <CheckCircle size={32} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.solved_questions}</h3>
                            <p>Questions Solved</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon topic">
                            <Award size={32} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.completed_topics}</h3>
                            <p>Topics Completed</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon streak">
                            <Flame size={32} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.c_completion_percentage}%</h3>
                            <p>C Mastery</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                .profile-content {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 2rem;
                    margin-top: 2rem;
                }
                .profile-card {
                    background: var(--bg-secondary);
                    padding: 2rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    text-align: center;
                }
                .avatar-placeholder {
                    width: 100px;
                    height: 100px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    color: white;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }
                .stat-card {
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .stat-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-icon.passed { background: rgba(34, 197, 94, 0.1); color: var(--success-color); }
                .stat-icon.topic { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .stat-icon.streak { background: rgba(249, 115, 22, 0.1); color: #f97316; }
                
                .stat-info h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.25rem;
                }
                .stat-info p {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                @media (max-width: 768px) {
                    .profile-content {
                        grid-template-columns: 1fr;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
