import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import { Bot, X, Send, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import CodeWiseLogo from '../assets/CodeWise-Logo.png';
import CodeWiseAILogo from '../assets/CodeWise-AI.png';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './AIAssistant.css';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi! I am the CodeWise AI Assistant. I can help you with concepts, syntax, and debugging while you learn.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const textareaRef = useRef(null);
    const panelRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Parse context from URL
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let currentLanguage = '';
    let currentTopic = '';

    if (pathSegments.includes('language-practice')) {
        const langIndex = pathSegments.indexOf('language-practice') + 1;
        if (pathSegments[langIndex]) currentLanguage = pathSegments[langIndex];
        if (pathSegments[langIndex + 1]) currentTopic = pathSegments[langIndex + 1];
    }

    // Visibility Logic
    const publicRoutes = ['/', '/login', '/register', '/signup', '/forgot-password'];
    const isPublicRoute = publicRoutes.some(route => location.pathname === route);
    const isTrainingExam = location.pathname.startsWith('/training-exams');
    const isContentDashboard = location.pathname.startsWith('/content-dashboard');
    const isAdminDashboard = location.pathname.startsWith('/admin-dashboard');

    if (isPublicRoute || isTrainingExam || isContentDashboard || isAdminDashboard) return null;

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/chat`, {
                message: userMsg.text,
                language: currentLanguage,
                topic: currentTopic,
                section: location.pathname.includes('notes') ? 'Notes' : 'Language Practice'
            });

            const botMsg = { type: 'bot', text: response.data.reply };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMsg = error.response?.data?.message || "AI service is temporarily unavailable. Try again later.";
            setMessages(prev => [...prev, { type: 'bot', text: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
    };

    // Close on click outside
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('ai-panel-overlay')) {
            setIsOpen(false);
        }
    };

    // Copy to clipboard component
    const CopyButton = ({ text }) => {
        const [copied, setCopied] = useState(false);

        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <button className="code-copy-btn" onClick={handleCopy} title="Copy code">
                {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
            </button>
        );
    };



    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    className="ai-toggle-btn"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI Assistant"
                >
                    <img
                        src={CodeWiseLogo}
                        alt="AI"
                        className="ai-toggle-icon"
                        style={{ filter: 'brightness(0) invert(1)' }}
                    />
                </button>
            )}

            {/* Sliding Panel Overlay */}
            <div
                className={`ai-panel-overlay ${isOpen ? 'open' : ''}`}
                onClick={handleOverlayClick}
            >
                <div className={`ai-panel ${isOpen ? 'open' : ''}`} ref={panelRef}>

                    {/* Header */}
                    <div className="ai-header">
                        <div className="ai-brand">
                            <img src={CodeWiseAILogo} alt="CodeWise AI" className="ai-logo" />
                            <span>CodeWise AI</span>
                        </div>
                        <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="ai-body">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ai-message ${msg.type}`}>
                                {msg.type === 'bot' ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <div className="ai-code-block">
                                                        <div className="ai-code-header">
                                                            <span>{match[1]}</span>
                                                            <CopyButton text={String(children).replace(/\n$/, '')} />
                                                        </div>
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                ) : (
                                                    <code className="ai-inline-code" {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                ) : (
                                    <pre className="user-text">{msg.text}</pre>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="ai-message bot">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Loader2 className="spin" size={16} /> Typing...
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />

                        {messages.length === 1 && (
                            <div className="ai-helper-text">
                                <p>Ask doubts while learning.</p>
                                <p>Get help with concepts, syntax, and errors.</p>
                                <p style={{ fontSize: '0.8em', marginTop: '4px' }}>No help is provided during exams.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Input */}
                    <div className="ai-footer">
                        <div className="ai-input-wrapper">
                            <textarea
                                ref={textareaRef}
                                className="ai-input"
                                placeholder="Ask a question..."
                                value={input}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                rows={1}
                            />
                            <button
                                className="ai-send-btn"
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default AIAssistant;
