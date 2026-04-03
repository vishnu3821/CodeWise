import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, CheckCircle, XCircle, FileText, Eye, Upload, Trash2 } from 'lucide-react';
import './ContentManagerDashboard.css';
import Modal from '../components/Modal';

const ManageNotes = () => {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentNote, setCurrentNote] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        language_id: '',
        description: '',
        is_active: true
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchMetadata();
        fetchNotes();
    }, []);

    const fetchMetadata = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/languages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLanguages(res.data.filter(l => l.has_notes));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/notes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(res.data);
        } catch (err) {
            console.error('Failed to fetch notes', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (note = null) => {
        setFile(null); // Reset file input
        if (note) {
            setModalMode('edit');
            setCurrentNote(note);
            setFormData({
                title: note.title,
                language_id: note.language_id,
                description: note.description || '',
                is_active: note.is_active === 1
            });
        } else {
            setModalMode('add');
            setCurrentNote(null);
            setFormData({
                title: '',
                language_id: '',
                description: '',
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleFormSubmit = async (e, status = 'draft') => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const data = new FormData();
        data.append('title', formData.title);
        data.append('language_id', formData.language_id);
        data.append('description', formData.description);
        data.append('is_active', formData.is_active);
        data.append('status', status); // Pass status ('draft' or 'pending_review')

        if (file) {
            data.append('file', file);
        }

        try {
            if (modalMode === 'add') {
                if (!file) {
                    alert('Please upload a PDF file.');
                    return;
                }
                await axios.post(`${process.env.REACT_APP_API_URL}/api/content/notes`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/content/notes/${currentNote.id}`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            setShowModal(false);
            fetchNotes();
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };



    const toggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/content/notes/${id}/status`,
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchNotes();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRequestDelete = async (id) => {
        if (!window.confirm('Are you sure you want to request DELETION for this note? This will send it to admin for approval.')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/content/notes/${id}/request-delete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Deletion request sent to Admin.');
            fetchNotes();
        } catch (err) {
            console.error(err);
            alert('Failed to request deletion');
        }
    };

    // Inline Language Creation
    const [isAddingLanguage, setIsAddingLanguage] = useState(false);
    const [newLanguageName, setNewLanguageName] = useState('');

    const handleCreateLanguage = async () => {
        if (!newLanguageName.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const slug = newLanguageName.toLowerCase().replace(/\s+/g, '-');

            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/content/languages`,
                { name: newLanguageName, slug, is_active: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh languages
            await fetchMetadata();
            setIsAddingLanguage(false);
            setNewLanguageName('');

            // Auto-select the new language if possible (we might need to find it in the new list)
            // Ideally backend returns the new ID, but fetchMetadata updates state asynchronously.
            // For now, user can select it from dropdown.
            alert('Language added successfully!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create language');
        }
    };

    return (
        <div className="cm-dashboard-container">
            <header className="cm-header">
                <div className="cm-header-left">
                    <button onClick={() => navigate('/content-dashboard')} className="cm-back-btn">
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0F172A', marginLeft: '1rem' }}>Manage Notes</span>
                </div>
            </header>

            <main className="cm-main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Notes Library ({notes.length})</h2>
                    <button className="cm-card-btn" style={{ width: 'auto' }} onClick={() => handleOpenModal()}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> Upload New Note
                    </button>
                </div>

                <div className="cm-table-container" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B' }}>TITLE</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B' }}>LANGUAGE</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B' }}>FILE</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B' }}>STATUS</th>
                                <th style={{ textAlign: 'right', padding: '1rem', color: '#64748B' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.map(note => (
                                <tr key={note.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                                        {note.title}
                                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{note.description}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ background: '#EFF6FF', color: '#3B82F6', padding: '2px 8px', borderRadius: '4px' }}>
                                            {note.language_name}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <a
                                            href={`${process.env.REACT_APP_API_URL}${note.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#64748B' }}
                                        >
                                            <FileText size={16} /> View PDF
                                        </a>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                                            textTransform: 'capitalize',
                                            color: note.status === 'published' ? '#16A34A' : note.status === 'rejected' ? '#DC2626' : note.status === 'pending_review' ? '#D97706' : '#64748B',
                                            background: note.status === 'published' ? '#DCFCE7' : note.status === 'rejected' ? '#FEE2E2' : note.status === 'pending_review' ? '#FEF3C7' : '#F1F5F9'
                                        }}>
                                            {note.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => toggleStatus(note.id, note.is_active)}
                                                className={`cm-action-btn ${note.is_active ? 'danger' : 'success'}`}
                                                title={note.is_active ? "Disable" : "Enable"}
                                            >
                                                {note.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(note)}
                                                className="cm-action-btn"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleRequestDelete(note.id)}
                                                className="cm-action-btn delete"
                                                title="Request Delete"
                                                style={{ marginLeft: '0.25rem' }}
                                                disabled={note.status === 'pending_delete'}
                                            >
                                                <Trash2 size={16} color={note.status === 'pending_delete' ? '#CBD5E1' : '#EF4444'} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {notes.length === 0 && !loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No notes found.</div>}
                </div>
            </main>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalMode === 'add' ? 'Upload Note' : 'Edit Note'}>
                <form onSubmit={handleFormSubmit} style={{ padding: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Language</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {isAddingLanguage ? (
                                <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter new language name"
                                        value={newLanguageName}
                                        onChange={(e) => setNewLanguageName(e.target.value)}
                                        style={{ flex: 1, padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateLanguage}
                                        style={{ padding: '0.6rem', background: '#16A34A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingLanguage(false)}
                                        style={{ padding: '0.6rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        X
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <select
                                        value={formData.language_id}
                                        onChange={e => setFormData({ ...formData, language_id: e.target.value })}
                                        required
                                        style={{ flex: 1, padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                                    >
                                        <option value="">Select Language</option>
                                        {languages.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingLanguage(true)}
                                        title="Add New Language"
                                        style={{ padding: '0.6rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description (Optional)</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            PDF File {modalMode === 'edit' && '(Leave empty to keep current)'}
                        </label>
                        <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('fileInput').click()}>
                            <Upload size={24} color="#64748B" />
                            <p style={{ margin: '0.5rem 0', color: '#64748B' }}>{file ? file.name : 'Click to upload PDF'}</p>
                            <input
                                id="fileInput"
                                type="file"
                                accept="application/pdf"
                                onChange={e => setFile(e.target.files[0])}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            <span>Active (Visible to Students if Published)</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={(e) => handleFormSubmit(e, 'draft')}
                            className="cm-card-btn"
                            style={{ flex: 1, background: '#94A3B8', justifyContent: 'center' }}
                        >
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleFormSubmit(e, 'pending_review')}
                            className="cm-card-btn"
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            Submit for Review
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageNotes;
