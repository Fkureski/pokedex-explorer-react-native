import React, { createContext, useContext, useMemo, useState, PropsWithChildren, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FavoritesMap = Record<string, boolean>;
type Ctx = { isFav: (key: string) => boolean; toggleFav: (key: string) => void; all: string[] };

const STORAGE_KEY = '@pokedex_favorites:v1';
const FavoritesContext = createContext<Ctx | null>(null);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [fav, setFav] = useState<FavoritesMap>({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setFav(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fav)).catch(() => {});
  }, [fav]);

  const toggleFav = (key: string) => setFav(prev => ({ ...prev, [key]: !prev[key] }));
  const value = useMemo<Ctx>(
    () => ({ isFav: k => !!fav[k], toggleFav, all: Object.keys(fav).filter(k => fav[k]) }),
    [fav]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};
