import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// TypeScript null-check or assertion for the root element
const rootElement = document.getElementById('root') as HTMLElement | null;

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element. App cannot render.');
}