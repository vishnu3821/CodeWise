import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';
import { useTransition } from '../context/TransitionContext';
import { toast } from '../utils/toast';
import './ContentManagerDashboard.css';

const PrepCompaniesList = () => {
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useTransition();

    const [companies, setCompanies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentCompany, setCurrentCompany] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', logo_file: null, logo_preview: null, remove_logo: 'false' });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            startLoading();
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/placement-prep/companies`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompanies(response.data);
        } catch (error) {
            console.error('Failed to fetch companies', error);
            toast.error('Failed to load companies.');
        } finally {
            stopLoading();
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ name: '', description: '', logo_file: null, logo_preview: null, remove_logo: 'false' });
        setIsModalOpen(true);
    };

    const openEditModal = (company) => {
        setModalMode('edit');
        setCurrentCompany(company);
        const previewUrl = company.logo_path ? `${process.env.REACT_APP_API_URL}/uploads/companies/${company.logo_path}` : null;
        setFormData({ name: company.name, description: company.description || '', logo_file: null, logo_preview: previewUrl, remove_logo: 'false' });
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPG, PNG, and WebP images are allowed.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB.');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setFormData({ ...formData, logo_file: file, logo_preview: previewUrl, remove_logo: 'false' });
    };

    const handleRemoveLogo = () => {
        setFormData({ ...formData, logo_file: null, logo_preview: null, remove_logo: 'true' });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCompany(null);
    };

    const handleSaveCompany = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Company Name is required');
            return;
        }

        try {
            startLoading();
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('name', formData.name.trim());
            data.append('description', formData.description.trim());
            data.append('remove_logo', formData.remove_logo);
            if (formData.logo_file) {
                data.append('logo', formData.logo_file);
            }

            if (modalMode === 'add') {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/placement-prep/companies`, data, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Company added successfully');
            } else {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/placement-prep/companies/${currentCompany.id}`, data, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Company updated successfully');
            }

            closeModal();
            fetchCompanies();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save company');
        } finally {
            stopLoading();
        }
    };

    const handleDelete = async (companyId) => {
        if (!window.confirm("Are you sure you want to delete this company? All associated questions will be deleted.")) return;

        try {
            startLoading();
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/placement-prep/companies/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Company deleted successfully');
            fetchCompanies();
        } catch (error) {
            toast.error('Failed to delete company');
        } finally {
            stopLoading();
        }
    };

    const getTypeBadge = (tech, hr) => {
        if (tech > 0 && hr > 0) return <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', background: '#f5f3ff', color: '#7c3aed' }}>Both</span>;
        if (tech > 0) return <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', background: '#eff6ff', color: '#2563eb' }}>Technical</span>;
        if (hr > 0) return <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', background: '#ecfdf5', color: '#10b981' }}>HR</span>;
        return <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', background: '#f1f5f9', color: '#64748b' }}>None</span>;
    };

    return (
        <>

            <header className="admin-header">
                <div className="admin-title">
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                        Placement Prep Manager / Manage Companies
                    </div>
                    <h1>Companies List</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <NotificationBell />
                    <span className="badge badge-active" style={{ backgroundColor: '#e2ffe9', color: '#16a34a' }}>CONTENT MANAGER</span>
                </div>
            </header>

            <div style={{ padding: '0 32px 32px 32px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={handleSearch}
                            style={{
                                width: '100%', padding: '10px 10px 10px 40px',
                                border: '1px solid #e2e8f0', borderRadius: '8px',
                                fontSize: '14px', outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        onClick={openAddModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                    >
                        <Plus size={18} /> Add Company
                    </button>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.05em' }}>COMPANY NAME</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.05em' }}>TYPE AVAILABLE</th>
                                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.05em' }}>TECH QUESTIONS</th>
                                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.05em' }}>HR QUESTIONS</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.05em' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.length > 0 ? filteredCompanies.map(company => (
                                <tr key={company.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '8px',
                                            background: '#eff6ff', color: '#1d4ed8',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: '600', fontSize: '18px'
                                        }}>
                                            {company.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ color: '#0f172a', fontWeight: '500', fontSize: '15px' }}>{company.name}</div>
                                            {company.description && <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{company.description}</div>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {getTypeBadge(company.technical_count, company.hr_count)}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
                                        {company.technical_count}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
                                        {company.hr_count}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                                            <button onClick={() => navigate(`/content-dashboard/placement-prep/companies/${company.slug || company.id}`)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', outline: 'none' }} title="View">
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={() => openEditModal(company)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', outline: 'none' }} title="Edit">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(company.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', outline: 'none' }} title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No companies found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', background: '#fafafa' }}>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>Showing all companies</span>
                    </div>
                </div>
            </div>

            {/* Modal for Add / Edit */}
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
                                {modalMode === 'add' ? 'Add New Company' : 'Edit Company'}
                            </h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCompany}>
                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Company Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                        placeholder="e.g. Google"
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Description / Founded Info</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                        placeholder="e.g. Founded 1998"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Company Logo (Optional)</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden',
                                            background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            {formData.logo_preview ? (
                                                <img src={formData.logo_preview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '24px', fontWeight: '600', color: '#94a3b8' }}>
                                                    {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                                id="logo-upload"
                                            />
                                            <label htmlFor="logo-upload" style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: '500', color: '#475569', cursor: 'pointer', display: 'inline-block', marginBottom: '8px' }}>
                                                Upload Logo
                                            </label>
                                            {formData.logo_preview && (
                                                <button type="button" onClick={handleRemoveLogo} style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                                                    Remove
                                                </button>
                                            )}
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Max 2MB. JPG, PNG, WebP</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                <button type="button" onClick={closeModal} style={{ padding: '10px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ padding: '10px 16px', background: '#2563eb', border: '1px solid #2563eb', borderRadius: '6px', color: '#fff', fontWeight: '500', cursor: 'pointer' }}>
                                    Save Company
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PrepCompaniesList;
