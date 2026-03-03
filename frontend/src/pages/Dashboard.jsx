import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Code2, BookOpen, History, Terminal, Briefcase } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import UserProfileDropdown from '../components/UserProfileDropdown';
import VerificationBanner from '../components/VerificationBanner';
import StudentFooter from '../components/StudentFooter';
import CodeWiseLogo from '../assets/CodeWise-Logo.png';
import './Dashboard.css';

import { useTransition } from '../context/TransitionContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { triggerTransition } = useTransition();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        triggerTransition('/login', () => {
            localStorage.removeItem('user');
        });
    };

    const handleNavClick = (e, path) => {
        e.preventDefault();
        triggerTransition(path);
    };

    return (
        <div className="dashboard-layout">

            {/* 1. Fixed Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <NavLink to="/dashboard" className="logo-link" onClick={(e) => handleNavClick(e, '/dashboard')}>
                        <img src={CodeWiseLogo} alt="CodeWise" className="logo-img" />
                        <span className="logo-text">CodeWise</span>
                    </NavLink>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, '/dashboard')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/language-practice"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, '/dashboard/language-practice')}
                    >
                        <Code2 size={20} />
                        <span>Language Practice</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/notes"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, '/dashboard/notes')}
                    >
                        <BookOpen size={20} />
                        <span>Notes</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/recently-solved"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, '/dashboard/recently-solved')}
                    >
                        <History size={20} />
                        <span>Recently Solved</span>
                    </NavLink>

                    <div className="sidebar-divider"></div>

                    <NavLink
                        to="/training-exams"
                        className="sidebar-link"
                        target="_self"
                    >
                        <Terminal size={20} />
                        <span>Training Exams</span>
                    </NavLink>

                    <NavLink
                        to="/placement-preparation"
                        className="sidebar-link"
                        target="_self"
                    >
                        <Briefcase size={20} />
                        <span>Placement Preparation</span>
                    </NavLink>
                </nav>
            </aside>

            {/* 2. Main Body (Header + Content) */}
            <div className="dashboard-body">
                <header className="dashboard-header">
                    <div className="header-actions">
                        <NotificationBell />
                        <UserProfileDropdown user={user} onLogout={handleLogout} />
                    </div>
                </header>

                <div className="dashboard-scroll-wrapper">
                    <main className="dashboard-content">
                        <VerificationBanner user={user} />
                        <Outlet />
                    </main>

                    <StudentFooter />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
