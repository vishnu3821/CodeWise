import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, CheckCircle, XCircle, List } from 'lucide-react';
import './ContentManagerDashboard.css';
import Modal from '../components/Modal';

const ManageTopics = () => {
    const { languageId } = useParams();
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentTopic, setCurrentTopic] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        order_index: 0,
        is_active: false
    });

    useEffect(() => {
        fetchTopics();
    }, [languageId]);

    const fetchTopics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5001/api/content/languages/${languageId}/topics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTopics(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (topic = null) => {
        if (topic) {
            setModalMode('edit');
            setCurrentTopic(topic);
            setFormData({
                name: topic.name,
                slug: topic.slug,
                order_index: topic.order_index,
                is_active: topic.is_active === 1
            });
        } else {
            setModalMode('add');
            setCurrentTopic(null);
            setFormData({
                name: '',
                slug: '',
                order_index: topics.length + 1,
                is_active: false
            });
        }
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (modalMode === 'add') {
                await axios.post('http://localhost:5001/api/content/topics', { ...formData, language_id: languageId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`http://localhost:5001/api/content/topics/${currentTopic.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchTopics();
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://localhost:5001/api/content/topics/${id}/status`,
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTopics();
        } catch (err) {
            console.error(err);
        }
    };

    return (

        <div className="manage-topics">
            <header className="cm-header">
                <div className="cm-header-left">
                    <button onClick={() => navigate('/content-dashboard/languages')} className="cm-back-btn">
                        <ArrowLeft size={18} /> Back to Languages
                    </button>
                    <h1>Manage Topics</h1>
                </div>
            </header>

            <main className="dashboard-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Topics for Language ID: {languageId}</h2>
                    <button className="cm-card-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Add Topic
                    </button>
                </div>

                <div className="cm-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>ORDER</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>TOPIC NAME</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>SLUG</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>STATUS</th>
                                <th style={{ textAlign: 'right', padding: '1rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topics.map(topic => (
                                <tr key={topic.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '1rem' }}>{topic.order_index}</td>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{topic.name}</td>
                                    <td style={{ padding: '1rem', color: '#64748B', fontFamily: 'monospace' }}>{topic.slug}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: topic.is_active ? '#DCFCE7' : '#F1F5F9',
                                            color: topic.is_active ? '#16A34A' : '#64748B'
                                        }}>
                                            {topic.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                className="cm-action-btn primary"
                                                onClick={() => navigate(`/content-dashboard/topics/${topic.id}/subtopics`)}
                                                title="View Subtopics"
                                            >
                                                <List size={16} />
                                            </button>
                                            <button
                                                className={`cm-action-btn ${topic.is_active ? 'danger' : 'success'}`}
                                                onClick={() => toggleStatus(topic.id, topic.is_active)}
                                                title={topic.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {topic.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                            <button
                                                className="cm-action-btn"
                                                onClick={() => handleOpenModal(topic)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {topics.length === 0 && !loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No topics found.</div>}
                </div>
            </main>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalMode === 'add' ? 'Add Topic' : 'Edit Topic'}>
                <form onSubmit={handleFormSubmit} style={{ padding: '1rem' }}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={e => {
                                const name = e.target.value;
                                setFormData({ ...formData, name, slug: modalMode === 'add' ? name.toLowerCase().replace(/ /g, '-') : formData.slug });
                            }}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Slug</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            required
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Order Index</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.order_index}
                            onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                            required
                        />
                    </div>

                    {modalMode === 'add' && (
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                style={{ width: '1.2rem', height: '1.2rem' }}
                            />
                            <label htmlFor="isActive" style={{ fontWeight: 500 }}>Active</label>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" className="cm-card-btn" style={{ background: 'white', color: '#0F172A', border: '1px solid #CBD5E1' }} onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="cm-card-btn">
                            {modalMode === 'add' ? 'Create Topic' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageTopics;
