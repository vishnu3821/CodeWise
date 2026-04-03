import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Code2, ArrowRight } from 'lucide-react';

const LanguagePractice = () => {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/languages`);
                // Filter languages that are enabled for practice
                const practiceLanguages = response.data.filter(lang => lang.has_practice);
                setLanguages(practiceLanguages);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching languages:', err);
                setError('Failed to load languages. Please try again later.');
                setLoading(false);
            }
        };

        fetchLanguages();
    }, []);

    if (loading) return <div className="loading-state">Loading languages...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="language-practice-page">
            <div className="page-header">
                <h1>Language Practice</h1>
                <p>Select a language to start</p>
            </div>

            <div className="languages-grid">
                {languages.map(language => (
                    <div key={language.id} className="language-card">
                        <div className="lang-icon-wrapper">
                            <Code2 size={24} />
                        </div>
                        <h3>{language.name}</h3>
                        <p>{language.description}</p>
                        <Link to={`/dashboard/language-practice/${language.slug}`} className="btn btn-primary full-width">
                            View Topics <ArrowRight size={16} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LanguagePractice;
