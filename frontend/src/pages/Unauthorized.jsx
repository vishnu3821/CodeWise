import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F8FAFC',
            fontFamily: "'Inter', sans-serif"
        }}>
            <ShieldAlert size={64} color="#EF4444" style={{ marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0F172A', marginBottom: '0.5rem' }}>Access Denied</h1>
            <p style={{ color: '#64748B', marginBottom: '2rem' }}>You do not have permission to view this page.</p>
            <Link to="/login" style={{
                padding: '0.75rem 1.5rem',
                background: '#0F172A',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600'
            }}>
                Back to Login
            </Link>
        </div>
    );
};

export default Unauthorized;
