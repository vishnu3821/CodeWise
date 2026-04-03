import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Code2, Users, History, Clock, ArrowRight, Plus, Edit2, Trash2, X, Briefcase, BookOpen, Monitor } from 'lucide-react';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';
import { useTransition } from '../context/TransitionContext';
import { toast } from '../utils/toast';
import './ContentManagerDashboard.css';

const PrepCompanyModules = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useTransition();

    const [company, setCompany] = useState(null);
    const [modules, setModules] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentModule, setCurrentModule] = useState(null);
    const [formData, setFormData] = useState({ module_name: '', module_type: 'Technical', custom_type: '', description: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                startLoading();
                const token = localStorage.getItem('token');

                // Fetch Company Details
                const compRes = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/companies/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCompany(compRes.data);

                // Fetch Modules
                const modRes = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/companies/${compRes.data.id}/modules`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setModules(modRes.data);

            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load company or modules.');
                navigate('/content-dashboard/placement-prep/companies');
            } finally {
                stopLoading();
            }
        };

        fetchData();
    }, [companyId, navigate, startLoading, stopLoading]);

    const fetchModules = async (compId) => {
        try {
            const token = localStorage.getItem('token');
            const modRes = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/companies/${compId}/modules`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModules(modRes.data);
        } catch (error) {
            console.error('Failed to fetch modules:', error);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ module_name: '', module_type: 'Technical', custom_type: '', description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (mod) => {
        setModalMode('edit');
        setCurrentModule(mod);

        const standardTypes = ['Technical', 'HR', 'Aptitude', 'Coding', 'Managerial'];
        const isStandard = standardTypes.includes(mod.module_type);

        setFormData({
            module_name: mod.module_name,
            module_type: isStandard ? mod.module_type : 'Custom',
            custom_type: isStandard ? '' : mod.module_type,
            description: mod.description || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentModule(null);
    };

    const handleSaveModule = async (e) => {
        e.preventDefault();
        if (!formData.module_name.trim()) {
            toast.error('Module Name is required');
            return;
        }
        if (formData.module_type === 'Custom' && !formData.custom_type.trim()) {
            toast.error('Custom Module Type is required');
            return;
        }

        try {
            startLoading();
            const token = localStorage.getItem('token');
            const payload = {
                module_name: formData.module_name.trim(),
                module_type: formData.module_type === 'Custom' ? formData.custom_type.trim() : formData.module_type,
                description: formData.description.trim()
            };

            if (modalMode === 'add') {
                await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/companies/${company.id}/modules`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Module added successfully');
            } else {
                await axios.put(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/modules/${currentModule.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Module updated successfully');
            }

            closeModal();
            fetchModules(company.id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save module');
        } finally {
            stopLoading();
        }
    };

    const handleDeleteModule = async (modId) => {
        if (!window.confirm("Are you sure you want to delete this module? It will fail if there are existing questions linked to it.")) return;

        try {
            startLoading();
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/modules/${modId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Module deleted successfully');
            fetchModules(company.id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete module');
        } finally {
            stopLoading();
        }
    };

    const getModuleIconParams = (type) => {
        switch (type) {
            case 'Technical': return { icon: <Code2 size={24} />, bg: '#eff6ff', color: '#3b82f6' };
            case 'HR': return { icon: <Users size={24} />, bg: '#faf5ff', color: '#a855f7' };
            case 'Aptitude': return { icon: <BookOpen size={24} />, bg: '#fff7ed', color: '#f97316' };
            case 'Coding': return { icon: <Monitor size={24} />, bg: '#ecfdf5', color: '#10b981' };
            case 'Managerial': return { icon: <Briefcase size={24} />, bg: '#fef2f2', color: '#ef4444' };
            default: return { icon: <Code2 size={24} />, bg: '#f1f5f9', color: '#64748b' };
        }
    };

    if (!company) return null;

    return (
        <>
            <header className="admin-header">
                <div className="admin-title">
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate('/content-dashboard/placement-prep/companies')}>
                        Placement Prep Manager / Manage Companies / <span style={{ color: '#0f172a', fontWeight: '500' }}>{company.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {company.name} – Interview Modules
                            </h1>
                            <p>Manage interview modules and questions for {company.name} candidates.</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                        >
                            <Plus size={18} /> Add New Module
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <NotificationBell />
                    <span className="badge badge-active" style={{ backgroundColor: '#e2ffe9', color: '#16a34a' }}>CONTENT MANAGER</span>
                </div>
            </header>

            <div style={{ padding: '0 32px 32px 32px', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <div className="cm-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '4px', textTransform: 'uppercase' }}>Company</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{company.name}</div>
                            {company.description && <div style={{ fontSize: '13px', color: '#64748b' }}>{company.description}</div>}
                        </div>
                    </div>
                    <div className="cm-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '4px', textTransform: 'uppercase' }}>Total Modules</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{modules.length} Modules</div>
                        </div>
                    </div>
                    <div className="cm-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Code2 size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '4px', textTransform: 'uppercase' }}>Total Questions</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{modules.reduce((sum, mod) => sum + mod.question_count, 0)}</div>
                        </div>
                    </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>Interview Modules</h2>

                {/* Modules Grid dynamically rendered */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                    {modules.map(mod => {
                        const styleParams = getModuleIconParams(mod.module_type);
                        return (
                            <div key={mod.id} className="cm-card" style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px' }}>
                                    <button onClick={() => openEditModal(mod)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', outline: 'none' }} title="Edit Module">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteModule(mod.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', outline: 'none' }} title="Delete Module">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: styleParams.bg, color: styleParams.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {styleParams.icon}
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingRight: '40px' }}>{mod.module_name}</h3>
                                <div style={{ display: 'inline-block', padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontSize: '12px', fontWeight: '500', marginBottom: '12px', alignSelf: 'flex-start' }}>{mod.module_type}</div>
                                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', flexGrow: 1 }}>
                                    {mod.description || 'No description provided.'}
                                </p>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', flex: 1 }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Total Questions</div>
                                        <div style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>{mod.question_count}</div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', flex: 1 }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Last Updated</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginTop: '4px' }}>{formatTime(mod.last_updated)}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/content-dashboard/placement-prep/companies/${company.slug || company.id}/modules/${mod.id}`)}
                                    style={{ width: '100%', padding: '14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                >
                                    Manage Questions <ArrowRight size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {modules.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', border: '1px dashed #cbd5e1', borderRadius: '12px', marginBottom: '48px' }}>
                        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '16px' }}>No modules found for this company.</p>
                        <button
                            onClick={openAddModal}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                        >
                            <Plus size={18} /> Create First Module
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for Add / Edit Module */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px'
                }}>
                    <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
                                {modalMode === 'add' ? 'Add New Module' : 'Edit Module'}
                            </h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveModule}>
                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Module Name *</label>
                                    <input
                                        type="text"
                                        value={formData.module_name}
                                        onChange={(e) => setFormData({ ...formData, module_name: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                        placeholder="e.g. Advanced Coding Round"
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Module Type *</label>
                                    <select
                                        value={formData.module_type}
                                        onChange={(e) => setFormData({ ...formData, module_type: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#fff' }}
                                    >
                                        <option value="Technical">Technical</option>
                                        <option value="HR">HR</option>
                                        <option value="Aptitude">Aptitude</option>
                                        <option value="Coding">Coding</option>
                                        <option value="Managerial">Managerial</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                    {formData.module_type === 'Custom' && (
                                        <div style={{ marginTop: '12px' }}>
                                            <input
                                                type="text"
                                                value={formData.custom_type}
                                                onChange={(e) => setFormData({ ...formData, custom_type: e.target.value })}
                                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                                placeholder="Enter custom module type name"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', minHeight: '80px', resize: 'vertical' }}
                                        placeholder="Brief description of what this module covers..."
                                    />
                                </div>
                            </div>
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                <button type="button" onClick={closeModal} style={{ padding: '10px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ padding: '10px 16px', background: '#2563eb', border: '1px solid #2563eb', borderRadius: '6px', color: '#fff', fontWeight: '500', cursor: 'pointer' }}>
                                    Save Module
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PrepCompanyModules;
