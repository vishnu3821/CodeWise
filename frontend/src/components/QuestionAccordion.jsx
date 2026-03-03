import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import './QuestionAccordion.css';

const QuestionAccordion = ({
    number,
    question,
    detailedAnswer,
    tableData,
    codeSnippet,
    keyPoints,
    tags,
    defaultExpanded = false
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const contentRef = useRef(null);

    const toggleAccordion = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`question-accordion ${isExpanded ? 'expanded' : ''}`}>
            {/* Header (Always Visible) */}
            <div
                className="qa-header"
                onClick={toggleAccordion}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleAccordion();
                }}
            >
                <div className="qa-badge">{number}</div>
                <h3 className="qa-question-text">{question}</h3>
                <div className="qa-chevron">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {/* Expandable Body */}
            <div
                className="qa-body-wrapper"
                ref={contentRef}
                style={{
                    maxHeight: isExpanded ? `${contentRef.current?.scrollHeight}px` : '0px',
                    opacity: isExpanded ? 1 : 0
                }}
            >
                <div className="qa-body-content">
                    <div className="qa-grid-layout">
                        {/* Left Side: Detailed Answer */}
                        <div className="qa-detailed-answer">
                            <h4 className="qa-section-title">DETAILED ANSWER</h4>
                            <div className="qa-answer-text">
                                {detailedAnswer && typeof detailedAnswer === 'string' && detailedAnswer.split('\n\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}

                                {codeSnippet && (
                                    <div className="qa-code-block">
                                        <pre>
                                            <code>{codeSnippet}</code>
                                        </pre>
                                    </div>
                                )}

                                {tableData && (
                                    <div className="qa-table-container">
                                        <table className="qa-table">
                                            <thead>
                                                <tr>
                                                    {tableData.headers.map((header, index) => (
                                                        <th key={index}>{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.rows.map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {row.map((cell, cellIndex) => (
                                                            <td key={cellIndex}>{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Key Differentiators/Points */}
                        <div className="qa-key-points-section">
                            <h4 className="qa-section-title">KEY DIFFERENTIATORS</h4>
                            <ul className="qa-points-list">
                                {keyPoints.map((point, index) => (
                                    <li key={index} className="qa-point-item">
                                        <CheckCircle2 size={16} className="qa-point-icon" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom: Tags */}
                    {tags && tags.length > 0 && (
                        <div className="qa-tags-container">
                            {tags.map((tag, index) => (
                                <span key={index} className="qa-tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionAccordion;
