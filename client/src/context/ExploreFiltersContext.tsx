import { createContext, useContext, useState } from 'react';

export type Filters = {
  breedId: number | null;
  color: string | null;
  gender: 'male' | 'female' | 'any';
  price: [number, number];
  location: { city: string; lat: number | null; lng: number | null; radiusKm: number };
  sort: 'newest' | 'price_low' | 'price_high' | 'featured';
  age: { minWeeks: number; maxWeeks: number };
  source: string | null;
  coatLength: string | null;
  training: string | null;
  energy: string | null;
  paperwork: string | null;
  toggles: {
    verified: boolean;
    availableNow: boolean;
    healthChecked: boolean;
    vaccinated: boolean;
    goodWithKids: boolean;
    goodWithPets: boolean;
    spayedNeutered: boolean;
  };
};

/** Default filter state — use for “Reset all filters” on Explore / listings. */
export const EXPLORE_DEFAULT_FILTERS: Filters = {
  breedId: null,
  color: null,
  gender: 'any',
  price: [0, 10000],
  location: { city: '', lat: null, lng: null, radiusKm: 999 },
  sort: 'newest',
  age: { minWeeks: 0, maxWeeks: 104 },
  source: null,
  coatLength: null,
  training: null,
  energy: null,
  paperwork: null,
  toggles: {
    verified: false,
    availableNow: false,
    healthChecked: false,
    vaccinated: false,
    goodWithKids: false,
    goodWithPets: false,
    spayedNeutered: false,
  },
};

const ExploreFiltersContext = createContext<{
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}>({ filters: EXPLORE_DEFAULT_FILTERS, setFilters: () => {} });

export const ExploreFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<Filters>(EXPLORE_DEFAULT_FILTERS);
  return (
    <ExploreFiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </ExploreFiltersContext.Provider>
  );
};

export const useExploreFilters = () => useContext(ExploreFiltersContext);