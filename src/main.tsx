/**
 * STUDYPILOT BD - Frontend React Mounting Entrypoint
 * 
 * Purpose:
 * This is the ultimate entrypoint of our frontend React application.
 * It bootstraps the virtual DOM, hooks up the root 'App' component,
 * and mounts it securely into the HTML div containing the ID 'root'.
 * It also imports the global Tailwind stylesheet ('index.css').
 */

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
