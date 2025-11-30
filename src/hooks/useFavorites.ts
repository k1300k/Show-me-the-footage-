import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CCTV } from '@/types';

interface FavoritesState {
  favorites: CCTV[];
  addFavorite: (cctv: CCTV) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (cctv) =>
        set((state) => ({
          favorites: [...state.favorites, cctv],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((item) => item.id !== id),
        })),
      isFavorite: (id) => get().favorites.some((item) => item.id === id),
    }),
    {
      name: 'cctv-favorites', // unique name for local storage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);


