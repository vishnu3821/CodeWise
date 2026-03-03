import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress benign ResizeObserver error from Monaco Editor
// Suppress benign ResizeObserver error from Monaco Editor
const resizeObserverLoopErr = 'ResizeObserver loop completed with undelivered notifications';
const resizeObserverLoopErr2 = 'ResizeObserver loop limit exceeded';

const originalError = console.error;
console.error = (...args) => {
  if (args.some(arg => typeof arg === 'string' && (arg.includes(resizeObserverLoopErr) || arg.includes(resizeObserverLoopErr2)))) {
    return;
  }
  originalError.apply(console, args);
};

window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes(resizeObserverLoopErr) || e.message.includes(resizeObserverLoopErr2))) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
