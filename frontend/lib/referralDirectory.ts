import type { NearbyOptionPayload } from '../types/consultation';

type ReferralDirectoryEntry = NearbyOptionPayload & {
  postcodeAreas: string[];
};

const REFERRAL_DIRECTORY: ReferralDirectoryEntry[] = [
  {
    type: 'pharmacy',
    name: 'High Street Pharmacy',
    distanceKm: 0.7,
    address: '12 High Street',
    phone: '0207 123 4561',
    openNow: true,
    postcodeAreas: ['SW1', 'SW3', 'W1'],
  },
  {
    type: 'pharmacy',
    name: 'Riverside Chemist',
    distanceKm: 1.4,
    address: '44 Riverside Road',
    phone: '0207 123 4562',
    openNow: false,
    postcodeAreas: ['SE1', 'SE11', 'SW8'],
  },
  {
    type: 'gp',
    name: 'Central GP Practice',
    distanceKm: 1.1,
    address: '9 Market Lane',
    phone: '0207 123 4570',
    openNow: true,
    postcodeAreas: ['SW1', 'WC2', 'EC1'],
  },
  {
    type: 'gp',
    name: 'Elm Family Surgery',
    distanceKm: 2.5,
    address: '88 Elm Avenue',
    phone: '0207 123 4571',
    openNow: false,
    postcodeAreas: ['N1', 'N7', 'NW1'],
  },
  {
    type: 'urgent_care',
    name: 'City Urgent Treatment Centre',
    distanceKm: 3.2,
    address: '1 Health Park',
    phone: '0207 123 4580',
    openNow: true,
    postcodeAreas: ['SW1', 'SE1', 'N1', 'W1'],
  },
  {
    type: 'hospital',
    name: 'St Mary Hospital Emergency Department',
    distanceKm: 4.8,
    address: '200 Mary Street',
    phone: '0207 123 4590',
    openNow: true,
    postcodeAreas: ['W2', 'W1', 'NW1', 'SW1'],
  },
  {
    type: 'emergency_999',
    name: 'Emergency Ambulance Service',
    distanceKm: 0,
    address: 'Emergency response',
    phone: '999',
    openNow: true,
    postcodeAreas: ['ALL'],
  },
];

function optionPriorityForOutcome(
  option: NearbyOptionPayload,
  outcome: string,
): number {
  if (outcome === 'pharmacy') {
    if (option.type === 'pharmacy') return 0;
    if (option.type === 'gp') return 1;
    if (option.type === 'urgent_care') return 2;
  }
  if (outcome === 'gp') {
    if (option.type === 'gp') return 0;
    if (option.type === 'pharmacy') return 1;
    if (option.type === 'urgent_care') return 2;
  }
  if (outcome === 'urgent_care') {
    if (option.type === 'urgent_care') return 0;
    if (option.type === 'hospital') return 1;
    if (option.type === 'gp') return 2;
  }
  if (outcome === 'emergency_999') {
    if (option.type === 'emergency_999') return 0;
    if (option.type === 'hospital') return 1;
    if (option.type === 'urgent_care') return 2;
  }
  if (outcome === 'self_care') {
    if (option.type === 'pharmacy') return 0;
    if (option.type === 'gp') return 1;
  }
  return 9;
}

function normalizePostcodeArea(postcode?: string): string {
  if (!postcode) return '';
  return postcode.trim().toUpperCase().replace(/\s+/g, '');
}

export function getNearbyOptionsForOutcome(
  outcome: string,
  postcode?: string,
  limit = 5,
): NearbyOptionPayload[] {
  const area = normalizePostcodeArea(postcode);
  const postcodeFiltered = area
    ? REFERRAL_DIRECTORY.filter((option) =>
        option.postcodeAreas.includes('ALL') ||
        option.postcodeAreas.some((prefix) => area.startsWith(prefix)),
      )
    : REFERRAL_DIRECTORY;

  return [...postcodeFiltered]
    .sort((a, b) => {
      const pa = optionPriorityForOutcome(a, outcome);
      const pb = optionPriorityForOutcome(b, outcome);
      if (pa === pb) return a.distanceKm - b.distanceKm;
      return pa - pb;
    })
    .slice(0, limit)
    .map(({ postcodeAreas: _ignored, ...option }) => option);
}
