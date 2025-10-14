import React from 'react';
import RootNavigation from './src/navigation';
import { FavoritesProvider } from './src/context/FavoritesContext';

export default function App() {
  return (
      <FavoritesProvider>
        <RootNavigation />
      </FavoritesProvider>
  );
}
