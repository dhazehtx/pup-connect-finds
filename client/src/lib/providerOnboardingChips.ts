import type { ServiceCategoryId } from '@shared/serviceCategories';

/** Quick-pick rate amounts (USD) — still editable in the number field */
export function pricePresetsForService(id: ServiceCategoryId): string[] {
  if (id === 'stud_services') return ['500', '750', '1000', '1500', '2500'];
  if (id === 'transportation') return ['49', '75', '125', '199', '299', '399'];
  if (id === 'boarding') return ['35', '45', '55', '75', '95'];
  // Hourly-style services
  return ['20', '25', '30', '35', '45', '55'];
}

export const AVAILABILITY_SUGGESTIONS = [
  'Weekdays 9am–5pm',
  'Weekends',
  'Evenings only',
  'Flexible — ask me',
  'By appointment only',
];

/** Service area / location (non-boarding fields) */
export const LOCATION_SUGGESTIONS = [
  'Greater metro area',
  'Within 25 miles',
  'I travel to clients',
  'Downtown & nearby suburbs',
];

export const BOARDING_CAPACITY_SUGGESTIONS = ['1–3 dogs', '4–6 dogs', '7–10 dogs', '10+ dogs'];

export const VEHICLE_TYPE_SUGGESTIONS = [
  'SUV',
  'Minivan',
  'Sedan + crate',
  'Climate-controlled van',
  'Pickup truck + crate',
];

/** Stored as `max_distance` text — matches server validation */
export const MAX_DISTANCE_PRESETS = [
  'Within 10 miles',
  'Within 25 miles',
  'Metro area (~50 miles)',
  'Up to 100 miles',
  'Up to 250 miles',
  '500+ miles / long haul',
  'Cross-state',
] as const;

export const CUSTOM_MAX_DISTANCE = '__custom__';

export function isMaxDistancePreset(value: string): boolean {
  return (MAX_DISTANCE_PRESETS as readonly string[]).includes(value);
}

export const DRIVER_LICENSE_SUGGESTIONS = [
  'Valid state license — ID on request',
  'CDL where required',
  'Will verify at pickup',
];

export const STUD_BREED_SUGGESTIONS = [
  'Golden Retriever',
  'Labrador Retriever',
  'German Shepherd',
  'French Bulldog',
];

/** Optional one-tap starters for bio (user can edit) */
export const BIO_SNIPPETS = [
  'Experienced, insured, and happy to share references.',
  'Flexible scheduling with clear communication and photo updates.',
  'Years of hands-on experience with dogs of all sizes and temperaments.',
];
