// Entry point
import { createRoot } from 'react-dom/client'
import { applySavedTheme } from './components/themes/ThemePicker'
import App from './App.tsx'
import './index.css'

applySavedTheme();
createRoot(document.getElementById("root")!).render(<App />);

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed silently
    });
  });
}
