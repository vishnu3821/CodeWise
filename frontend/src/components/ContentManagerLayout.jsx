import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut, Code2, BookOpen, FileQuestion, FileText, LayoutDashboard, User, AlertCircle, Briefcase, History
} from 'lucide-react';
import '../pages/ContentManagerDashboard.css'; // Use the shared CSS

const ContentManagerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/content-login');
    };

    const isActive = (path) => {
        if (path === '/content-dashboard' && location.pathname === '/content-dashboard') return true;
        if (path !== '/content-dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    if (!user) return null; // Or a loader

    return (
        <div className="cm-dashboard-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <LayoutDashboard size={28} className="text-blue-500" /> CodeWise
                </div>
                <nav className="admin-nav">
                    <div
                        className={`admin-nav-item ${isActive('/content-dashboard') ? 'active' : ''}`}
                        onClick={() => navigate('/content-dashboard')}
                    >
                        <LayoutDashboard size={20} /> Overview
                    </div>
                    <div
                        className={`admin-nav-item ${isActive('/content-dashboard/languages') ? 'active' : ''}`}
                        onClick={() => navigate('/content-dashboard/languages')}
                    >
                        <Code2 size={20} /> Languages
                    </div>
                    {/* Topics usually integrated via Languages, but keeping link if needed or mapping to something else */}
                    <div
                        className={`admin-nav-item ${isActive('/content-dashboard/questions') ? 'active' : ''}`}
                        onClick={() => navigate('/content-dashboard/questions')}
                    >
                        <FileQuestion size={20} /> QuestionsBank
                    </div>
                    <div
                        className={`admin-nav-item ${isActive('/content-dashboard/placement-prep') ? 'active' : ''}`}
                        onClick={() => navigate('/content-dashboard/placement-prep')}
                    >
                        <Briefcase size={20} /> Placement Prep Matrix
                    </div>
                    <div
                        className={`admin-nav-item ${isActive('/content-dashboard/exams') ? 'active' : ''}`}
                        onClick={() => navigate('/content-dashboard/exams')}
                    >
                        <FileText size={20} /> Exams
                    </div>
                    <div
                        className={`admin-nav-item ${isActive('/content-dashboard/placement-prep/activity') ? 'active' : ''}`}
                        onClick={() => navigate('/content-dashboard/placement-prep/activity')}
                    >
                        <History size={20} /> Recent Activity
                    </div>
                    <div
                        className={`admin-nav-item ${isActive('/content-dashboard/notes') ? 'active' : ''}`}
                        onClick={() => navigate('/content-dashboard/notes')}
                    >
                        <BookOpen size={20} /> Notes
                    </div>
                    <div
                        className={`admin-nav-item ${isActive('/profile') ? 'active' : ''}`}
                        onClick={() => navigate('/profile')}
                    >
                        <User size={20} /> Profile
                    </div>
                    <div
                        className={`admin-nav-item ${isActive('/content-dashboard/report-issue') ? 'active' : ''}`}
                        onClick={() => navigate('/content-dashboard/report-issue')}
                    >
                        <AlertCircle size={20} /> Report Issue
                    </div>
                </nav>
                <div className="admin-logout" onClick={handleLogout}>
                    <LogOut size={20} /> Logout
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {/* Header is part of the layout or page? usually page specific title changes, but user info is constant. 
                    Let's put the generic header container here, or let pages handle it? 
                    The redesign had a header in dashboard. Let's make a consistent header top bar here if possible. 
                    Actually, pages have specific titles. Let's provide a slot or just Outlet.
                    But wait, the redesign showed "Content Studio" in header. Manage Languages has "Manage Languages".
                    Let's allow pages to render their own content, but we provide the CONTAINER (admin-main).
                */}
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default ContentManagerLayout;
