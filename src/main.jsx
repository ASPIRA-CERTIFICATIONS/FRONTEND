import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@fontsource-variable/manrope';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/500.css';
import './styles/global.css';
import App from './App.jsx';

// After a new deploy, an old open tab may ask for files that no longer exist.
// Reload once to pick up the new version instead of showing an unstyled/blank page.
window.addEventListener('vite:preloadError', (e) => {
  const k = 'aspira-reloaded';
  if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, '1'); e.preventDefault(); window.location.reload(); }
});
window.addEventListener('load', () => setTimeout(() => sessionStorage.removeItem('aspira-reloaded'), 10000));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
