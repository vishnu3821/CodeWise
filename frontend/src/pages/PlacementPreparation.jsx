import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlacementPreparation.css';
import { Briefcase, ArrowRight } from 'lucide-react';

const PlacementPreparation = () => {
    const navigate = useNavigate();

    return (
        <div className="placement-prep-container">
            <header className="pp-header">
                <h1 className="pp-title">Placement Preparation</h1>
                <p className="pp-subtitle">Company-specific preparation and placement resources.</p>
            </header>

            <div className="pp-content-grid">
                {/* Submodule Card 1 */}
                <div className="pp-module-card">
                    <div className="pp-module-icon">
                        <Briefcase size={28} />
                    </div>
                    <div className="pp-module-info">
                        <h3 className="pp-module-title">Company Based Practice & Preparation</h3>
                        <p className="pp-module-desc">Practice questions and mock exams based on company patterns.</p>
                    </div>
                    <button
                        className="pp-module-btn"
                        onClick={() => navigate('/placement-preparation/company-practice')}
                    >
                        Explore Companies <ArrowRight size={16} />
                    </button>
                </div>

                {/* Placeholder for future submodules */}
                {/* <div className="pp-module-card"> ... </div> */}
            </div>
        </div>
    );
};

export default PlacementPreparation;
