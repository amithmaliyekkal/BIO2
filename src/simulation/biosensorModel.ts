export const MIN_CONCENTRATION = 0;
export const MAX_CONCENTRATION = 300;
export const DEFAULT_CONCENTRATION = 110;

export const MIN_SENSITIVITY = 0.05;
export const MAX_SENSITIVITY = 0.30;
export const SENSITIVITY_STEP = 0.01;
export const DEFAULT_SENSITIVITY = 0.20;

export const MIN_MAX_RANGE = 80;
export const MAX_MAX_RANGE = 300;
export const MAX_RANGE_STEP = 10;
export const DEFAULT_MAX_RANGE = 200;

export const FIXED_CHART_MAX_Y = 90;

export type OperatingRegime = 'baseline' | 'linear' | 'saturated';

export interface SamplePreset {
  id: string;
  label: string;
  concentration: number;
  note: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'blank',
    label: 'Blank Buffer (0)',
    concentration: 0,
    note: 'Zero-glucose control sample',
  },
  {
    id: 'low',
    label: 'Low Sample (80)',
    concentration: 80,
    note: 'Early linear response',
  },
  {
    id: 'mid',
    label: 'Mid Sample (140)',
    concentration: 140,
    note: 'Active linear range',
  },
  {
    id: 'saturated',
    label: 'High Test (260)',
    concentration: 260,
    note: 'Beyond linear limit (plateau)',
  },
];

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Educational glucose biosensor model:
 * Signal rises linearly with concentration (I = S * C) up to the maximum linear range R_max,
 * then levels off at I_max = S * R_max to represent enzyme/mediator saturation.
 */
export function calculateSimulatedSignal(
  concentration: number,
  sensitivity: number,
  maxRange: number
): number {
  const safeConcentration = clamp(concentration, MIN_CONCENTRATION, MAX_CONCENTRATION);
  const safeSensitivity = clamp(sensitivity, MIN_SENSITIVITY, MAX_SENSITIVITY);
  const safeMaxRange = clamp(maxRange, MIN_MAX_RANGE, MAX_MAX_RANGE);

  const effectiveConcentration = Math.min(safeConcentration, safeMaxRange);
  return safeSensitivity * effectiveConcentration;
}

export function getOperatingRegime(
  concentration: number,
  maxRange: number
): OperatingRegime {
  if (concentration <= 0) {
    return 'baseline';
  }
  if (concentration <= maxRange) {
    return 'linear';
  }
  return 'saturated';
}
