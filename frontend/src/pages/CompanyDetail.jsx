import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Code2, Users, BookOpen, Monitor, Briefcase, ChevronRight } from 'lucide-react';
import { useTransition } from '../context/TransitionContext';
import { toast } from '../utils/toast';
import './PlacementPreparation.css';
import './CompanyDetail.css';

const CompanyDetail = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useTransition();

    const [company, setCompany] = useState(null);
    const [modules, setModules] = useState([]);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                startLoading();
                const token = localStorage.getItem('token');

                // Fetch company details
                const compRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/placement-prep/public/companies/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCompany(compRes.data);

                // Fetch modules
                const modRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/placement-prep/public/companies/${companyId}/modules`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setModules(modRes.data);

            } catch (error) {
                console.error("Error fetching company details:", error);
                toast.error("Failed to load company sections.");
            } finally {
                stopLoading();
            }
        };

        fetchCompanyData();
    }, [companyId]);

    const getModuleIcon = (type) => {
        switch (type) {
            case 'Technical': return <Code2 size={24} />;
            case 'HR': return <Users size={24} />;
            case 'Aptitude': return <BookOpen size={24} />;
            case 'Coding': return <Monitor size={24} />;
            case 'Managerial': return <Briefcase size={24} />;
            default: return <Code2 size={24} />;
        }
    };

    if (!company) return null;

    return (
        <div className="placement-prep-container">
            <button
                className="cd-back-btn"
                onClick={() => navigate('/placement-preparation/company-practice')}
            >
                <ArrowLeft size={16} /> Back to Companies
            </button>

            <header className="pp-header" style={{ marginTop: '24px' }}>
                <h1 className="pp-title">{company.name} Placement Preparation</h1>
                <p className="pp-subtitle">{company.description || `Prepare for modules of ${company.name} interviews.`}</p>
            </header>

            <div className="cd-rounds-grid">
                {modules.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 col-span-full">
                        No active modules found for this company.
                    </div>
                ) : (
                    modules.map((mod) => (
                        <div key={mod.id} className="cd-round-card">
                            <div className="cd-round-header">
                                <div className="cd-round-icon">
                                    {getModuleIcon(mod.module_type)}
                                </div>
                                <h3 className="cd-round-title">{mod.module_name}</h3>
                            </div>

                            <p className="cd-round-desc">{mod.description || `Module covering ${mod.module_type} questions.`}</p>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                                {mod.question_count} Questions Available
                            </div>

                            <button
                                className="cd-round-btn"
                                onClick={() => navigate(`/placement-preparation/company-practice/${company.slug || company.id}/${mod.id}`)}
                            >
                                Explore <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CompanyDetail;
