import React, { createContext, useContext, useMemo, useState } from 'react';

type FavoritesMap = Record<string, boolean>;
type Ctx = { isFav: (key: string) => boolean; toggleFav: (key: string) => void; all: string[] };

const FavoritesContext = createContext<Ctx | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [fav, setFav] = useState<FavoritesMap>({});

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
