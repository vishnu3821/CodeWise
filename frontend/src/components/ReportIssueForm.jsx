import React, { useState } from 'react';
import axios from 'axios';
import { Camera, AlertCircle, CheckCircle, Save, X } from 'lucide-react';
import './ReportIssueForm.css';

const ReportIssueForm = ({ onCancel, onSuccess }) => {
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB');
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('Description is required');
            return;
        }
        if (!file) {
            setError('Screenshot is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('description', description);
            formData.append('screenshot', file);
            formData.append('page_url', window.location.href);

            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/issues`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Issue reported successfully. We will review it shortly.');
            setDescription('');
            setFile(null);
            setPreview(null);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="report-success-message">
                <CheckCircle size={48} className="text-green-500" />
                <h3>Report Submitted!</h3>
                <p>Thank you for helping us improve.</p>
                <button className="btn-primary" onClick={onCancel || (() => setSuccess(''))}>Close</button>
            </div>
        );
    }

    return (
        <div className="report-issue-container">
            <h3>Report an Issue</h3>
            <p className="report-subtitle">Found a bug? Upload a screenshot and tell us what happened.</p>

            {error && (
                <div className="report-error">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Screenshot (Required)</label>
                    <div className={`file-upload-box ${preview ? 'has-file' : ''}`}>
                        {preview ? (
                            <div className="preview-container">
                                <img src={preview} alt="Preview" />
                                <button type="button" className="remove-btn" onClick={() => { setFile(null); setPreview(null); }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="upload-placeholder">
                                <Camera size={24} />
                                <span>Click to upload screenshot</span>
                                <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} hidden />
                            </label>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explain what happened, what you expected, and where the issue occurred."
                        rows={4}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReportIssueForm;
