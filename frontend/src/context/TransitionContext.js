import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TransitionContext = createContext();

export const TransitionProvider = ({ children }) => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [overlayState, setOverlayState] = useState('hidden'); // hidden, entering, holding, exiting
    const navigate = useNavigate();
    const location = useLocation();

    const triggerTransition = useCallback((toPath, onComplete) => {
        if (location.pathname === toPath) return; // Don't transition if already on page

        // Start Entrance
        setIsTransitioning(true);
        setOverlayState('entering');

        // Sequence
        // 0ms: Start Text/Logo Fade In (handled by CSS)

        // 400ms: Entrance done, start Hold
        setTimeout(() => {
            setOverlayState('holding');

            // Navigate while holding (so new content loads behind)
            if (toPath) {
                navigate(toPath);
            }
            if (onComplete) {
                onComplete();
            }

            // 1000ms: Hold done, start Exit
            setTimeout(() => {
                setOverlayState('exiting');

                // 1200ms: Cleanup
                setTimeout(() => {
                    setOverlayState('hidden');
                    setIsTransitioning(false);
                }, 200); // Exit duration
            }, 800); // Hold duration (1000 - 200)

        }, 200); // Entrance duration

    }, [navigate, location]);

    const startLoading = useCallback(() => {
        setIsTransitioning(true);
        setOverlayState('entering');

        // Sequence for manual loading
        // 0ms: Start Text/Logo Fade In
        // 400ms: Entrance done, start Hold
        setTimeout(() => {
            setOverlayState('holding');
        }, 200);
    }, []);

    const stopLoading = useCallback(() => {
        // 0ms: Start Exit
        setOverlayState('exiting');

        // 200ms: Cleanup
        setTimeout(() => {
            setOverlayState('hidden');
            setIsTransitioning(false);
        }, 200); // Exit duration
    }, []);

    return (
        <TransitionContext.Provider value={{ triggerTransition, startLoading, stopLoading, isTransitioning, overlayState }}>
            {children}
        </TransitionContext.Provider>
    );
};

export const useTransition = () => useContext(TransitionContext);
