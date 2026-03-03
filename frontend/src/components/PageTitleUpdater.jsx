import { useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

const routeTitles = {
    '/': 'CodeWise - Master Programming Logic',
    '/login': 'Login | CodeWise',
    '/verify-email': 'Verify Email | CodeWise',
    '/dashboard': 'Dashboard | CodeWise',
    '/dashboard/language-practice': 'Language Practice | CodeWise',

    '/dashboard/notes': 'Notes | CodeWise',
    '/dashboard/recently-solved': 'Recently Solved | CodeWise',
    // Dynamic routes can be handled differently or matched specifically
};

// Helper to find partial matches if needed, but for now exact or startsWith
const getTitle = (pathname) => {
    // Exact match
    if (routeTitles[pathname]) return routeTitles[pathname];

    // Sub-path matches
    if (pathname.startsWith('/dashboard/language-practice/')) {
        // Could be more specific like "C Programming | CodeWise" if we parse it, 
        // but for now keeping it simple as requested
        return 'Practice Problem | CodeWise';
    }

    if (pathname.startsWith('/reset-password')) return 'Reset Password | CodeWise';

    return 'CodeWise';
};

const PageTitleUpdater = () => {
    const location = useLocation();

    useEffect(() => {
        document.title = getTitle(location.pathname);
    }, [location]);

    return null; // Logic only component
};

export default PageTitleUpdater;
