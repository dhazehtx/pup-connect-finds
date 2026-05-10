import type { Filters } from '@/context/ExploreFiltersContext';
import { EXPLORE_DEFAULT_FILTERS } from '@/context/ExploreFiltersContext';

const PARAM_KEYS = {
  breedId: 'breed',
  color: 'color',
  gender: 'gender',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  sort: 'sort',
  city: 'city',
  minAge: 'minAge',
  maxAge: 'maxAge',
  verified: 'verified',
  vaccinated: 'vax',
  goodWithKids: 'kids',
  spayedNeutered: 'neutered',
} as const;

export function filtersToSearchParams(filters: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.breedId != null) p.set(PARAM_KEYS.breedId, String(filters.breedId));
  if (filters.color) p.set(PARAM_KEYS.color, filters.color);
  if (filters.gender !== 'any') p.set(PARAM_KEYS.gender, filters.gender);
  if (filters.price[0] > 0) p.set(PARAM_KEYS.minPrice, String(filters.price[0]));
  if (filters.price[1] < 10000) p.set(PARAM_KEYS.maxPrice, String(filters.price[1]));
  if (filters.sort !== 'newest') p.set(PARAM_KEYS.sort, filters.sort);
  if (filters.location?.city) p.set(PARAM_KEYS.city, filters.location.city);
  if (filters.age.minWeeks > 0) p.set(PARAM_KEYS.minAge, String(filters.age.minWeeks));
  if (filters.age.maxWeeks < 104) p.set(PARAM_KEYS.maxAge, String(filters.age.maxWeeks));
  if (filters.toggles.verified) p.set(PARAM_KEYS.verified, '1');
  if (filters.toggles.vaccinated) p.set(PARAM_KEYS.vaccinated, '1');
  if (filters.toggles.goodWithKids) p.set(PARAM_KEYS.goodWithKids, '1');
  if (filters.toggles.spayedNeutered) p.set(PARAM_KEYS.spayedNeutered, '1');
  return p;
}

export function searchParamsToFilters(params: URLSearchParams): Partial<Filters> {
  const f: Partial<Filters> = {};
  const breed = params.get(PARAM_KEYS.breedId);
  if (breed) {
    const n = parseInt(breed, 10);
    if (!isNaN(n)) f.breedId = n;
  }
  const color = params.get(PARAM_KEYS.color);
  if (color) f.color = color;
  const gender = params.get(PARAM_KEYS.gender);
  if (gender === 'male' || gender === 'female') f.gender = gender;
  const minPrice = params.get(PARAM_KEYS.minPrice);
  const maxPrice = params.get(PARAM_KEYS.maxPrice);
  const minP = minPrice ? parseInt(minPrice, 10) : NaN;
  const maxP = maxPrice ? parseInt(maxPrice, 10) : NaN;
  if (!isNaN(minP) || !isNaN(maxP)) {
    f.price = [!isNaN(minP) ? minP : 0, !isNaN(maxP) ? maxP : 10000];
  }
  const sort = params.get(PARAM_KEYS.sort);
  if (sort && ['newest', 'price_low', 'price_high', 'featured'].includes(sort)) f.sort = sort as Filters['sort'];
  const city = params.get(PARAM_KEYS.city);
  if (city) f.location = { ...EXPLORE_DEFAULT_FILTERS.location, city };
  const minAge = params.get(PARAM_KEYS.minAge);
  if (minAge) {
    const n = parseInt(minAge, 10);
    if (!isNaN(n)) f.age = { ...EXPLORE_DEFAULT_FILTERS.age, minWeeks: n };
  }
  const maxAge = params.get(PARAM_KEYS.maxAge);
  if (maxAge) {
    const n = parseInt(maxAge, 10);
    if (!isNaN(n)) f.age = { ...(f.age ?? EXPLORE_DEFAULT_FILTERS.age), maxWeeks: n };
  }
  const toggles = { ...EXPLORE_DEFAULT_FILTERS.toggles };
  if (params.get(PARAM_KEYS.verified) === '1') toggles.verified = true;
  if (params.get(PARAM_KEYS.vaccinated) === '1') toggles.vaccinated = true;
  if (params.get(PARAM_KEYS.goodWithKids) === '1') toggles.goodWithKids = true;
  if (params.get(PARAM_KEYS.spayedNeutered) === '1') toggles.spayedNeutered = true;
  f.toggles = toggles;
  return f;
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.breedId != null ||
    (filters.color ?? '') !== '' ||
    filters.gender !== 'any' ||
    filters.price[0] > 0 ||
    filters.price[1] < 10000 ||
    filters.sort !== 'newest' ||
    (filters.location?.city ?? '') !== '' ||
    filters.age.minWeeks > 0 ||
    filters.age.maxWeeks < 104 ||
    Object.values(filters.toggles).some(Boolean)
  );
}
