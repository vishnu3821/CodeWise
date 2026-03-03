import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import CodeWiseLogo from '../assets/CodeWise-Logo.png';

const StudentFooter = () => {
    const [activeModal, setActiveModal] = useState(null);

    const modalContent = {
        about: {
            title: "About Us",
            content: (
                <>
                    <p style={{ marginBottom: '16px' }}>CodeWise aims to bridge the gap between theory and real-world programming skills.</p>
                    <p>By combining practice, exams, review systems, and analytics, it creates a disciplined learning environment.</p>
                </>
            )
        },
        careers: {
            title: "Careers",
            content: (
                <>
                    <p style={{ marginBottom: '16px' }}>CodeWise welcomes:</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '16px', lineHeight: '1.6' }}>
                        <li>Contributors</li>
                        <li>Developers</li>
                        <li>Designers</li>
                        <li>Educators</li>
                    </ul>
                    <p>Interested individuals can reach out for collaboration opportunities.</p>
                </>
            )
        },
        contact: {
            title: "Contact",
            content: (
                <>
                    <h5 style={{ fontWeight: '600', marginBottom: '8px' }}>Support & Enquiries</h5>
                    <p style={{ marginBottom: '16px', color: '#2563eb' }}>help.codewise@gmail.com</p>
                    <h5 style={{ fontWeight: '600', marginBottom: '8px' }}>P. Vishnu Prabhakar</h5>
                    <p style={{ color: '#2563eb' }}>Email: 2300033040cseh@gmail.com</p>
                </>
            )
        },
        legal: {
            title: "Legal & Compliance",
            content: (
                <>
                    <p style={{ marginBottom: '16px' }}>CodeWise follows standard legal and data protection practices:</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '16px', lineHeight: '1.6' }}>
                        <li>Privacy Policy</li>
                        <li>Terms of Service</li>
                        <li>Data handling guidelines</li>
                        <li>Platform usage rules</li>
                    </ul>
                    <p>These ensure user trust and compliance.</p>
                </>
            )
        },
        privacy: {
            title: "Privacy Policy",
            content: (
                <>
                    <p>CodeWise respects user privacy and data security. We collect only essential information required for authentication and platform functionality. Your practice data, scores, and personal details will never be sold to third parties.</p>
                </>
            )
        },
        terms: {
            title: "Terms of Service",
            content: (
                <>
                    <p style={{ marginBottom: '16px' }}>By using CodeWise, you agree to engage in fair practice during exams and respect the intellectual property of the platform.</p>
                    <p>Violations of these terms, including cheating during assessments or exploiting platform vulnerabilities, may result in account suspension.</p>
                </>
            )
        }
    };

    const handleOpenModal = (e, type) => {
        e.preventDefault();
        setActiveModal(type);
    };

    const handleCloseModal = () => {
        setActiveModal(null);
    };

    return (
        <footer style={{
            backgroundColor: '#f9fafb',
            padding: '48px 32px 24px 32px',
            borderTop: '1px solid #e5e7eb',
            marginTop: 'auto',
            width: '100%',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                <div className="student-footer-grid">
                    {/* Column 1: Logo & Description */}
                    <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            <img src={CodeWiseLogo} alt="CodeWise" style={{ width: '28px', height: '28px' }} />
                            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>CodeWise</span>
                        </Link>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5', maxWidth: '280px' }}>
                            Master your technical interviews with our comprehensive question bank and guides.
                        </p>
                    </div>

                    {/* Column 2: Resources */}
                    <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                            Resources
                        </h4>
                        <Link to="/placement-preparation" className="footer-link">Question Bank</Link>
                        <Link to="/dashboard/notes" className="footer-link">Interview Guides</Link>
                        <Link to="/placement-preparation" className="footer-link">Company Profiles</Link>
                    </div>

                    {/* Column 3: Company */}
                    <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                            Company
                        </h4>
                        <a href="#" className="footer-link" onClick={(e) => handleOpenModal(e, 'about')}>About Us</a>
                        <a href="#" className="footer-link" onClick={(e) => handleOpenModal(e, 'careers')}>Careers</a>
                        <a href="#" className="footer-link" onClick={(e) => handleOpenModal(e, 'contact')}>Contact</a>
                    </div>

                    {/* Column 4: Legal */}
                    <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                            Legal
                        </h4>
                        <a href="#" className="footer-link" onClick={(e) => handleOpenModal(e, 'legal')}>Company Legal</a>
                        <a href="#" className="footer-link" onClick={(e) => handleOpenModal(e, 'privacy')}>Privacy Policy</a>
                        <a href="#" className="footer-link" onClick={(e) => handleOpenModal(e, 'terms')}>Terms of Service</a>
                    </div>
                </div>

                {/* Information Modal Overlay */}
                {activeModal && modalContent[activeModal] && (
                    <div className="footer-modal-overlay" onClick={handleCloseModal}>
                        <div className="footer-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="footer-modal-header">
                                <h3>{modalContent[activeModal].title}</h3>
                                <button onClick={handleCloseModal} className="footer-modal-close">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="footer-modal-body">
                                {modalContent[activeModal].content}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{
                    marginTop: '48px',
                    paddingTop: '24px',
                    borderTop: '1px solid #e5e7eb',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                        © 2026 CodeWise Inc. All rights reserved.
                    </p>
                </div>
            </div>
            <style>{`
                .student-footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 32px;
                }
                
                .footer-link {
                    color: #6b7280;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.2s;
                }
                
                .footer-link:hover {
                    color: #2563eb;
                }
                
                @media (max-width: 992px) {
                    .student-footer-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                
                @media (max-width: 576px) {
                    .student-footer-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                }
                
                /* Modal Styles */
                .footer-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.2s ease-out;
                }
                
                .footer-modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    overflow: hidden;
                    animation: slideUp 0.3s ease-out;
                }
                
                .footer-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .footer-modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: #111827;
                }
                
                .footer-modal-close {
                    background: transparent;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .footer-modal-close:hover {
                    background: #f3f4f6;
                    color: #111827;
                }
                
                .footer-modal-body {
                    padding: 24px;
                    color: #4b5563;
                    font-size: 0.95rem;
                    line-height: 1.6;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </footer>
    );
};

export default StudentFooter;
