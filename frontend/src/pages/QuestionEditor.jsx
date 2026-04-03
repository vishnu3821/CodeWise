import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Play, Plus, Trash2 } from 'lucide-react';
import './ContentManagerDashboard.css';

const QuestionEditor = () => {
    const { id } = useParams(); // If ID exists, we are editing
    const navigate = useNavigate();
    const isEdit = !!id;

    // Data Loaders
    const [languages, setLanguages] = useState([]);
    const [topics, setTopics] = useState([]);
    const [subtopics, setSubtopics] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        language_id: '',
        topic_id: '',
        subtopic_id: '',
        title: '',
        difficulty: 'Easy',
        description: '', // Problem Statement
        input_format: '',
        output_format: '',
        constraints: '',
        sample_input: '',
        sample_output: '',
        explanation: '',
        time_limit: 2000,
        memory_limit: 128,
        default_code: '',
        solution_code: '',
        is_active: false
    });

    const [testCases, setTestCases] = useState([
        { input: '', expected_output: '', is_hidden: false }
    ]);

    useEffect(() => {
        fetchLanguages();
        if (isEdit) fetchQuestionData();
    }, [id]);

    const fetchLanguages = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/languages`, { headers: { Authorization: `Bearer ${token}` } });
        setLanguages(res.data.filter(l => l.has_practice));
    };

    // Derived Data Fetching
    useEffect(() => {
        if (formData.language_id) {
            const token = localStorage.getItem('token');
            axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/languages/${formData.language_id}/topics`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setTopics(res.data));
        }
    }, [formData.language_id]);

    useEffect(() => {
        if (formData.topic_id) {
            const token = localStorage.getItem('token');
            axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/topics/${formData.topic_id}/subtopics`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setSubtopics(res.data));
        }
    }, [formData.topic_id]);

    const fetchQuestionData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/questions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            const q = res.data;
            setFormData({
                language_id: q.language_id,
                topic_id: q.topic_id,
                subtopic_id: q.subtopic_id,
                title: q.title,
                difficulty: q.difficulty,
                description: q.description,
                input_format: q.input_format,
                output_format: q.output_format,
                constraints: q.constraints,
                sample_input: q.sample_input,
                sample_output: q.sample_output,
                explanation: q.explanation,
                time_limit: q.time_limit || 2000,
                memory_limit: q.memory_limit || 128,
                default_code: q.default_code,
                solution_code: q.solution_code,
                is_active: q.is_active === 1
            });
            setTestCases(q.test_cases.map(tc => ({
                input: tc.input,
                expected_output: tc.expected_output,
                is_hidden: tc.is_hidden === 1
            })));
        } catch (err) {
            console.error('Failed to load question');
        }
    };

    const handleSave = async (status = null) => {
        const token = localStorage.getItem('token');
        const payload = { ...formData, test_cases: testCases };

        // If status passed (e.g. 'pending_review'), add it to payload
        // Note: For simple save (draft), we might not pass status if we want to keep current status, 
        // OR we enforce 'draft' on save if not submitting. 
        // For now, let's say "Save" = 'draft' (or keep existing), "Submit" = 'pending_review'.
        if (status) payload.status = status;

        try {
            if (isEdit) {
                await axios.put(`${process.env.REACT_APP_API_URL || ""}/api/content/questions/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/content/questions`, payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            navigate('/content-dashboard/questions');
        } catch (err) {
            alert('Failed to save question. Check console.');
            console.error(err);
        }
    };

    // Minimal Helpers
    const updateField = (field, val) => setFormData({ ...formData, [field]: val });
    const updateTestCase = (idx, field, val) => {
        const newTC = [...testCases];
        newTC[idx][field] = val;
        setTestCases(newTC);
    };
    const addTestCase = () => setTestCases([...testCases, { input: '', expected_output: '', is_hidden: false }]);
    const removeTestCase = (idx) => setTestCases(testCases.filter((_, i) => i !== idx));

    return (
        <div className="question-editor">
            <header className="cm-header">
                <div className="cm-header-left">
                    <button onClick={() => navigate('/content-dashboard/questions')} className="cm-back-btn">
                        <ArrowLeft size={18} /> Back to Bank
                    </button>
                    <h1>{isEdit ? 'Edit Question' : 'New Question'}</h1>
                </div>
                <div className="cm-header-right">
                    <button onClick={() => handleSave('draft')} className="cm-card-btn" style={{ background: '#94A3B8' }}>
                        Save Draft
                    </button>
                    <button onClick={() => handleSave('pending_review')} className="cm-card-btn">
                        <Save size={18} /> Submit for Review
                    </button>
                </div>
            </header>

            <main className="dashboard-content" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>

                {/* Section 1: Classification */}
                <div className="cm-card" style={{ width: '100%' }}>
                    <h3>Basic Info</h3>
                    <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Language</label>
                            <select className="form-control" value={formData.language_id} onChange={e => updateField('language_id', e.target.value)}>
                                <option value="">Select...</option>
                                {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Topic</label>
                            <select className="form-control" value={formData.topic_id} onChange={e => updateField('topic_id', e.target.value)}>
                                <option value="">Select...</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Subtopic</label>
                            <select className="form-control" value={formData.subtopic_id} onChange={e => updateField('subtopic_id', e.target.value)}>
                                <option value="">Select...</option>
                                {subtopics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Details */}
                <div className="cm-card" style={{ width: '100%', marginTop: '2rem' }}>
                    <h3>Problem Definition</h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" className="form-control" value={formData.title} onChange={e => updateField('title', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Difficulty</label>
                        <select className="form-control" value={formData.difficulty} onChange={e => updateField('difficulty', e.target.value)}>
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Problem Statement (Description)</label>
                        <textarea rows="5" className="form-control" value={formData.description} onChange={e => updateField('description', e.target.value)} />
                    </div>
                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Input Format</label>
                            <textarea rows="3" className="form-control" value={formData.input_format} onChange={e => updateField('input_format', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Output Format</label>
                            <textarea rows="3" className="form-control" value={formData.output_format} onChange={e => updateField('output_format', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Constraints</label>
                        <textarea rows="3" className="form-control code-font" style={{ fontFamily: 'monospace' }} placeholder="e.g. 1 <= N <= 10^5" value={formData.constraints} onChange={e => updateField('constraints', e.target.value)} />
                    </div>
                </div>

                {/* Section 3: Examples */}
                <div className="cm-card" style={{ width: '100%', marginTop: '2rem' }}>
                    <h3>Examples (Displayed to Student)</h3>
                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Sample Input</label>
                            <textarea rows="3" className="form-control" value={formData.sample_input} onChange={e => updateField('sample_input', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Sample Output</label>
                            <textarea rows="3" className="form-control" value={formData.sample_output} onChange={e => updateField('sample_output', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Explanation</label>
                        <textarea rows="2" className="form-control" value={formData.explanation} onChange={e => updateField('explanation', e.target.value)} />
                    </div>
                </div>

                {/* Section 4: Code */}
                <div className="cm-card" style={{ width: '100%', marginTop: '2rem' }}>
                    <h3>Code</h3>
                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Default/Starter Code</label>
                            <textarea rows="6" className="form-control code-font" style={{ fontFamily: 'monospace' }} value={formData.default_code} onChange={e => updateField('default_code', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Reference Solution</label>
                            <textarea rows="6" className="form-control code-font" style={{ fontFamily: 'monospace' }} value={formData.solution_code} onChange={e => updateField('solution_code', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Time Limit (ms)</label>
                            <input type="number" className="form-control" value={formData.time_limit} onChange={e => updateField('time_limit', e.target.value === '' ? '' : parseInt(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label>Memory Limit (MB)</label>
                            <input type="number" className="form-control" value={formData.memory_limit} onChange={e => updateField('memory_limit', e.target.value === '' ? '' : parseInt(e.target.value))} />
                        </div>
                    </div>
                </div>

                {/* Section 5: Test Cases */}
                <div className="cm-card" style={{ width: '100%', marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Test Cases (Execution)</h3>
                        <button type="button" onClick={addTestCase} className="cm-action-btn primary" style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>
                            <Plus size={16} /> Add Test Case
                        </button>
                    </div>

                    {testCases.map((tc, idx) => (
                        <div key={idx} style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748B' }}>CASE #{idx + 1}</span>
                                <button onClick={() => removeTestCase(idx)} className="cm-action-btn danger"><Trash2 size={16} /></button>
                            </div>
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <textarea placeholder="Input" rows="2" className="form-control code-font" style={{ fontFamily: 'monospace' }} value={tc.input} onChange={e => updateTestCase(idx, 'input', e.target.value)} />
                                <textarea placeholder="Expected Output" rows="2" className="form-control code-font" style={{ fontFamily: 'monospace' }} value={tc.expected_output} onChange={e => updateTestCase(idx, 'expected_output', e.target.value)} />
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" checked={tc.is_hidden} onChange={e => updateTestCase(idx, 'is_hidden', e.target.checked)} />
                                    Hidden Test Case (Not shown to student)
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cm-card" style={{ width: '100%', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input type="checkbox" id="activeQ" checked={formData.is_active} onChange={e => updateField('is_active', e.target.checked)} style={{ width: '1.2rem', height: '1.2rem' }} />
                    <label htmlFor="activeQ" style={{ fontWeight: 500 }}>Activate Question immediately</label>
                </div>

            </main>
        </div>
    );
};

export default QuestionEditor;
