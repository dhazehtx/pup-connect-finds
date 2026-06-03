import {
  Baby,
  Brush,
  Car,
  Dna,
  Footprints,
  Globe,
  Home,
  Hotel,
  Scissors,
  Stethoscope,
  Target,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ServiceIconTone =
  | 'grooming'
  | 'walking'
  | 'sitting'
  | 'training'
  | 'boarding'
  | 'mobile_grooming'
  | 'transportation'
  | 'stud_services'
  | 'poop_scooping'
  | 'veterinary'
  | 'whelping'
  | 'default';

/** Lucide icon per service type — tones use CSS classes (not bg-orange/amber Tailwind) to avoid global yellow-purge overrides */
const SERVICE_ICON_MAP: Record<string, { Icon: LucideIcon; tone: ServiceIconTone }> = {
  grooming: { Icon: Scissors, tone: 'grooming' },
  walking: { Icon: Footprints, tone: 'walking' },
  sitting: { Icon: Home, tone: 'sitting' },
  training: { Icon: Target, tone: 'training' },
  boarding: { Icon: Hotel, tone: 'boarding' },
  mobile_grooming: { Icon: Car, tone: 'mobile_grooming' },
  transportation: { Icon: Truck, tone: 'transportation' },
  stud_services: { Icon: Dna, tone: 'stud_services' },
  poop_scooping: { Icon: Brush, tone: 'poop_scooping' },
  veterinary: { Icon: Stethoscope, tone: 'veterinary' },
  whelping: { Icon: Baby, tone: 'whelping' },
};

const DEFAULT_ICON = { Icon: Globe, tone: 'default' as const };

/** Normalize DB / demo variants to canonical service_type ids */
export function normalizeServiceType(type: string | null | undefined): string {
  const raw = (type || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (!raw) return '';
  if (raw === 'dog_training' || raw === 'trainer' || raw === 'dog_trainer') return 'training';
  if (raw === 'pet_sitting' || raw === 'dog_sitting' || raw === 'sitter') return 'sitting';
  if (raw === 'groomer' || raw === 'pet_grooming') return 'grooming';
  if (raw === 'dog_walking' || raw === 'walker') return 'walking';
  if (raw === 'mobile_groomer') return 'mobile_grooming';
  if (raw === 'transport' || raw === 'pet_transport') return 'transportation';
  if (raw === 'stud' || raw === 'stud_service') return 'stud_services';
  return raw;
}

type ServiceCategoryIconProps = {
  type: string | null | undefined;
  /** lg = 64px circle (marketplace cards); md = 48px */
  size?: 'md' | 'lg';
  className?: string;
};

export function ServiceCategoryIcon({
  type,
  size = 'lg',
  className,
}: ServiceCategoryIconProps) {
  const key = normalizeServiceType(type);
  const { Icon, tone } = SERVICE_ICON_MAP[key] ?? DEFAULT_ICON;
  const box = size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';
  const icon = size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';

  return (
    <div
      className={cn(
        'service-category-icon flex shrink-0 items-center justify-center rounded-full shadow-sm',
        `service-category-icon--${tone}`,
        box,
        className,
      )}
      aria-hidden
    >
      <Icon className={cn('service-category-icon__glyph', icon)} strokeWidth={2.25} aria-hidden />
    </div>
  );
}

export function getServiceIconConfig(type: string | null | undefined) {
  const key = normalizeServiceType(type);
  return SERVICE_ICON_MAP[key] ?? DEFAULT_ICON;
}
