import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { APP_VERSION, getStoredVersion, saveVersion, clearStateAndReload } from './lib/version';

const storedVersion = getStoredVersion();

if (storedVersion !== null && storedVersion !== APP_VERSION) {
  // Existing install with an outdated version: wipe state and reload.
  // React is intentionally NOT mounted here — the reload happens in milliseconds.
  clearStateAndReload();
} else {
  // Fresh install (null) or version already matches: persist version and boot normally.
  saveVersion();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
