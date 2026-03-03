import React from 'react';
import ReportIssueForm from '../components/ReportIssueForm';
import { AlertTriangle } from 'lucide-react';

const ContentManagerReportIssue = () => {
    return (
        <div style={{ padding: '2rem' }}>
            <div className="cm-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 700, color: '#1E293B' }}>
                    <AlertTriangle className="text-red-500" size={32} /> Report an Issue
                </h1>
                <p style={{ color: '#64748B', marginTop: '0.5rem' }}>Found something broken? Let us know.</p>
            </div>

            <ReportIssueForm
                onCancel={() => window.history.back()}
                onSuccess={() => { }}
            />
        </div>
    );
};

export default ContentManagerReportIssue;
