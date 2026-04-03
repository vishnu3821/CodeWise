import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronUp, X, HelpCircle, Tags, Clock } from 'lucide-react';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';
import { useTransition } from '../context/TransitionContext';
import { toast } from '../utils/toast';
import './ContentManagerDashboard.css';

const PrepQuestionsList = () => {
    const { companyId, moduleId } = useParams();
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useTransition();

    const [company, setCompany] = useState(null);
    const [currentModuleObj, setCurrentModuleObj] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentQuestion, setCurrentQuestion] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [detailedAnswer, setDetailedAnswer] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [tagsList, setTagsList] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [bulletPoints, setBulletPoints] = useState(['']);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId, moduleId]);

    const fetchData = async () => {
        try {
            startLoading();
            const token = localStorage.getItem('token');
            const compRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/placement-prep/companies/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompany(compRes.data);

            const modRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/placement-prep/companies/${companyId}/modules`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const mod = modRes.data.find(m => m.id === parseInt(moduleId));
            setCurrentModuleObj(mod);

            const qRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/placement-prep/companies/${compRes.data.id}/questions?moduleId=${moduleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(qRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load questions.');
        } finally {
            stopLoading();
        }
    };

    const toggleRow = (id) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedRows(newSet);
    };

    // --- Modal Logic ---

    const openAddModal = () => {
        setModalMode('add');
        setCurrentQuestion(null);
        setTitle('');
        setDetailedAnswer('');
        setDifficulty('medium');
        setTagsList([]);
        setTagInput('');
        setBulletPoints(['']);
        setIsModalOpen(true);
    };

    const openEditModal = (q) => {
        setModalMode('edit');
        setCurrentQuestion(q);
        setTitle(q.question_title);
        setDetailedAnswer(q.detailed_answer || '');
        setDifficulty(q.difficulty || 'medium');
        setTagsList(q.tags || []);
        setTagInput('');
        setBulletPoints(q.points && q.points.length > 0 ? q.points : ['']);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Tag Handling
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tagsList.includes(newTag)) {
                setTagsList([...tagsList, newTag]);
            }
            setTagInput('');
        }
    };
    const removeTag = (indexToRemove) => {
        setTagsList(tagsList.filter((_, idx) => idx !== indexToRemove));
    };

    // Bullet Handling
    const updateBullet = (index, value) => {
        const newBullets = [...bulletPoints];
        newBullets[index] = value;
        setBulletPoints(newBullets);
    };
    const addBullet = () => {
        setBulletPoints([...bulletPoints, '']);
    };
    const removeBullet = (indexToRemove) => {
        setBulletPoints(bulletPoints.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Question title is required');
            return;
        }

        try {
            startLoading();
            const token = localStorage.getItem('token');

            const payload = {
                moduleId: moduleId,
                question_title: title.trim(),
                detailed_answer: detailedAnswer.trim(),
                difficulty: difficulty,
                points: bulletPoints.filter(b => b.trim() !== ''),
                tags: tagsList
            };

            if (modalMode === 'add') {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/placement-prep/companies/${company.id}/questions`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Question added successfully');
            } else {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/placement-prep/questions/${currentQuestion.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Question updated successfully');
            }

            closeModal();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save question');
        } finally {
            stopLoading();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;

        try {
            startLoading();
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/placement-prep/questions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Question deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete question');
        } finally {
            stopLoading();
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.question_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getTagsCount = () => {
        const uniqueTags = new Set();
        questions.forEach(q => q.tags?.forEach(t => uniqueTags.add(t)));
        return uniqueTags.size;
    };

    if (!company || !currentModuleObj) return null;

    const typeLabel = currentModuleObj.module_name;

    return (
        <>

            <header className="admin-header">
                <div className="admin-title">
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate(`/content-dashboard/placement-prep/companies/${companyId}`)}>
                        Placement Prep / {company.name} / <span style={{ color: '#0f172a', fontWeight: '500' }}>{typeLabel} Questions</span>
                    </div>
                    <h1>Questions Repository</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <NotificationBell />
                    <span className="badge badge-active" style={{ backgroundColor: '#e2ffe9', color: '#16a34a' }}>CONTENT MANAGER</span>
                </div>
            </header>

            <div style={{ padding: '0 32px 32px 32px', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="cm-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Total Questions</div>
                            <div style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a' }}>{questions.length}</div>
                        </div>
                    </div>
                    <div className="cm-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tags size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Categories (Tags)</div>
                            <div style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a' }}>{getTagsCount()}</div>
                        </div>
                    </div>
                    <div className="cm-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Last Updated</div>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>
                                {questions.length > 0 ? new Date(questions[0].updated_at).toLocaleDateString() : 'Never'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Container */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>Questions Repository</div>
                            <div style={{ position: 'relative', width: '300px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Search questions or tags..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <button onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>
                            <Plus size={16} /> Add Question
                        </button>
                    </div>

                    {/* Infinite Scrolling List Simulation */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filteredQuestions.length > 0 ? filteredQuestions.map((q, index) => (
                            <div key={q.id} style={{ borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                                {/* Row Header */}
                                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: expandedRows.has(q.id) ? '#f8fafc' : '#fff', transition: 'background 0.2s' }}>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff',
                                            color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: '600', fontSize: '13px', flexShrink: 0
                                        }}>
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '8px', lineHeight: '1.4' }}>
                                                {q.question_title}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {q.tags?.map((tag, tIndex) => (
                                                    <span key={tIndex} style={{ padding: '2px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                                <span style={{ padding: '2px 10px', background: '#f1f5f9', color: '#64748b', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
                                                    {q.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '16px' }}>
                                        <button onClick={() => openEditModal(q)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(q.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        <button onClick={() => toggleRow(q.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                            {expandedRows.has(q.id) ? <ChevronUp size={20} color="#3b82f6" /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedRows.has(q.id) && (
                                    <div style={{ padding: '24px 24px 24px 76px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px', marginBottom: '16px' }}>Answer Key / Expected Points:</div>
                                        <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {q.points?.length > 0 ? q.points.map((point, pIndex) => (
                                                <li key={pIndex} style={{ color: '#64748b' }}>
                                                    <span style={{ color: '#334155' }}>{point}</span>
                                                </li>
                                            )) : <li>No bullet points available.</li>}
                                        </ul>
                                        {q.detailed_answer && (
                                            <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', color: '#475569', border: '1px solid #f1f5f9', whiteSpace: 'pre-wrap' }}>
                                                {q.detailed_answer}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No questions found in this module.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Add / Edit Question */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px'
                }}>
                    <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                                    {modalMode === 'add' ? 'Add New Question' : 'Edit Question'}
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>Create a new interview question for the placement repository.</p>
                            </div>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '24px', overflowY: 'auto', flexGrow: 1 }}>
                            <form id="question-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Question Title <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                        placeholder="e.g. Explain the difference between REST and SOAP APIs"
                                        required
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '24px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Topic Tags</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', minHeight: '44px' }}>
                                            {tagsList.map((tag, idx) => (
                                                <span key={idx} style={{ padding: '4px 8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {tag} <button type="button" onClick={() => removeTag(idx)} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                                placeholder="Add a tag and press Enter"
                                                style={{ border: 'none', outline: 'none', background: 'transparent', flexGrow: 1, minWidth: '120px', fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Difficulty Level</label>
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }}
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Detailed Answer</label>
                                    <textarea
                                        value={detailedAnswer}
                                        onChange={(e) => setDetailedAnswer(e.target.value)}
                                        style={{ width: '100%', height: '120px', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                                        placeholder="Write a comprehensive answer for the student..."
                                    />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Key Takeaways / Bullet Points</label>
                                        <button type="button" onClick={addBullet} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2563eb', background: 'none', border: 'none', fontWeight: '500', cursor: 'pointer' }}>
                                            <Plus size={14} /> Add Bullet
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {bulletPoints.map((bullet, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ color: '#cbd5e1', cursor: 'grab' }}>:::</div>
                                                <input
                                                    type="text"
                                                    value={bullet}
                                                    onChange={(e) => updateBullet(idx, e.target.value)}
                                                    style={{ flexGrow: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                                    placeholder="Enter a key point..."
                                                />
                                                <button type="button" onClick={() => removeBullet(idx)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderRadius: '0 0 16px 16px' }}>
                            <button onClick={closeModal} style={{ padding: '12px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button type="submit" form="question-form" style={{ padding: '12px 24px', background: '#2563eb', border: '1px solid #2563eb', borderRadius: '8px', color: '#fff', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Save Question
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PrepQuestionsList;
