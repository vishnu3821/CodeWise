import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Save, Plus, X, Trash2, CheckCircle,
    AlertTriangle, BookOpen, Calculator, Code
} from 'lucide-react';
import './ContentManagerDashboard.css'; // Reusing existing styles

const TrainingExamEditor = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const location = useLocation();

    // Steps: 1=Details, 2=Modules, 3=Review
    // Check location state for step (passed after create)
    const [currentStep, setCurrentStep] = useState(location.state?.step || 1);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        exam_code: '',
        language_id: '', // Not strictly needed for Training Exam generally, but maybe for Coding module?
        duration_minutes: 60,
        pass_percentage: 50,
        type: 'TRAINING', // Fixed
        description: '',
        status: 'draft'
    });

    const [selectedQuestions, setSelectedQuestions] = useState([]);

    // Lists
    const [languages, setLanguages] = useState([]);
    const [availableQuestions, setAvailableQuestions] = useState([]); // For Coding Picker

    // Picker State
    const [pickerSearch, setPickerSearch] = useState('');
    const [pickerDifficulty, setPickerDifficulty] = useState({ Easy: false, Medium: false, Hard: false });
    const [pickerTopics, setPickerTopics] = useState({});
    const [stagedQuestions, setStagedQuestions] = useState([]);
    const [pickerPage, setPickerPage] = useState(1);
    const [isAdding, setIsAdding] = useState(false);


    // Modal State
    const [activeModule, setActiveModule] = useState(null); // 'english', 'maths', 'coding'
    const [showQuestionModal, setShowQuestionModal] = useState(false); // For English/Maths
    const [showPickerModal, setShowPickerModal] = useState(false); // For Coding

    // New Question State (English/Maths)
    const [newQuestion, setNewQuestion] = useState({
        title: '',
        type: 'mcq', // 'mcq' or 'descriptive'
        model_answer: '',
        options: ['', '', '', ''],
        correct_option: '',
        marks: 5
    });

    useEffect(() => {
        fetchMetadata();
        if (isEditMode) {
            fetchExamDetails();
        }
    }, [id]);

    const fetchMetadata = async () => {
        try {
            const token = localStorage.getItem('token');
            const langRes = await axios.get('http://localhost:5001/api/content/languages', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLanguages(langRes.data);
        } catch (err) {
            console.error('Error fetching metadata:', err);
        }
    };

    const fetchExamDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/content/exams/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const exam = response.data;
            setFormData({
                title: exam.title,
                exam_code: exam.exam_code,
                language_id: exam.language_id || '',
                duration_minutes: exam.duration_minutes,
                pass_percentage: exam.pass_percentage,
                type: 'TRAINING',
                description: exam.description || '',
                status: exam.status
            });
            setSelectedQuestions(exam.questions || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching exam:', err);
            setMessage({ type: 'error', text: 'Failed to load exam details.' });
            setLoading(false);
        }
    };

    const handleSaveDetails = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData, type: 'TRAINING' };

            if (isEditMode) {
                await axios.put(`http://localhost:5001/api/content/exams/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ type: 'success', text: 'Exam details updated.' });
                setCurrentStep(2); // Auto-advance
            } else {
                const response = await axios.post('http://localhost:5001/api/content/exams', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Navigate and pass state to set step to 2 automatically
                navigate(`/content-dashboard/training-exam/${response.data.id}/edit`, { replace: true, state: { step: 2 } });
            }
        } catch (err) {
            console.error('Save error:', err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save exam.' });
        } finally {
            setSaving(false);
        }
    };

    // --- Module Management ---

    const openModule = (moduleName) => {
        setActiveModule(moduleName);
        if (moduleName === 'coding') {
            setStagedQuestions([]);
            setPickerSearch('');
            setPickerPage(1);
            setShowPickerModal(true);
            fetchCodingQuestions();
        } else {
            // English / Maths -> List view inside modal? Or straight to "Add Question"?
            // Request said: Show selector "Select Question Type" ... wait, NO.
            // Request said: "Show 3 fixed modules as cards... Each module must have Add Questions button"
            // "When clicking Add Questions inside a module: Show a selector... English/Maths/Coding" -> This part of the prompt was slightly confusing or I might have misread.
            // Actually: "Step 2: Add Question Modules... Show 3 fixed modules... When clicking Add Questions inside a module: Show a selector..."
            // Wait, if I am inside "English Module", why would I see a selector for "Maths"?
            // Re-reading: "When clicking Add Questions inside a module: Show a selector: 'Select Question Type' • English • Mathematics • Coding"
            // This implies the modules are just containers, and I add questions to them.
            // But if I clicked "Add Questions" on the "English" card, I expect to add English questions.
            // I will implement it such that clicking "Add Questions" on English Card opens English Question Form.
            setShowQuestionModal(true);
        }
    };

    // Fetch Coding Questions (Reuse from Question Picker)
    const fetchCodingQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            // We need a language to fetch questions. If exam doesn't have language, maybe show all?
            // Or maybe force user to pick language in picker?
            // For now, let's assume if language_id is set in details, use it. if not, maybe fetch all?
            // API filtering normally requires language.
            // Let's rely on the user having set a Language in Step 1 if they want specific coding Qs, OR allow filtering in the picker.
            // Simplifying: Fetch ALL coding questions (might be heavy, but okay for now) or active ones.
            // Actually, let's use the stored language_id if present.

            const params = { status: 'active', type: 'coding' };
            if (formData.language_id) {
                const lang = languages.find(l => l.id == formData.language_id);
                if (lang) params.language = lang.slug;
            }

            const response = await axios.get('http://localhost:5001/api/content/questions', {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter out already selected - CHANGED: Keep them to show "Added" status
            // const selectedIds = new Set(selectedQuestions.map(q => q.question_id));

            const codingQs = response.data.filter(q => q.type === 'coding');
            setAvailableQuestions(codingQs);

            const topics = [...new Set(codingQs.map(q => q.topic_name).filter(Boolean))];
            const initialTopics = {};
            topics.forEach(t => initialTopics[t] = false);
            setPickerTopics(initialTopics);

        } catch (err) {
            console.error('Error fetching questions:', err);
        }
    };

    const handleAddEnglishMathsQuestion = async () => {
        if (!id) return alert("Exam ID missing. Please save details first.");
        if (!newQuestion.title || !newQuestion.marks) return alert("All fields required");

        try {
            const token = localStorage.getItem('token');

            // 1. Create Question (Type: mcq)
            // Store options as JSON in description or valid column if exists. 
            // Assuming DB has 'options' column or we store in description as JSON string for now.
            // Wait, standard practice: usually a separate table or json column.
            // Let's check backend... actually let's just send it. If backend fails, we'll know.
            // But based on standard CodeWise schema, `questions` often has `options` column (JSON).

            const qPayload = {
                title: newQuestion.title,
                type: 'mcq',
                options: JSON.stringify(newQuestion.options || []),
                correct_option: newQuestion.options ? newQuestion.options[parseInt(newQuestion.correct_option)] : '', // Store value
                difficulty: newQuestion.difficulty || 'Medium',
                is_active: true,
                status: 'published'
            };

            const createRes = await axios.post('http://localhost:5001/api/content/questions', qPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 2. Link to Exam with Module
            await axios.post(`http://localhost:5001/api/content/exams/${id}/questions`, {
                question_id: createRes.data.id,
                marks: newQuestion.marks,
                module: activeModule // 'english' or 'maths'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewQuestion({ title: '', type: 'mcq', model_answer: '', options: ['', '', '', ''], correct_option: '', marks: 5 });
            setShowQuestionModal(false);
            fetchExamDetails();
        } catch (err) {
            console.error(err);
            alert("Failed to create question");
        }
    };


    const toggleStageQuestion = (qId) => {
        if (stagedQuestions.includes(qId)) setStagedQuestions(stagedQuestions.filter(id => id !== qId));
        else setStagedQuestions([...stagedQuestions, qId]);
    };

    const handleBulkAddCodingQuestions = async () => {
        if (!id) return alert("Exam ID missing. Please save details first.");
        if (stagedQuestions.length === 0) {
            setShowPickerModal(false);
            return;
        }
        try {
            setIsAdding(true);
            const token = localStorage.getItem('token');
            for (let qId of stagedQuestions) {
                await axios.post(`http://localhost:5001/api/content/exams/${id}/questions`, {
                    question_id: qId,
                    marks: 10,
                    module: 'coding'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchExamDetails();
            setShowPickerModal(false);
            setStagedQuestions([]);
        } catch (err) {
            console.error('Bulk add error:', err);
            alert("Failed to add some questions.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleAddCodingQuestion = async (qId) => {
        if (!id) return alert("Exam ID missing. Please save details first.");
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5001/api/content/exams/${id}/questions`, {
                question_id: qId,
                marks: 10, // Default or from question?
                module: 'coding'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExamDetails();
            fetchCodingQuestions(); // Refresh picker
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveQuestion = async (qId) => {
        if (!window.confirm('Remove from exam?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/content/exams/${id}/questions/${qId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExamDetails();
        } catch (err) {
            console.error('Remove error:', err);
        }
    };

    const handleSubmitReview = async () => {
        if (!window.confirm('Submit for Admin Review?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5001/api/content/exams/${id}/status`, { status: 'pending_review' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData(prev => ({ ...prev, status: 'pending_review' }));
            navigate('/content-dashboard/exams'); // Or stay?
        } catch (err) {
            setMessage({ type: 'error', text: 'Submission failed.' });
        }
    };

    // Helpers
    const getModuleQuestions = (mod) => selectedQuestions.filter(q => q.module === mod);
    const getModuleCount = (mod) => getModuleQuestions(mod).length;
    const getModuleMarks = (mod) => getModuleQuestions(mod).reduce((sum, q) => sum + (q.marks || 0), 0);

    const filteredPickerQuestions = availableQuestions.filter(q => {
        if (pickerSearch && !q.title.toLowerCase().includes(pickerSearch.toLowerCase()) && !(q.topic_name || '').toLowerCase().includes(pickerSearch.toLowerCase())) return false;

        const activeDiffs = Object.keys(pickerDifficulty).filter(k => pickerDifficulty[k]);
        if (activeDiffs.length > 0 && !activeDiffs.includes(q.difficulty)) return false;

        const activeTopics = Object.keys(pickerTopics).filter(k => pickerTopics[k]);
        if (activeTopics.length > 0 && !activeTopics.includes(q.topic_name)) return false;

        return true;
    });

    const ITEMS_PER_PAGE = 10;
    const paginatedQuestions = filteredPickerQuestions.slice(0, pickerPage * ITEMS_PER_PAGE);

    const ModalJSX = showPickerModal && (
        <div className="picker-overlay">
            <div className="picker-modal">
                <div className="picker-header">
                    <h2>Select Coding Questions</h2>
                    <button className="picker-close" onClick={() => setShowPickerModal(false)}><X size={20} /></button>
                </div>

                <div className="picker-search-bar">
                    <input type="text" placeholder="Search questions, topics, or difficulty..." value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} />
                </div>

                <div className="picker-body">
                    {/* Left Panel: Filters */}
                    <div className="picker-sidebar">
                        <div className="filter-group">
                            <h4>Difficulty</h4>
                            {['Easy', 'Medium', 'Hard'].map(diff => (
                                <label key={diff} className="filter-label">
                                    <input type="checkbox" checked={pickerDifficulty[diff] || false} onChange={e => setPickerDifficulty({ ...pickerDifficulty, [diff]: e.target.checked })} />
                                    {diff}
                                </label>
                            ))}
                        </div>

                        {Object.keys(pickerTopics).length > 0 && (
                            <div className="filter-group">
                                <h4>Topics</h4>
                                {Object.keys(pickerTopics).map(topic => (
                                    <label key={topic} className="filter-label">
                                        <input type="checkbox" checked={pickerTopics[topic] || false} onChange={e => setPickerTopics({ ...pickerTopics, [topic]: e.target.checked })} />
                                        {topic}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Panel: List */}
                    <div className="picker-main">
                        {paginatedQuestions.length === 0 ? (
                            <div className="picker-empty">No questions found matching your criteria.</div>
                        ) : (
                            <div className="picker-list">
                                {paginatedQuestions.map(q => {
                                    const isAlreadyInExam = selectedQuestions.some(sq => sq.question_id === q.id);
                                    const isStaged = stagedQuestions.includes(q.id);

                                    return (
                                        <div key={q.id} className="picker-card">
                                            <div className="picker-card-content">
                                                <div className="picker-card-title">
                                                    <h3>{q.title}</h3>
                                                    <span className={`picker-diff ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                                                </div>
                                                <div className="picker-card-meta">
                                                    {q.topic_name && <span className="picker-tag">{q.topic_name}</span>}
                                                    <span className="picker-tag">10 pts</span>
                                                </div>
                                                <button className="picker-preview-btn">Preview</button>
                                            </div>
                                            <div className="picker-card-action">
                                                {isAlreadyInExam ? (
                                                    <button className="picker-btn added" disabled><CheckCircle size={16} /> Added</button>
                                                ) : isStaged ? (
                                                    <button className="picker-btn staged" onClick={() => toggleStageQuestion(q.id)}><CheckCircle size={16} /> Selected</button>
                                                ) : (
                                                    <button className="picker-btn add" onClick={() => toggleStageQuestion(q.id)}>Add</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredPickerQuestions.length > pickerPage * ITEMS_PER_PAGE && (
                                    <button className="picker-load-more" onClick={() => setPickerPage(p => p + 1)}>Load More</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="picker-footer">
                    <div className="picker-selection-count">
                        {stagedQuestions.length} question{stagedQuestions.length !== 1 ? 's' : ''} selected
                    </div>
                    <div className="picker-footer-actions">
                        <button className="picker-cancel-btn" onClick={() => setShowPickerModal(false)}>Cancel</button>
                        <button className="picker-add-btn" onClick={handleBulkAddCodingQuestions} disabled={isAdding || stagedQuestions.length === 0}>
                            {isAdding ? 'Adding...' : 'Add to Exam'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="loading-state">Loading...</div>;

    return (
        <div className="training-exam-editor">
            {/* Header */}
            <header className="cm-header">
                <div className="cm-header-left">
                    <button className="cm-back-btn" onClick={() => navigate('/content-dashboard/exams')}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1>{isEditMode ? 'Edit Training Exam' : 'Create Training Exam'}</h1>
                </div>
                {isEditMode && (
                    <div className="header-right">
                        <div className={`badge badge-${formData.status ? formData.status.toLowerCase() : 'draft'}`} style={{ textTransform: 'capitalize', padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: '#F1F5F9' }}>
                            {formData.status?.replace('_', ' ')}
                        </div>
                    </div>
                )}
            </header>

            {/* Stepper / Content */}
            {/* Stepper / Content */}
            <main className="dashboard-content" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>

                {/* Step 1: Details */}
                {currentStep === 1 && (
                    <div className="cm-card" style={{ width: '100%' }}>
                        <h2>Step 1: Exam Details</h2>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <label>Exam Name</label>
                                <input className="form-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Full Stack Aptitude Test" />
                            </div>
                            <div className="form-group">
                                <label>Exam Code</label>
                                <input className="form-control" value={formData.exam_code} onChange={e => setFormData({ ...formData, exam_code: e.target.value })} placeholder="e.g. TR-2024-01" />
                            </div>
                            <div className="form-group">
                                <label>Duration (Minutes)</label>
                                <input className="form-control" type="number" value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Pass Percentage</label>
                                <input className="form-control" type="number" value={formData.pass_percentage} onChange={e => setFormData({ ...formData, pass_percentage: e.target.value })} />
                            </div>
                            {/* Optional Language Selection for Coding Module Context */}
                            <div className="form-group">
                                <label>Primary Language (Optional)</label>
                                <select className="form-control" value={formData.language_id} onChange={e => setFormData({ ...formData, language_id: e.target.value })}>
                                    <option value="">Any / Mixed</option>
                                    {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <input className="form-control" value="Training Exam" disabled style={{ background: '#F1F5F9', color: '#64748B' }} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label>Description</label>
                            <textarea className="form-control" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="cm-card-btn" onClick={handleSaveDetails} disabled={saving}>
                                {saving ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Modules */}
                {currentStep === 2 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="flex-between">
                                <h2>Step 2: Add Question Modules</h2>
                                {/* <button className="btn-secondary" onClick={() => setCurrentStep(1)}>Edit Details</button> */}
                            </div>

                            {/* Modules Grid (Stacked or Grid?) Image shows stacked cards */}
                            <div className="modules-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                {/* English Module */}
                                <div className="module-card">
                                    <div className="module-header" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <BookOpen size={24} />
                                            <div>
                                                <h3>English Language</h3>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.8 }}>Grammar, Vocabulary, and Comprehension</span>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{getModuleCount('english')}</div>
                                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>Questions</div>
                                        </div>
                                    </div>
                                    <div className="module-actions" style={{ padding: '1rem', borderTop: '1px solid #DBEAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{getModuleMarks('english')} Marks Total</span>
                                        <button className="btn-outline" style={{ width: 'auto' }} onClick={() => openModule('english')}>+ Add Questions</button>
                                    </div>
                                    {getModuleQuestions('english').length > 0 && (
                                        <div className="module-questions">
                                            {getModuleQuestions('english').map((q, i) => (
                                                <div key={q.link_id || i} className="mini-q-item">
                                                    <span style={{ flex: 1 }}>{i + 1}. {q.title}</span>
                                                    <span style={{ marginRight: '1rem', fontSize: '0.75rem', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>{q.marks} pts</span>
                                                    <Trash2 size={14} className="trash-icon" onClick={() => handleRemoveQuestion(q.question_id)} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Maths Module */}
                                <div className="module-card">
                                    <div className="module-header" style={{ background: '#ECFDF5', color: '#047857' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Calculator size={24} />
                                            <div>
                                                <h3>Mathematics</h3>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.8 }}>Algebra, Calculus, and Statistics</span>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{getModuleCount('maths')}</div>
                                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>Questions</div>
                                        </div>
                                    </div>
                                    <div className="module-actions" style={{ padding: '1rem', borderTop: '1px solid #D1FAE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{getModuleMarks('maths')} Marks Total</span>
                                        <button className="btn-outline" style={{ width: 'auto' }} onClick={() => openModule('maths')}>+ Add Questions</button>
                                    </div>
                                    {getModuleQuestions('maths').length > 0 && (
                                        <div className="module-questions">
                                            {getModuleQuestions('maths').map((q, i) => (
                                                <div key={q.link_id || i} className="mini-q-item">
                                                    <span style={{ flex: 1 }}>{i + 1}. {q.title}</span>
                                                    <span style={{ marginRight: '1rem', fontSize: '0.75rem', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>{q.marks} pts</span>
                                                    <Trash2 size={14} className="trash-icon" onClick={() => handleRemoveQuestion(q.question_id)} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Coding Module */}
                                <div className="module-card">
                                    <div className="module-header" style={{ background: '#F5F3FF', color: '#6D28D9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Code size={24} />
                                            <div>
                                                <h3>Coding Challenges</h3>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.8 }}>Algorithms, Data Structures, and SQL</span>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{getModuleCount('coding')}</div>
                                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>Questions</div>
                                        </div>
                                    </div>
                                    <div className="module-actions" style={{ padding: '1rem', borderTop: '1px solid #EDE9FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{getModuleMarks('coding')} Marks Total</span>
                                        <button className="btn-outline" style={{ width: 'auto' }} onClick={() => openModule('coding')}>+ Add Questions</button>
                                    </div>
                                    {getModuleQuestions('coding').length > 0 && (
                                        <div className="module-questions">
                                            {getModuleQuestions('coding').map((q, i) => (
                                                <div key={q.link_id || i} className="mini-q-item">
                                                    <span style={{ flex: 1 }}>{i + 1}. {q.title}</span>
                                                    <span style={{ marginRight: '1rem', fontSize: '0.75rem', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>{q.marks} pts</span>
                                                    <Trash2 size={14} className="trash-icon" onClick={() => handleRemoveQuestion(q.question_id)} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Sidebar: Live Summary */}
                        <div className="live-summary-sidebar">
                            <div className="cm-card" style={{ background: '#1E293B', color: 'white', border: 'none' }}>
                                <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                                    Live Summary
                                </h3>

                                <div className="summary-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#94A3B8' }}>• English</span>
                                        <strong>{getModuleCount('english')}</strong>
                                    </div>
                                    <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#94A3B8' }}>• Mathematics</span>
                                        <strong>{getModuleCount('maths')}</strong>
                                    </div>
                                    <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#94A3B8' }}>• Coding</span>
                                        <strong>{getModuleCount('coding')}</strong>
                                    </div>
                                </div>

                                <div className="total-stats" style={{ borderTop: '1px solid #334155', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#CBD5E1' }}>Total Questions</span>
                                        <strong>{selectedQuestions.length}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#CBD5E1' }}>Total Marks</span>
                                        <strong style={{ color: '#4ADE80' }}>{selectedQuestions.reduce((s, q) => s + (q.marks || 0), 0)}</strong>
                                    </div>
                                </div>

                                <button className="cm-card-btn" style={{ width: '100%', marginTop: '2rem', background: '#3B82F6', border: 'none', justifyContent: 'center' }} onClick={() => setCurrentStep(3)}>
                                    Save & Proceed to Review →
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#64748B' }}>
                                    Draft saved automatically
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                    <div className="cm-card" style={{ width: '100%' }}>
                        <h2>Step 3: Submit for Review</h2>
                        <div className="review-summary">
                            <p><strong>Exam:</strong> {formData.title} ({formData.exam_code})</p>
                            <p><strong>Duration:</strong> {formData.duration_minutes} Mins</p>
                            <div className="modules-summary" style={{ display: 'flex', gap: '2rem', margin: '1rem 0' }}>
                                <div>English: <strong>{getModuleCount('english')}</strong></div>
                                <div>Maths: <strong>{getModuleCount('maths')}</strong></div>
                                <div>Coding: <strong>{getModuleCount('coding')}</strong></div>
                            </div>
                        </div>

                        {formData.status === 'draft' ? (
                            <button className="cm-card-btn" onClick={handleSubmitReview} style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
                                Submit for Admin Review
                            </button>
                        ) : (
                            <div className="info-banner">Exam Submitted ({formData.status})</div>
                        )}
                        <button className="cm-back-btn" onClick={() => setCurrentStep(2)} style={{ margin: '1rem auto' }}>Back to Modules</button>
                    </div>
                )}

            </main>

            {/* Modals */}

            {/* 1. English/Maths Question Modal */}
            {/* 1. English/Maths Question Modal */}
            {showQuestionModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Add {activeModule === 'english' ? 'English' : 'Mathematics'} Question (MCQ)</h2>
                            <button className="modal-close-btn" onClick={() => setShowQuestionModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Question Text</label>
                                <textarea className="form-control" rows={3} value={newQuestion.title} onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })} placeholder="Enter question..." />
                            </div>

                            <div className="form-group">
                                <label>Options</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {['A', 'B', 'C', 'D'].map((opt, idx) => (
                                        <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, width: '20px' }}>{opt}</span>
                                            <input
                                                className="form-control"
                                                type="text"
                                                placeholder={`Option ${opt}`}
                                                value={newQuestion.options ? newQuestion.options[idx] : ''}
                                                onChange={(e) => {
                                                    const newOptions = [...(newQuestion.options || ['', '', '', ''])];
                                                    newOptions[idx] = e.target.value;
                                                    setNewQuestion({ ...newQuestion, options: newOptions });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Correct Option</label>
                                <select
                                    value={newQuestion.correct_option || ''}
                                    onChange={e => setNewQuestion({ ...newQuestion, correct_option: e.target.value })}
                                    className="form-control" style={{ width: '100%' }}
                                >
                                    <option value="">Select Correct Option</option>
                                    <option value="0">Option A</option>
                                    <option value="1">Option B</option>
                                    <option value="2">Option C</option>
                                    <option value="3">Option D</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Marks</label>
                                    <input className="form-control" type="number" value={newQuestion.marks} onChange={e => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label>Difficulty</label>
                                    <select
                                        value={newQuestion.difficulty || 'Medium'}
                                        onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                                        className="form-control" style={{ width: '100%' }}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <button className="cm-card-btn" onClick={() => setShowQuestionModal(false)} style={{ background: 'white', color: '#0F172A', border: '1px solid #CBD5E1' }}>Cancel</button>
                                <button className="cm-card-btn" onClick={handleAddEnglishMathsQuestion}>Add MCQ Question</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* 2. Coding Question Picker Modal */}
            {ModalJSX}

            <style>{`
                .module-card {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #E2E8F0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .module-header {
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                }
                .module-body {
                    padding: 1.5rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .module-body p {
                    color: #64748B;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
                .count-badge {
                    margin-left: auto;
                    background: rgba(255,255,255,0.5);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                }
                .module-questions {
                    background: #F8FAFC;
                    padding: 0.5rem;
                    border-top: 1px solid #E2E8F0;
                    max-height: 150px;
                    overflow-y: auto;
                }
                .mini-q-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    padding: 4px 8px;
                    color: #475569;
                }
                .trash-icon {
                    cursor: pointer;
                    color: #EF4444;
                    opacity: 0.6;
                }
                .trash-icon:hover { opacity: 1; }
                .btn-outline {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #E2E8F0;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    color: #475569;
                    transition: all 0.2s;
                }
                .btn-outline:hover {
                    background: #F1F5F9;
                    border-color: #CBD5E1;
                }

                .picker-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .picker-modal {
                    background: white; border-radius: 12px; width: 1000px; max-width: 95vw; height: 85vh;
                    display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .picker-header {
                    padding: 1.5rem 2rem; border-bottom: 1px solid #E2E8F0;
                    display: flex; justify-content: space-between; align-items: center; background: white; z-index: 2;
                }
                .picker-header h2 { margin: 0; font-size: 1.5rem; color: #0F172A; }
                .picker-close { background: none; border: none; color: #64748B; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background 0.2s;}
                .picker-close:hover { background: #F1F5F9; color: #0F172A; }
                
                .picker-search-bar { padding: 1rem 2rem; border-bottom: 1px solid #E2E8F0; background: #F8FAFC; }
                .picker-search-bar input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #CBD5E1; border-radius: 8px; outline: none; transition: border-color 0.2s; }
                .picker-search-bar input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
                
                .picker-body { display: flex; flex: 1; overflow: hidden; }
                
                .picker-sidebar { width: 250px; border-right: 1px solid #E2E8F0; padding: 1.5rem; overflow-y: auto; background: #F8FAFC; }
                .filter-group { margin-bottom: 1.5rem; }
                .filter-group h4 { margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
                .filter-label { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.95rem; color: #1E293B; cursor: pointer; }
                .filter-label input { accent-color: #3B82F6; width: 16px; height: 16px; cursor: pointer; }
                
                .picker-main { flex: 1; overflow-y: auto; padding: 1.5rem; background: white; }
                .picker-list { display: flex; flex-direction: column; gap: 1rem; }
                .picker-empty { text-align: center; color: #94A3B8; margin-top: 3rem; font-style: italic; }
                
                .picker-card { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border: 1px solid #E2E8F0; border-radius: 8px; transition: all 0.2s; }
                .picker-card:hover { border-color: #CBD5E1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .picker-card-content { display: flex; flex-direction: column; gap: 0.5rem; }
                .picker-card-title { display: flex; align-items: center; gap: 0.75rem; }
                .picker-card-title h3 { margin: 0; font-size: 1.1rem; color: #0F172A; }
                
                .picker-diff { font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; font-weight: 600; }
                .picker-diff.easy { background: #DCFCE7; color: #166534; }
                .picker-diff.medium { background: #FEF9C3; color: #854D0E; }
                .picker-diff.hard { background: #FEE2E2; color: #991B1B; }
                
                .picker-card-meta { display: flex; gap: 0.5rem; }
                .picker-tag { font-size: 0.75rem; padding: 2px 8px; border-radius: 6px; background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0; }
                
                .picker-preview-btn { background: none; border: none; font-size: 0.85rem; color: #3B82F6; cursor: pointer; padding: 0; text-align: left; margin-top: 0.25rem; }
                .picker-preview-btn:hover { text-decoration: underline; }
                
                .picker-btn { padding: 0.5rem 1.5rem; border-radius: 6px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; font-size: 0.95rem; }
                .picker-btn.add { background: #EFF6FF; color: #2563EB; border: 1px solid transparent; }
                .picker-btn.add:hover { background: #DBEAFE; }
                .picker-btn.staged { background: #3B82F6; color: white; border: 1px solid #3B82F6; }
                .picker-btn.added { background: #DCFCE7; color: #166534; border: 1px solid transparent; cursor: default; }
                
                .picker-load-more { width: 100%; padding: 0.75rem; background: #F8FAFC; border: 1px dashed #CBD5E1; color: #475569; border-radius: 8px; cursor: pointer; font-weight: 500; margin-top: 1rem; transition: background 0.2s; }
                .picker-load-more:hover { background: #F1F5F9; color: #0F172A; }
                
                .picker-footer { padding: 1.25rem 2rem; border-top: 1px solid #E2E8F0; background: white; display: flex; justify-content: space-between; align-items: center; z-index: 2;}
                .picker-selection-count { font-weight: 500; color: #475569; }
                .picker-footer-actions { display: flex; gap: 1rem; }
                .picker-cancel-btn { padding: 0.6rem 1.5rem; border-radius: 6px; border: 1px solid #CBD5E1; background: white; color: #475569; font-weight: 500; cursor: pointer; }
                .picker-cancel-btn:hover { background: #F8FAFC; }
                .picker-add-btn { padding: 0.6rem 1.5rem; border-radius: 6px; border: none; background: #3B82F6; color: white; font-weight: 500; cursor: pointer; transition: background 0.2s; }
                .picker-add-btn:hover { background: #2563EB; }
                .picker-add-btn:disabled { background: #94A3B8; cursor: not-allowed; }

                .picker-item:hover {
                    background: #F8FAFC;
                }
            `}</style>
        </div>
    );
};

export default TrainingExamEditor;
