import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ode.tsx';
import './src/index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
