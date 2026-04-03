import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, ArrowRight } from 'lucide-react';
import { useTransition } from '../context/TransitionContext';
import { toast } from '../utils/toast';
import './PlacementPreparation.css';
import './CompanyPractice.css';

const CompanyPractice = () => {
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useTransition();
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                startLoading();
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/public/companies`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCompanies(response.data);
            } catch (error) {
                console.error("Failed to fetch companies:", error);
                toast.error("Failed to load companies.");
            } finally {
                stopLoading();
            }
        };
        fetchCompanies();
    }, []);

    return (
        <div className="placement-prep-container">
            <header className="pp-header">
                <h1 className="pp-title">Company Based Practice</h1>
                <p className="pp-subtitle">Select a company to start preparation based on its placement pattern.</p>
            </header>

            <div className="company-practice-grid">
                {companies.map((company) => (
                    <div key={company.id} className="cp-card">
                        <div className="cp-card-header">
                            {company.logo_path ? (
                                <div className="company-logo-wrapper">
                                    <img src={`${process.env.REACT_APP_API_URL || ""}/uploads/companies/${company.logo_path}`} alt={`${company.name} logo`} />
                                </div>
                            ) : (
                                <div className="company-logo-wrapper">
                                    <Building2 size={24} color="#94a3b8" />
                                </div>
                            )}
                            <h3 className="cp-card-title">{company.name}</h3>
                        </div>

                        <p className="cp-card-desc">{company.description || `Practice placement questions based on ${company.name} pattern.`}</p>

                        <div className="cp-badges">
                            <span className="cp-badge">Aptitude</span>
                            <span className="cp-badge">Coding</span>
                            <span className="cp-badge">Interview</span>
                        </div>

                        <button
                            className="cp-btn"
                            onClick={() => navigate(`/placement-preparation/company-practice/${company.slug || company.id}`)}
                        >
                            Start Preparation <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompanyPractice;
