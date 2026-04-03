import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-email`, { token });
                setStatus('success');
                setMessage(response.data.message);

                // Update local storage user if logged in
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    user.email_verified = true;
                    localStorage.setItem('user', JSON.stringify(user));
                }

                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);

            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Token may be expired.');
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email...</h2>
                        <p className="text-gray-500">Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="bg-green-100 p-3 rounded-full mb-4">
                            <CheckCircle className="text-green-600" size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">Your email has been successfully verified. You now have full access to CodeWise.</p>
                        <Link to="/dashboard" className="btn btn-primary inline-flex items-center gap-2">
                            Go to Dashboard <ArrowRight size={18} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="bg-red-100 p-3 rounded-full mb-4">
                            <XCircle className="text-red-600" size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-red-500 mb-6">{message}</p>
                        <p className="text-gray-500 text-sm mb-4">The link may be expired. Please login to request a new one.</p>
                        <Link to="/login" className="btn btn-secondary">
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
