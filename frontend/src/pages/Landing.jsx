import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CodeWiseLogo from '../assets/CodeWise-Logo.png';
import './Landing.css';

/* ── Modal content data ── */
const MODAL_CONTENT = {
    'practice-problems': {
        section: 'Platform',
        items: [{
            icon: 'code', iconCls: '',
            title: 'Practice Problems',
            desc: 'Access structured coding problems designed to help students prepare for placements. Problems are organized by topic and difficulty to improve logical thinking and coding confidence.',
        }],
    },
    'mock-tests': {
        section: 'Platform',
        items: [{
            icon: 'timer', iconCls: 'icon-amber',
            title: 'Mock Tests',
            soon: true,
            desc: 'Timed placement-style assessments will be added soon. These tests will simulate real company exam environments to help students practice under pressure.',
        }],
    },
    'company-sheets': {
        section: 'Platform',
        items: [{
            icon: 'apartment', iconCls: 'icon-purple',
            title: 'Company Sheets',
            desc: 'Prepare company-wise with focused question sets for TCS, Infosys, Wipro, and other recruiters based on placement patterns.',
        }],
    },
    'ide-features': {
        section: 'Platform',
        items: [{
            icon: 'terminal', iconCls: 'icon-green',
            title: 'IDE Features',
            desc: 'Use the built-in coding environment to write, test, and debug your programs with custom test cases and instant output.',
        }],
    },
    'blog': {
        section: 'Resources',
        items: [{
            icon: 'article', iconCls: '',
            title: 'Blog',
            desc: 'Read articles focused on coding preparation, placement strategies, interview tips, and problem-solving techniques designed specifically for students preparing for campus placements.',
        }],
    },
    'interview-experiences': {
        section: 'Resources',
        items: [{
            icon: 'forum', iconCls: 'icon-purple',
            title: 'Interview Experiences',
            desc: 'Explore real interview experiences shared by students. Understand the type of questions asked, difficulty level, and overall interview process of different companies.',
        }],
    },
    'cheat-sheets': {
        section: 'Resources',
        items: [{
            icon: 'bolt', iconCls: 'icon-amber',
            title: 'Cheat Sheets',
            desc: 'Quick revision materials covering Data Structures, Algorithms, core subjects, and aptitude topics. Useful for last-minute preparation before exams or interviews.',
        }],
    },
    'roadmaps': {
        section: 'Resources',
        items: [{
            icon: 'map', iconCls: 'icon-green',
            title: 'Roadmaps',
            desc: 'Structured preparation paths that guide students step-by-step through coding topics, company preparation, and interview readiness.',
        }],
    },
    'about-us': {
        section: 'Company',
        items: [{
            icon: 'info', iconCls: 'icon-cyan',
            title: 'About Us',
            desc: 'CodeWise is a collaborative student project developed to support placement preparation. The platform was built with contributions and feedback from students to create a structured, practical, and accessible coding practice environment. Our goal is to help students prepare effectively for technical interviews and campus placements.',
        }],
    },
    'contact': {
        section: 'Company',
        type: 'contact',
        items: [{
            icon: 'mail', iconCls: '',
            title: 'Contact',
            desc: null,
            primary: 'help.codewise@gmail.com',
            team: [
                { name: 'Vishnu Prabhakar Pedasanaganti', email: '2300033040cseh@gmail.com' },
                { name: 'Akshaya Gonala Tallam', email: '2300033237cseh@gmail.com' },
                { name: 'Indu Harshitha Pattem', email: '2300060003aidshte@gmail.com' },
            ],
        }],
    },
    'privacy': {
        section: 'Company',
        items: [{
            icon: 'shield', iconCls: 'icon-green',
            title: 'Privacy Policy',
            desc: 'CodeWise does not share your personal information with any third party. All user data is securely stored and protected. Sensitive information is encrypted to ensure privacy and security. We only collect necessary information required for platform functionality.',
        }],
    },
    'terms': {
        section: 'Company',
        items: [{
            icon: 'gavel', iconCls: 'icon-rose',
            title: 'Terms of Service',
            desc: 'By using CodeWise, you agree to use the platform for learning and preparation purposes only. Users must not misuse the platform, attempt unauthorized access, or engage in harmful activities. CodeWise reserves the right to update features, policies, and platform rules when required to improve user experience and security.',
        }],
    },
};

/* ── Modal Component ── */
const FooterModal = ({ id, onClose }) => {
    const data = id ? MODAL_CONTENT[id] : null;
    const isOpen = !!data;

    /* Close on Escape key */
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    /* Lock body scroll when open */
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!data) return null;

    const item = data.items[0]; // single-item modals for now

    return (
        <div className={`lp-modal-overlay ${isOpen ? 'lp-modal-open' : ''}`} onClick={onClose}>
            <div className="lp-modal" onClick={e => e.stopPropagation()}>
                <div className="lp-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2 className="lp-modal-title">{item.title}</h2>
                        {item.soon && <span className="lp-modal-tag">Coming Soon</span>}
                    </div>
                    <button className="lp-modal-close" onClick={onClose} aria-label="Close">
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>close</span>
                    </button>
                </div>
                <div className="lp-modal-body">
                    {data.type === 'contact' ? (
                        <div className="lp-modal-item">
                            <div className="lp-modal-item-header">
                                <div className={`lp-modal-item-icon ${item.iconCls}`}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                </div>
                                <h3 className="lp-modal-item-title">Get in Touch</h3>
                            </div>

                            {/* Primary contact */}
                            <div className="lp-modal-contact-card">
                                <p className="lp-modal-contact-label">Primary Contact</p>
                                <div className="lp-modal-contact-row">
                                    <span className="material-symbols-outlined">mail</span>
                                    <div>
                                        <p className="lp-modal-contact-name">Support</p>
                                        <p className="lp-modal-contact-email">
                                            <a href={`mailto:${item.primary}`}>{item.primary}</a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Team members */}
                            <div className="lp-modal-contact-card" style={{ marginTop: '1rem' }}>
                                <p className="lp-modal-contact-label">Team Members</p>
                                {item.team.map(member => (
                                    <div className="lp-modal-contact-row" key={member.email}>
                                        <span className="material-symbols-outlined">person</span>
                                        <div>
                                            <p className="lp-modal-contact-name">{member.name}</p>
                                            <p className="lp-modal-contact-email">
                                                <a href={`mailto:${member.email}`}>{member.email}</a>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="lp-modal-item">
                            <div className="lp-modal-item-header">
                                <div className={`lp-modal-item-icon ${item.iconCls}`}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                </div>
                                <h3 className="lp-modal-item-title">
                                    {item.title}
                                    {item.soon && <span className="lp-modal-soon">Coming Soon</span>}
                                </h3>
                            </div>
                            <p className="lp-modal-item-desc">{item.desc}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── Scroll-reveal wrapper ── */
const Reveal = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => el.classList.add('lp-visible'), delay);
                    obs.unobserve(el);
                }
            },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [delay]);
    return <div ref={ref} className={`lp-reveal ${className}`}>{children}</div>;
};

/* SVG check icon */
const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path fillRule="evenodd" clipRule="evenodd"
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM16.7071 9.70711C17.0976 9.31658 17.0976 8.68342 16.7071 8.29289C16.3166 7.90237 15.6834 7.90237 15.2929 8.29289L10.5 13.0858L8.70711 11.2929C8.31658 10.9024 7.68342 10.9024 7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071L9.79289 15.2071C10.1834 15.5976 10.8166 15.5976 11.2071 15.2071L16.7071 9.70711Z"
            fill="#10B981" />
    </svg>
);

const Landing = () => {
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState(null);
    const openModal = (id) => setActiveModal(id);
    const closeModal = () => setActiveModal(null);

    return (

        <div className="lp-root">

            {/* ── HEADER ── */}
            <header className="lp-header">
                <div className="lp-container lp-header-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                        <Link to="/" className="lp-logo">
                            <img src={CodeWiseLogo} alt="CodeWise Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                        </Link>
                        <nav className="lp-nav">
                            <a href="#">Practice</a>
                            <a href="#">Companies</a>
                            <a href="#">Mock Exams</a>
                            <a href="#">Pricing</a>
                        </nav>
                    </div>
                    <div className="lp-header-actions">
                        <Link to="/login" className="lp-btn-ghost">Log In</Link>
                        <Link to="/login" className="lp-btn-primary">Sign Up</Link>
                    </div>
                </div>
            </header>

            {/* ── HERO ── */}
            <section className="lp-hero">
                <div className="lp-hero-blob" aria-hidden="true"></div>
                <div className="lp-container">
                    <div className="lp-hero-grid">

                        {/* Left: Text */}
                        <Reveal className="lp-hero-content">
                            <div className="lp-badge">
                                <span className="lp-badge-dot"></span>
                                New: AI Mock Interviews
                            </div>

                            <h1 className="lp-h1">
                                Master Coding.<br />
                                <span className="lp-h1-blue">Crack Placements.</span>
                            </h1>

                            <p className="lp-hero-sub">
                                Practice coding problems, simulate company-specific exams, and get
                                ready for your dream job with our AI-powered learning assistant.
                            </p>

                            <div className="lp-hero-actions">
                                <button className="lp-btn-lg lp-btn-lg-primary" onClick={() => navigate('/login')}>Start Practicing</button>
                                <button className="lp-btn-lg lp-btn-lg-secondary" onClick={() => navigate('/login')}>Explore Companies</button>
                            </div>

                            <div className="lp-trust-indicators">
                                <div className="lp-trust-item"><CheckIcon />Free Tier Available</div>
                                <div className="lp-trust-item"><CheckIcon />No Credit Card</div>
                            </div>
                        </Reveal>

                        {/* Right: Code Window */}
                        <Reveal delay={180} className="lp-hero-visual">
                            <div className="lp-code-window">
                                <div className="lp-code-header">
                                    <span className="lp-window-dot lp-window-dot-red"></span>
                                    <span className="lp-window-dot lp-window-dot-yellow"></span>
                                    <span className="lp-window-dot lp-window-dot-green"></span>
                                    <span className="lp-code-filename">Main.java</span>
                                </div>
                                <div className="lp-code-body">
                                    <div className="lp-code-line"><span className="lp-line-num">1</span><span className="lp-kw">public class</span> <span className="lp-cn">Solution</span> {'{'}</div>
                                    <div className="lp-code-line"><span className="lp-line-num">2</span><span style={{ marginLeft: '1.5rem' }}><span className="lp-kw">public static void</span> <span className="lp-fn">main</span> (String[] args) {'{'}</span></div>
                                    <div className="lp-code-line"><span className="lp-line-num">3</span><span style={{ marginLeft: '3rem' }} className="lp-cm">// Optimized approach for O(n)</span></div>
                                    <div className="lp-code-line"><span className="lp-line-num">4</span><span style={{ marginLeft: '3rem' }}>int[] arr = {'{'}1, 4, 6, 8, 10{'}'};</span></div>
                                    <div className="lp-code-line"><span className="lp-line-num">5</span><span style={{ marginLeft: '3rem' }}><span className="lp-kw">for</span> {`(int i = 0; i < arr.length; i++) {`}</span></div>
                                    <div className="lp-code-line"><span className="lp-line-num">6</span><span style={{ marginLeft: '4.5rem' }}>System.out.println(arr[i]);</span></div>
                                    <div className="lp-code-line"><span className="lp-line-num">7</span><span style={{ marginLeft: '3rem' }}>{'}'}</span></div>
                                    <div className="lp-code-line"><span className="lp-line-num">8</span><span style={{ marginLeft: '1.5rem' }}>{'}'}</span></div>
                                    <div className="lp-code-line"><span className="lp-line-num">9</span>{'}'}</div>
                                </div>
                                {/* Floating badge */}
                                <div className="lp-success-badge">
                                    <div className="lp-success-icon">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="lp-success-title">Test Cases Passed</div>
                                        <div className="lp-success-sub">Runtime: 2ms • Memory: 42MB</div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── TRUST LOGOS ── */}
            <section className="lp-trust-section">
                <div className="lp-container">
                    <p className="lp-trust-label">Trusted by students placed at</p>
                    <div className="lp-logos-row">
                        {['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys'].map(c => (
                            <div key={c} className="lp-company-name">{c}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="lp-section lp-section-light">
                <div className="lp-container">
                    <Reveal className="lp-section-header">
                        <h2 className="lp-h2">Built for Smart Preparation</h2>
                        <p className="lp-section-sub">Everything you need to crack your placement exams in one unified platform.</p>
                    </Reveal>
                    <div className="lp-features-grid">
                        {[
                            { icon: 'code', cls: 'lp-feature-icon-blue', title: 'Language Practice', desc: 'Master C++, Java, Python, and more with topic-wise problems sorted by difficulty.' },
                            { icon: 'apartment', cls: 'lp-feature-icon-purple', title: 'Company Prep', desc: 'Target specific companies like TCS, Wipro, and Infosys with curated problem sets.' },
                            { icon: 'timer', cls: 'lp-feature-icon-amber', title: 'Real Simulations', desc: 'Experience the real exam environment with timed mock tests and strict constraints.' },
                            { icon: 'psychology', cls: 'lp-feature-icon-green', title: 'AI Assistant', desc: 'Get instant hints, logic optimization tips, and complexity analysis from our AI tutor.' },
                            { icon: 'work', cls: 'lp-feature-icon-cyan', title: 'Placement Prep', desc: 'Get ready for technical interviews with aptitude tests, interview guides, and reasoning logic.' },
                        ].map((f, i) => (
                            <Reveal key={f.title} delay={i * 80}>
                                <div className="lp-feature-card">
                                    <div className={`lp-feature-icon ${f.cls}`}>
                                        <span className="material-symbols-outlined">{f.icon}</span>
                                    </div>
                                    <h3 className="lp-feature-title">{f.title}</h3>
                                    <p className="lp-feature-desc">{f.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PLATFORM PREVIEW ── */}
            <section className="lp-section lp-section-white">
                <div className="lp-container">
                    <div className="lp-preview-grid">
                        <Reveal>
                            <h2 className="lp-h2" style={{ marginBottom: '0.75rem' }}>Experience the Real Exam Environment</h2>
                            <div className="lp-preview-features" style={{ marginTop: '2rem' }}>
                                <div className="lp-preview-feature">
                                    <div className="lp-preview-feature-icon">
                                        <span className="material-symbols-outlined">terminal</span>
                                    </div>
                                    <div>
                                        <h4>Distraction-Free IDE</h4>
                                        <p>Full-screen coding interface similar to HackerRank and other testing platforms.</p>
                                    </div>
                                </div>
                                <div className="lp-preview-feature">
                                    <div className="lp-preview-feature-icon">
                                        <span className="material-symbols-outlined">bug_report</span>
                                    </div>
                                    <div>
                                        <h4>Integrated Debugging</h4>
                                        <p>Run custom test cases and debug your code in real-time before final submission.</p>
                                    </div>
                                </div>
                                <button className="lp-demo-link">
                                    Try Demo Challenge
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
                                </button>
                            </div>
                        </Reveal>

                        <Reveal delay={150}>
                            <div className="lp-ide-window">
                                <div className="lp-ide-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className="lp-ide-title">Problem 2: Array Rotation</span>
                                        <span className="lp-ide-badge">Medium</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className="lp-ide-timer">
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>timer</span>
                                            00:45:12
                                        </span>
                                        <button className="lp-ide-submit-btn">Submit</button>
                                    </div>
                                </div>
                                <div className="lp-ide-panels">
                                    <div className="lp-ide-description">
                                        <h3>Description</h3>
                                        <p>Given an array, rotate it to the right by k steps, where k is non-negative.</p>
                                        <p className="lp-example">Example 1:</p>
                                        <div className="lp-code-example">
                                            Input: nums = [1,2,3,4,5,6,7], k = 3<br />
                                            Output: [5,6,7,1,2,3,4]
                                        </div>
                                    </div>
                                    <div className="lp-ide-editor">
                                        <div><span className="lp-code-purple">class</span> <span className="lp-code-amber">Solution</span> {'{'}</div>
                                        <div style={{ paddingLeft: '1rem' }}><span className="lp-code-purple">public void</span> <span className="lp-code-blue">rotate</span>(int[] nums, int k) {'{'}</div>
                                        <div style={{ paddingLeft: '2rem' }} className="lp-code-gray">// write your solution</div>
                                        <div style={{ paddingLeft: '2rem' }} className="lp-code-green">
                                            k %= nums.length;<br />
                                            reverse(nums, 0, nums.length - 1);<br />
                                            reverse(nums, 0, k - 1);<br />
                                            reverse(nums, k, nums.length - 1);
                                        </div>
                                        <div style={{ paddingLeft: '1rem' }}>{'}'}</div>
                                        <div>{'}'}</div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="lp-section lp-section-light">
                <div className="lp-container">
                    <Reveal className="lp-section-header">
                        <h2 className="lp-h2">Your Path to Success</h2>
                    </Reveal>
                    <div className="lp-steps-grid">
                        {[
                            { icon: 'checklist', step: '1', title: 'Choose Goal', desc: 'Select your target company or language you want to master.' },
                            { icon: 'code_blocks', step: '2', title: 'Practice Daily', desc: 'Solve curated problems and take mock tests designed by industry experts.' },
                            { icon: 'trending_up', step: '3', title: 'Track & Improve', desc: 'Monitor your accuracy, speed, and ranking to identify weak areas.' },
                        ].map((s, i) => (
                            <Reveal key={s.step} delay={i * 100}>
                                <div className="lp-step">
                                    <div className="lp-step-circle">
                                        <span className="material-symbols-outlined">{s.icon}</span>
                                    </div>
                                    <h3>{s.step}. {s.title}</h3>
                                    <p>{s.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── COMPANY PREP (dark) ── */}
            <section className="lp-section lp-section-dark">
                <div className="lp-container">
                    <Reveal>
                        <div className="lp-dark-header">
                            <div>
                                <h2 className="lp-h2 lp-h2-white">Prepare Company-Wise</h2>
                                <p className="lp-dark-section-sub">Don't just practice randomly. Prepare with questions previously asked in your dream company's exams.</p>
                            </div>
                            <button className="lp-view-all-link">
                                View all companies
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
                            </button>
                        </div>
                    </Reveal>
                    <div className="lp-company-cards">
                        {[
                            { abbr: 'TCS', tag: 'High Demand', tagCls: 'lp-tag-green', title: 'TCS NQT Prep', desc: 'Includes Numerical Ability, Verbal, and Reasoning logic specific to NQT pattern.', btnCls: 'lp-card-btn-primary', d: 0 },
                            { abbr: 'INFY', tag: 'Popular', tagCls: 'lp-tag-blue', title: 'Infosys InfyTQ', desc: 'Master Python/Java fundamentals and DBMS concepts for the certification exam.', btnCls: 'lp-card-btn-secondary', d: 100 },
                            { abbr: 'WIPRO', tag: 'Standard', tagCls: 'lp-tag-slate', title: 'Wipro NLTH', desc: 'Focus on automata fix, essay writing, and coding questions typical to Elite NLTH.', btnCls: 'lp-card-btn-secondary', d: 200 },
                        ].map(c => (
                            <Reveal key={c.abbr} delay={c.d}>
                                <div className="lp-company-card">
                                    <div className="lp-company-card-header">
                                        <div className="lp-company-logo">{c.abbr}</div>
                                        <span className={`lp-tag ${c.tagCls}`}>{c.tag}</span>
                                    </div>
                                    <h3>{c.title}</h3>
                                    <p>{c.desc}</p>
                                    <button className={`lp-card-btn ${c.btnCls}`} onClick={() => navigate('/login')}>Start Preparation</button>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ANALYTICS ── */}
            <section className="lp-section lp-section-white">
                <div className="lp-container">
                    <div className="lp-analytics-grid">
                        <Reveal>
                            <div className="lp-analytics-card">
                                <div className="lp-analytics-card-header">
                                    <h3>Weekly Progress</h3>
                                    <span className="lp-period-pill">Last 7 Days</span>
                                </div>
                                <div className="lp-bar-chart">
                                    {[40, 60, 30, 85, 50, 70, 65].map((h, i) => (
                                        <div key={i} className="lp-bar-wrap">
                                            <div className={`lp-bar ${h === 85 ? 'lp-bar-blue' : 'lp-bar-light'}`} style={{ height: `${h}%` }}></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="lp-stats-row">
                                    <div className="lp-stat-box">
                                        <div className="lp-stat-label">Problems Solved</div>
                                        <div className="lp-stat-value">124</div>
                                        <div className="lp-stat-change">
                                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_upward</span>+12 this week
                                        </div>
                                    </div>
                                    <div className="lp-stat-box">
                                        <div className="lp-stat-label">Accuracy</div>
                                        <div className="lp-stat-value">87%</div>
                                        <div className="lp-stat-change">
                                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_upward</span>+2% this week
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={150}>
                            <div className="lp-analytics-text">
                                <h2>Track Your Growth</h2>
                                <p>Visualise your progress with detailed analytics. Understand your strong and weak topics to focus your preparation where it matters most.</p>
                                <ul className="lp-feature-list">
                                    <li className="lp-feature-list-item">
                                        <div className="lp-feature-list-icon">
                                            <span className="material-symbols-outlined">insights</span>
                                        </div>
                                        <div>
                                            <h4>Topic-wise Breakdown</h4>
                                            <p>See how you perform in Arrays, Strings, DP, and Graphs separately.</p>
                                        </div>
                                    </li>
                                    <li className="lp-feature-list-item">
                                        <div className="lp-feature-list-icon">
                                            <span className="material-symbols-outlined">leaderboard</span>
                                        </div>
                                        <div>
                                            <h4>Performance Benchmarking</h4>
                                            <p>Compare your speed and accuracy with top performers on the platform.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="lp-cta-section">
                <div className="lp-container">
                    <Reveal>
                        <div className="lp-cta-card">
                            <div className="lp-cta-blob1" aria-hidden="true"></div>
                            <div className="lp-cta-blob2" aria-hidden="true"></div>
                            <div className="lp-cta-inner">
                                <h2>Ready to Crack Your Dream Job?</h2>
                                <p>Join thousands of students who are mastering coding and getting placed in top MNCs.</p>
                                <div className="lp-cta-actions">
                                    <Link to="/login" className="lp-cta-btn-white">Start Your Placement Journey</Link>
                                    <button className="lp-cta-btn-dark">View Pricing Plans</button>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <div className="lp-container">
                    <div className="lp-footer-grid">
                        <div className="lp-footer-brand">
                            <Link to="/" className="lp-logo">
                                <img src={CodeWiseLogo} alt="CodeWise Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
                            </Link>
                            <p>Empowering students to bridge the gap between academic learning and industry requirements through structured coding practice.</p>
                            <div className="lp-footer-socials">
                                <a className="lp-social-btn" href="#"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>public</span></a>
                                <a className="lp-social-btn" href="#"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>mail</span></a>
                            </div>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Platform</h4>
                            <ul className="lp-footer-links">
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('practice-problems')}>Practice Problems</button></li>
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('mock-tests')}>Mock Tests</button></li>
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('company-sheets')}>Company Sheets</button></li>
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('ide-features')}>IDE Features</button></li>
                            </ul>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Resources</h4>
                            <ul className="lp-footer-links">
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('blog')}>Blog</button></li>
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('interview-experiences')}>Interview Experiences</button></li>
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('cheat-sheets')}>Cheat Sheets</button></li>
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('roadmaps')}>Roadmaps</button></li>
                            </ul>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Company</h4>
                            <ul className="lp-footer-links">
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('about-us')}>About Us</button></li>
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('contact')}>Contact</button></li>
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('privacy')}>Privacy Policy</button></li>
                                <li><button className="lp-footer-link-btn" onClick={() => openModal('terms')}>Terms of Service</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="lp-footer-bottom">
                        <p>© 2026 CodeWise Inc. All rights reserved.</p>
                        <div className="lp-footer-legal">
                            <button className="lp-footer-link-btn" onClick={() => openModal('privacy')}>Privacy</button>
                            <button className="lp-footer-link-btn" onClick={() => openModal('terms')}>Terms</button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── MODAL ── */}
            <FooterModal id={activeModal} onClose={closeModal} />

        </div>
    );
};

export default Landing;

