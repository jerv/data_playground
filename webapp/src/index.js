import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Log environment variables for debugging
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL (process.env):', process.env.REACT_APP_API_URL);
console.log('REACT_APP_API_URL (window.env):', window.env?.REACT_APP_API_URL);
console.log('Public URL:', process.env.PUBLIC_URL);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 