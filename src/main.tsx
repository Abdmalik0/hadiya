import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for stealth native PWA offline operation
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('HALABA City FC app update available. Applying update...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('HALABA City FC is cached and ready for offline stealth execution.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
