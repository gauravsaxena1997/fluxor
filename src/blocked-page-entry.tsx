import React from 'react';
import { createRoot } from 'react-dom/client';
import { BlockedPage } from './components/FocusWarden/blocked-page';
import './components/FocusWarden/BlockedSite.css';

// Get URL parameters
const params = new URLSearchParams(window.location.search);
const url = params.get('url') || '';
const type = params.get('type') || 'permanent';
const timeLimit = params.get('timeLimit') ? parseInt(params.get('timeLimit') || '0') : undefined;
const createdAt = params.get('createdAt') ? parseInt(params.get('createdAt') || '0') : Date.now();

// Create a blocked site object from URL parameters
const site = {
  id: 'blocked',
  url: url,
  type: type as 'permanent' | 'timeLimit',
  timeLimit: timeLimit,
  createdAt: createdAt
};

// Render the blocked page component
const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BlockedPage site={site} />
  </React.StrictMode>
); 