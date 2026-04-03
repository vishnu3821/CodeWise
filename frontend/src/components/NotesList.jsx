import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import axios from 'axios';

const NotesList = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                // Determine user token
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/content/notes/public`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotes(res.data);
            } catch (err) {
                console.error('Error fetching notes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    if (loading) return <div className="loading-state">Loading notes...</div>;

    return (
        <div className="notes-page">
            <div className="page-header">
                <h1>Study Notes</h1>
                <p>Comprehensive notes for various programming languages.</p>
            </div>

            <div className="notes-grid">
                {notes.length === 0 ? (
                    <p className="no-data">No notes available at the moment.</p>
                ) : (
                    notes.map((note) => (
                        <Link
                            to={`/dashboard/notes/${note.id}`}
                            key={note.id}
                            className="note-card"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="note-card-content">
                                <div className="note-icon-wrapper" style={{ color: '#3B82F6', backgroundColor: '#EFF6FF' }}>
                                    <FileText size={32} />
                                </div>
                                <div className="note-info">
                                    <h3>{note.title}</h3>
                                    <p>{note.language_name} • {note.description || 'View PDF'}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotesList;
