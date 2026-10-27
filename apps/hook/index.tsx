import { setStorageBackend } from '@plannotator/ui/utils/storage';
import { plannotatorGmailStorage } from '@plannotator/ui/utils/plannotatorGmailStorage';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@plannotator/editor';
import '@plannotator/editor/styles';

setStorageBackend(plannotatorGmailStorage);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);