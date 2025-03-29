import React from 'react';
import ReactDOM from 'react-dom/client';
import BlockedPage from './components/FocusWarden/blocked-page';
import './index.css';
import './App.css';
import './components/FocusWarden/BlockedSite.css';

// Import Material Icons
const iconFont = document.createElement('link');
iconFont.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
iconFont.rel = 'stylesheet';
document.head.appendChild(iconFont);

// Render the blocked page component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BlockedPage />
  </React.StrictMode>
); 