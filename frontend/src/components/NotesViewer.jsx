import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import axios from 'axios';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const NotesViewer = () => {
    // Note: The route param in App.js is named :language, but we are linking with ID.
    // So 'language' variable actually holds the Note ID. 
    // Ideally we should rename the route param in App.js to :id, but to avoid touching more files, we treat it as id.
    const { language: noteId } = useParams();
    const navigate = useNavigate();
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);
    const [fullscreen, setFullscreen] = useState(false);

    const [selectedNote, setSelectedNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return; // Auth handled by protected route, but safety check

                const res = await axios.get(`http://localhost:5001/api/content/notes/public/${noteId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSelectedNote(res.data);
            } catch (err) {
                console.error('Error fetching note:', err);
                setError('Failed to load note details.');
            } finally {
                setLoading(false);
            }
        };
        if (noteId) fetchNote();
    }, [noteId]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setFullscreen(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (loading) return <div className="notes-loading">Loading Note...</div>;

    if (error || !selectedNote) {
        return (
            <div className="notes-error">
                <h2>{error || 'Note not found'}</h2>
                <button onClick={() => navigate('/dashboard/notes')} className="back-btn">
                    Back to Notes
                </button>
            </div>
        );
    }

    // Construct full file URL (it comes as /uploads/notes/...)
    const fileUrl = `http://localhost:5001${selectedNote.file_url}`;

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const toggleFullscreen = () => {
        if (!fullscreen) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setFullscreen(false);
        }
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.6));

    return (
        <div className={`notes-reader-container ${fullscreen ? 'fullscreen-mode' : ''}`}>
            {/* Toolbar */}
            <div className="pdf-toolbar">
                <div className="toolbar-left">
                    <button
                        onClick={() => {
                            if (fullscreen) toggleFullscreen();
                            navigate('/dashboard/notes');
                        }}
                        className="toolbar-btn back-btn-toolbar"
                        title="Back to Notes"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <div className="toolbar-title">
                        <h3>{selectedNote.title}</h3>
                        <span>{selectedNote.language_name}</span>
                    </div>
                </div>

                <div className="toolbar-center">
                    <div className="zoom-controls">
                        <button onClick={handleZoomOut} className="toolbar-btn icon-only" title="Zoom Out">
                            <ZoomOut size={20} />
                        </button>
                        <span className="zoom-level">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} className="toolbar-btn icon-only" title="Zoom In">
                            <ZoomIn size={20} />
                        </button>
                    </div>
                </div>

                <div className="toolbar-right">
                    <div className="page-count">
                        {numPages ? `${numPages} Pages` : 'Loading...'}
                    </div>
                    <button onClick={toggleFullscreen} className="toolbar-btn icon-only" title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                        {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="pdf-scroll-container">
                <div className="pdf-document-wrapper">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<div className="pdf-loading">Loading PDF...</div>}
                        error={<div className="pdf-error">Failed to load PDF. Please try again.</div>}
                        className="pdf-document"
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <div key={`page_${index + 1}`} className="pdf-page-wrapper">
                                <Page
                                    pageNumber={index + 1}
                                    scale={scale}
                                    width={800}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="pdf-page"
                                />
                                <div className="page-number-footer">Page {index + 1}</div>
                            </div>
                        ))}
                    </Document>
                </div>
            </div>
        </div>
    );
};

export default NotesViewer;
