// Bump this manually before each deploy that has breaking state changes.
// Mismatch between this and the stored value clears all state and reloads.
export const APP_VERSION = '1.1.0';

const VERSION_KEY = 'markflow_version';

export function getStoredVersion(): string | null {
  return localStorage.getItem(VERSION_KEY);
}

export function saveVersion(): void {
  localStorage.setItem(VERSION_KEY, APP_VERSION);
}

export async function clearStateAndReload(): Promise<void> {
  // Clear Zustand persisted store
  localStorage.removeItem('markflow_app');
  // Clear legacy keys (pre-Zustand migration)
  localStorage.removeItem('markflow_notes');
  localStorage.removeItem('markflow_theme');
  // Clear version so next load treats it as a fresh install
  localStorage.removeItem(VERSION_KEY);

  // Clear IndexedDB folder handle
  try {
    const { del } = await import('idb-keyval');
    await del('markflow_folder_handle');
  } catch {
    // ignore — idb may not have an entry
  }

  window.location.reload();
}
