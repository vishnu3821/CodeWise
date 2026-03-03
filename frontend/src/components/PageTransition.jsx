import React from 'react';
import { useTransition } from '../context/TransitionContext';
import CodeWiseLogo from '../assets/CodeWise-Logo.png';
import './PageTransition.css';

const PageTransition = () => {
    const { overlayState } = useTransition();

    if (overlayState === 'hidden') return null;

    const visibleClass = overlayState !== 'hidden' ? 'visible' : '';
    const stateClass = overlayState;

    return (
        <div className={`page-transition-overlay ${visibleClass} ${stateClass}`}>
            <img src={CodeWiseLogo} alt="CodeWise" className="transition-logo" />
        </div>
    );
};

export default PageTransition;
