export const TAGS = ['Work', 'Family', 'College', 'Friend', 'Casual'] as const;
export type Tag = (typeof TAGS)[number];

export const PLANT_TYPES = ['vine', 'orchid', 'fern', 'sunflower', 'succulent'] as const;
export type PlantType = (typeof PLANT_TYPES)[number];

export const CADENCE_OPTIONS = [
  { label: 'Biweekly', days: 14 },
  { label: 'Monthly', days: 30 },
  { label: 'Quarterly', days: 90 },
  { label: 'Yearly', days: 365 },
] as const;
export type CadenceDays = (typeof CADENCE_OPTIONS)[number]['days'];

export const CHANNELS = ['call', 'sms', 'whatsapp', 'email', 'in_person', 'other'] as const;
export type Channel = (typeof CHANNELS)[number];

export const DIRECTIONS = ['outbound', 'inbound', 'mutual'] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const TAG_TO_PLANT_TYPE_DEFAULT: Record<Tag, PlantType> = {
  Work: 'vine',
  Family: 'orchid',
  College: 'fern',
  Friend: 'sunflower',
  Casual: 'succulent',
};

export const PLANT_TYPE_EMOJI: Record<PlantType, string> = {
  vine: '🌿',
  orchid: '🌺',
  fern: '🌾',
  sunflower: '🌻',
  succulent: '🪴',
};
