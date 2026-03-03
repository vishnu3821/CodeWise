import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, LogOut } from 'lucide-react';

const SuspendedPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#F8FAFC',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                maxWidth: '500px'
            }}>
                <div style={{
                    background: '#FEF2F2',
                    color: '#EF4444',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <AlertOctagon size={48} />
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    color: '#1E293B',
                    marginBottom: '1rem'
                }}>
                    Account Suspended
                </h1>

                <p style={{
                    color: '#64748B',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    marginBottom: '2rem'
                }}>
                    Your account has been suspended by the administrator.
                    You no longer have access to this platform.
                </p>

                <button
                    onClick={handleLogout}
                    style={{
                        background: '#EF4444',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#DC2626'}
                    onMouseOut={(e) => e.target.style.background = '#EF4444'}
                >
                    <LogOut size={20} /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default SuspendedPage;
