interface StorageData {
  tasks?: any[];
  links?: any[];
  darkMode?: boolean;
}

class StorageWrapper {
  async get(keys: string[]): Promise<StorageData> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => {
          resolve(result as StorageData);
        });
      });
    } else {
      const result: StorageData = {};
      keys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value) {
          result[key as keyof StorageData] = JSON.parse(value);
        }
      });
      return result;
    }
  }

  async set(data: StorageData): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.set(data, resolve);
      });
    } else {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    }
  }
}

export const storage = new StorageWrapper();