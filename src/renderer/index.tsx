// Basic console log to verify renderer is loading
console.log('🚀 Renderer process starting...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ipcService } from './services/ipcService';
import { errorService } from './services/ErrorService';

// Test IPC bridge
if (window.electron?.ipcRenderer) {
  console.log('[Renderer] ✅ IPC bridge available');
  window.electron.ipcRenderer.send('test-ipc', 'Testing IPC connection');
} else {
  console.error('[Renderer] ❌ IPC bridge not available');
}

// Initialize services
console.log('[Renderer] Initializing services');
ipcService; // This will trigger the singleton initialization
errorService; // This will trigger the singleton initialization

console.log('[Renderer] Creating root element');
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
