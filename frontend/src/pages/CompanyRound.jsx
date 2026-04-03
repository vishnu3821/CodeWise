import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import QuestionAccordion from '../components/QuestionAccordion';
import { useTransition } from '../context/TransitionContext';
import { toast } from '../utils/toast';
import './PlacementPreparation.css';

const CompanyRound = () => {
    const { companyId, roundId } = useParams();
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useTransition();

    const [questions, setQuestions] = useState([]);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [moduleDetails, setModuleDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                startLoading();
                const token = localStorage.getItem('token');

                // Fetch basic info for layout headers
                const compRes = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/public/companies/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCompanyDetails(compRes.data);

                const modRes = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/public/companies/${companyId}/modules`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const matchedModule = modRes.data.find(m => m.id === parseInt(roundId));
                setModuleDetails(matchedModule);

                // Fetch exactly the active questions for this module
                const qRes = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/placement-prep/public/companies/${companyId}/questions?moduleId=${roundId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuestions(qRes.data);
            } catch (error) {
                console.error("Error fetching round data:", error);
                toast.error("Failed to load interview questions.");
            } finally {
                stopLoading();
            }
        };
        fetchData();
    }, [companyId, roundId]);

    const companyName = companyDetails ? companyDetails.name : 'Company';
    const roundName = moduleDetails ? moduleDetails.module_name : 'Interview Module';
    const roundType = moduleDetails ? moduleDetails.module_type : 'Questions';

    return (
        <div className="placement-prep-container">
            <button
                className="cd-back-btn"
                onClick={() => navigate(`/placement-preparation/company-practice/${companyId}`)}
            >
                <ArrowLeft size={16} /> Back to Modules
            </button>

            <header className="pp-header" style={{ marginTop: '24px' }}>
                <h1 className="pp-title">{roundName} – {companyName}</h1>
                <p className="pp-subtitle">{questions.length} Common {roundType} Questions</p>
            </header>

            <div className="cr-questions-list" style={{ marginTop: '32px', maxWidth: '900px' }}>
                {questions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        No questions available for this module yet. Check back soon!
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <QuestionAccordion
                            key={q.id}
                            number={index + 1}
                            question={q.question_title}
                            detailedAnswer={q.detailed_answer}
                            keyPoints={q.points || []}
                            tags={q.tags || []}
                            defaultExpanded={index === 0}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default CompanyRound;
