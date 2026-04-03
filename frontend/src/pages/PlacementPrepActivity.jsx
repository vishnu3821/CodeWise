import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Filter, Plus, Edit, Trash2, Building2, HelpCircle, Activity } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import { useTransition } from '../context/TransitionContext';
import { toast } from '../utils/toast';
import './ContentManagerDashboard.css';

const PlacementPrepActivity = () => {
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useTransition();
    const [activities, setActivities] = useState([]);
    const [filter, setFilter] = useState('all'); // all, today, week, month

    useEffect(() => {
        fetchActivityLogs();
    }, [filter]); // Re-fetch when filter changes

    const fetchActivityLogs = async () => {
        try {
            startLoading();
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/activity?filter=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
            toast.error('Failed to load recent activity.');
        } finally {
            stopLoading();
        }
    };

    const getActionIcon = (actionType) => {
        switch (actionType) {
            case 'add': return <Plus size={16} className="text-green-600" />;
            case 'edit': return <Edit size={16} className="text-blue-600" />;
            case 'delete': return <Trash2 size={16} className="text-red-600" />;
            default: return <Activity size={16} className="text-gray-600" />;
        }
    };

    const getActionBackground = (actionType) => {
        switch (actionType) {
            case 'add': return 'bg-green-100';
            case 'edit': return 'bg-blue-100';
            case 'delete': return 'bg-red-100';
            default: return 'bg-gray-100';
        }
    };

    const getEntityIcon = (entityType) => {
        return entityType === 'company' ? <Building2 size={14} /> : <HelpCircle size={14} />;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) return `${diffMins || 1} min${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) {
            if (date.getDate() === now.getDate()) {
                return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
                return 'Yesterday';
            }
        }

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <>
            <header className="admin-header">
                <div className="admin-title">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock className="text-blue-600" size={28} />
                        My Placement Prep Activity
                    </h1>
                    <p>Track your recent contributions, edits, and deletions.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <NotificationBell />
                    <span className="badge badge-active" style={{ backgroundColor: '#e2ffe9', color: '#16a34a' }}>CONTENT MANAGER</span>
                </div>
            </header>

            <div style={{ padding: '0 32px 32px 32px', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-slate-800">Activity Timeline</h2>
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-500" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    {activities.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Clock size={48} className="mx-auto mb-4 text-slate-300 opacity-50" />
                            <p className="text-lg font-medium">No activity found</p>
                            <p className="text-sm">You haven't made any changes in this time period.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                            {activities.map((activity, index) => (
                                <div key={activity.id} className="relative pl-8">
                                    {/* Timeline dot */}
                                    <div className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center ${getActionBackground(activity.action_type)}`}>
                                        {getActionIcon(activity.action_type)}
                                    </div>

                                    <div className="bg-slate-50/50 rounded-lg p-4 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-medium text-slate-800">
                                                {activity.description}
                                            </p>
                                            <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-100 whitespace-nowrap ml-4">
                                                {formatTime(activity.created_at)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
                                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-slate-200">
                                                {getEntityIcon(activity.entity_type)}
                                                <span className="capitalize">{activity.entity_type} ID: {activity.entity_id}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-slate-200">
                                                <Building2 size={13} className="text-slate-400" />
                                                <span>{activity.company_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PlacementPrepActivity;
