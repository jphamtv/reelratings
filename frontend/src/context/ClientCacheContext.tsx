import { createContext, useState, useEffect } from 'react';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export interface ClientCacheContextType {
  getItem: <T>(key: string) => T | null;
  setItem: <T>(key: string, data: T) => void; 
}

export const ClientCacheContext = createContext<ClientCacheContextType | undefined>(undefined);

export const ClientCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<{ [key: string]: CacheItem<unknown> }>({});

  useEffect(() => {
    // Load cache from localStorage on mount
    const storedCache = localStorage.getItem('clientCache');
    if (storedCache) {
      setCache(JSON.parse(storedCache));
    }
  }, []);
  
  useEffect(() => { 
    // Save cache to localStorage whenever it changes
    localStorage.setItem('clientCache', JSON.stringify(cache));
  }, [cache]);

  const getItem = <T,>(key: string): T | null => {
    const item = cache[key] as CacheItem<T> | undefined;
    if (!item) return null;

    const now = Date.now();
    const expirationTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    if (now - item.timestamp > expirationTime) {
      // Remove expired item
      setCache(prevCache => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _removedItem, ...rest } = prevCache;
        return rest;
      });
      return null;
    }

    return item.data;
  };
  
  const setItem = <T,>(key: string, data: T) => {
    setCache(prevCache => ({
      ...prevCache,
      [key]: { data, timestamp: Date.now()}
    }));
  };
  
  return (
    <ClientCacheContext.Provider value={{ getItem, setItem}}>
      {children}
    </ClientCacheContext.Provider>
  );
};
