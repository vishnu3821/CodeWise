import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Search, Filter } from 'lucide-react';
import './ContentManagerDashboard.css';

const QuestionBank = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [languages, setLanguages] = useState([]);
    const [topics, setTopics] = useState([]);
    const [subtopics, setSubtopics] = useState([]);

    const [filters, setFilters] = useState({
        language_id: '',
        topic_id: '',
        subtopic_id: '',
        status: ''
    });

    useEffect(() => {
        fetchLanguages();
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (filters.language_id) fetchTopics(filters.language_id);
        else { setTopics([]); setSubtopics([]); }
    }, [filters.language_id]);

    useEffect(() => {
        if (filters.topic_id) fetchSubtopics(filters.topic_id);
        else setSubtopics([]);
    }, [filters.topic_id]);

    useEffect(() => {
        fetchQuestions();
    }, [filters]);

    const fetchLanguages = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/languages`, { headers: { Authorization: `Bearer ${token}` } });
        setLanguages(res.data);
    };

    const fetchTopics = async (langId) => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/languages/${langId}/topics`, { headers: { Authorization: `Bearer ${token}` } });
        setTopics(res.data);
    };

    const fetchSubtopics = async (topicId) => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/topics/${topicId}/subtopics`, { headers: { Authorization: `Bearer ${token}` } });
        setSubtopics(res.data);
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.language_id) params.append('language_id', filters.language_id);
            if (filters.topic_id) params.append('topic_id', filters.topic_id);
            if (filters.subtopic_id) params.append('subtopic_id', filters.subtopic_id);
            if (filters.status) params.append('status', filters.status);

            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/questions?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cm-dashboard-container">
            <header className="cm-header">
                <div className="cm-header-left">
                    <button onClick={() => navigate('/content-dashboard')} className="cm-back-btn">
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0F172A', marginLeft: '1rem' }}>Question Bank</span>
                </div>
            </header>

            <main className="cm-main-content">
                {/* Filters */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <select
                            className="form-control"
                            value={filters.language_id}
                            onChange={e => setFilters({ ...filters, language_id: e.target.value, topic_id: '', subtopic_id: '' })}
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        >
                            <option value="">All Languages</option>
                            {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <select
                            className="form-control"
                            value={filters.topic_id}
                            onChange={e => setFilters({ ...filters, topic_id: e.target.value, subtopic_id: '' })}
                            disabled={!filters.language_id}
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        >
                            <option value="">All Topics</option>
                            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <select
                            className="form-control"
                            value={filters.subtopic_id}
                            onChange={e => setFilters({ ...filters, subtopic_id: e.target.value })}
                            disabled={!filters.topic_id}
                            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        >
                            <option value="">All Subtopics</option>
                            {subtopics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button className="cm-card-btn" onClick={() => navigate('/content-dashboard/questions/create')}>
                            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Question
                        </button>
                    </div>
                </div>

                {/* Questions List */}
                <div className="cm-table-container" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B' }}>TITLE</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B' }}>CONTEXT</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B' }}>DIFFICULTY</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748B' }}>STATUS</th>
                                <th style={{ textAlign: 'right', padding: '1rem', color: '#64748B' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map(q => (
                                <tr key={q.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                                        {q.title}
                                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{q.subtopic_name}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                        <span style={{ background: '#EFF6FF', color: '#3B82F6', padding: '2px 8px', borderRadius: '4px' }}>{q.language_name}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                            color: q.difficulty === 'Easy' ? '#16A34A' : q.difficulty === 'Medium' ? '#EA580C' : '#DC2626',
                                            background: q.difficulty === 'Easy' ? '#DCFCE7' : q.difficulty === 'Medium' ? '#FFEDD5' : '#FEE2E2'
                                        }}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                                            color: q.is_active ? '#16A34A' : '#64748B',
                                            background: q.is_active ? '#DCFCE7' : '#F1F5F9'
                                        }}>
                                            {q.is_active ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => navigate(`/content-dashboard/questions/edit/${q.id}`)}
                                            className="cm-action-btn"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {questions.length === 0 && !loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No questions found.</div>}
                </div>
            </main>
        </div>
    );
};

export default QuestionBank;
