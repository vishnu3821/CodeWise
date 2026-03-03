import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ListTree, History } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import './ContentManagerDashboard.css';

const PlacementPrepManager = () => {
    const navigate = useNavigate();

    // Mock recent activity (in reality, this could come from backend audit logs)
    const recentActivity = [
        {
            action: 'Added new company profile',
            target: 'TechCorp Solutions',
            time: '2 hours ago',
            type: 'add'
        },
        {
            action: 'Updated questions for',
            target: 'Google - Software Engineer L3',
            time: 'Yesterday',
            type: 'edit'
        },
        {
            action: 'Added new interview experience',
            target: 'Amazon SDE-1',
            time: '2 days ago',
            type: 'add'
        },
        {
            action: 'Removed deprecated content',
            target: 'Legacy Java Questions',
            time: '3 days ago',
            type: 'delete'
        }
    ];

    return (
        <>
            <header className="admin-header">
                <div className="admin-title">
                    <h1>Placement Prep Manager</h1>
                    <p>Manage company-based interview preparation content.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <NotificationBell />
                    <span className="badge badge-active" style={{ backgroundColor: '#e2ffe9', color: '#16a34a' }}>CONTENT MANAGER</span>
                </div>
            </header>

            <div className="cm-hero" style={{ textAlign: 'left', padding: '0', background: 'transparent' }}>
                <div className="cm-action-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

                    {/* Manage Companies Card */}
                    <div className="cm-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <div className="cm-card-icon blue" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <Building2 size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Manage Companies</h3>
                        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5', flexGrow: 1, marginBottom: '24px' }}>
                            Add, edit, or remove company profiles and their specific interview requirements.
                        </p>
                        <button
                            style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
                            onClick={() => navigate('/content-dashboard/placement-prep/companies')}
                        >
                            Open
                        </button>
                    </div>

                    {/* Manage Questions Card */}
                    <div className="cm-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <div className="cm-card-icon purple" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <ListTree size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Manage Questions</h3>
                        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5', flexGrow: 1, marginBottom: '24px' }}>
                            Curate technical and HR interview questions categorized by company and role.
                        </p>
                        <button
                            style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
                            onClick={() => navigate('/content-dashboard/placement-prep/companies')}
                        >
                            Open
                        </button>
                    </div>

                </div>

                <div className="cm-secondary-section" style={{ marginTop: '48px', background: 'transparent', border: 'none', padding: '0' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        <History size={20} className="text-slate-400" /> Recent Activity
                    </h2>

                    <div className="cm-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {recentActivity.map((activity, index) => (
                            <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    border: '1px solid #e2e8f0',
                                    background: '#fff',
                                    color: activity.type === 'delete' ? '#64748b' : '#94a3b8'
                                }}>
                                    {activity.type === 'add' && <span style={{ fontSize: '18px' }}>+</span>}
                                    {activity.type === 'edit' && <span style={{ fontSize: '14px' }}>✎</span>}
                                    {activity.type === 'delete' && <span style={{ fontSize: '16px' }}>🗑</span>}
                                </div>
                                <div>
                                    <div style={{ color: '#1e293b', fontSize: '15px', fontWeight: '500' }}>
                                        {activity.action}: <span style={{ color: '#64748b', fontWeight: '400' }}>{activity.target}</span>
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
};

export default PlacementPrepManager;
