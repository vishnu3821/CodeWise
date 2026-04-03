import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, CheckCircle, XCircle, List } from 'lucide-react';
import './ContentManagerDashboard.css'; // Reuse CM Dashboard styles
import Modal from '../components/Modal';

const ManageLanguages = () => {
    const navigate = useNavigate();
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentLang, setCurrentLang] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        difficulty_levels: ['Easy', 'Medium', 'Hard'],
        is_active: false,
        has_practice: true,
        has_notes: true
    });

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/languages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLanguages(res.data);
        } catch (err) {
            console.error('Failed to fetch languages', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (lang = null) => {
        if (lang) {
            setModalMode('edit');
            setCurrentLang(lang);
            setFormData({
                name: lang.name,
                slug: lang.slug,
                description: lang.description || '',
                difficulty_levels: lang.difficulty_levels || ['Easy', 'Medium', 'Hard'],
                is_active: lang.is_active === 1,
                has_practice: lang.has_practice === 1,
                has_notes: lang.has_notes === 1
            });
        } else {
            setModalMode('add');
            setCurrentLang(null);
            setFormData({
                name: '',
                slug: '',
                description: '',
                difficulty_levels: ['Easy', 'Medium', 'Hard'],
                is_active: false,
                has_practice: true, // Default to true
                has_notes: true     // Default to true
            });
        }
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (modalMode === 'add') {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/content/languages`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/content/languages/${currentLang.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchLanguages();
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/content/languages/${id}/status`,
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchLanguages();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="cm-dashboard-container">
            {/* Header */}
            <header className="cm-header">
                <div className="cm-header-left">
                    <button onClick={() => navigate('/content-dashboard')} className="cm-back-btn">
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0F172A', marginLeft: '1rem' }}>Manage Languages</span>
                </div>
            </header>

            <main className="cm-main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Languages ({languages.length})</h2>
                    <button className="cm-card-btn" style={{ width: 'auto' }} onClick={() => handleOpenModal()}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Language
                    </button>
                </div>

                <div className="cm-table-container" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>LANGUAGE</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>SLUG</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>STATUS</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>CREATED</th>
                                <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {languages.map(lang => (
                                <tr key={lang.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{lang.name}</td>
                                    <td style={{ padding: '1rem', color: '#64748B', fontFamily: 'monospace' }}>{lang.slug}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            background: lang.is_active ? '#DCFCE7' : '#F1F5F9',
                                            color: lang.is_active ? '#16A34A' : '#64748B'
                                        }}>
                                            {lang.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {lang.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.9rem' }}>
                                        {new Date(lang.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => navigate(`/content-dashboard/languages/${lang.id}/topics`)}
                                                className="cm-action-btn primary"
                                                title="View Topics"
                                            >
                                                <List size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(lang.id, lang.is_active)}
                                                className={`cm-action-btn ${lang.is_active ? 'danger' : 'success'}`}
                                                title={lang.is_active ? "Disable" : "Enable"}
                                            >
                                                {lang.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(lang)}
                                                className="cm-action-btn"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {languages.length === 0 && !loading && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No languages found.</div>
                    )}
                </div>
            </main>

            {/* Language Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalMode === 'add' ? 'Add New Language' : 'Edit Language'}>
                <form onSubmit={handleFormSubmit} style={{ padding: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Language Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={e => {
                                const name = e.target.value;
                                setFormData({ ...formData, name, slug: modalMode === 'add' ? name.toLowerCase().replace(/ /g, '-') : formData.slug });
                            }}
                            required
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Slug (Unique ID)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'monospace' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Description</label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        />
                    </div>

                    {modalMode === 'add' && (
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                                type="checkbox"
                                id="activeCheck"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            <label htmlFor="activeCheck" style={{ fontSize: '0.9rem', color: '#475569' }}>Active immediately?</label>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="practiceCheck"
                                checked={formData.has_practice}
                                onChange={e => setFormData({ ...formData, has_practice: e.target.checked })}
                                style={{ width: '16px', height: '16px' }}
                            />
                            <label htmlFor="practiceCheck" style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>Enable for Practice</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="notesCheck"
                                checked={formData.has_notes}
                                onChange={e => setFormData({ ...formData, has_notes: e.target.checked })}
                                style={{ width: '16px', height: '16px' }}
                            />
                            <label htmlFor="notesCheck" style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>Enable for Notes</label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            {modalMode === 'add' ? 'Create Language' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageLanguages;
