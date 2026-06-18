const PREFIX = 'sentiment_monitor_';

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('Storage load failed:', e);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (e) {
    console.warn('Storage remove failed:', e);
  }
}
