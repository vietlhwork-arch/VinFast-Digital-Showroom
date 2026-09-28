import type { Vehicle } from '@/types';

/** Vehicles are comparable when they belong to the same broad product type. */
export function isMotorbikeVehicle(vehicle: Vehicle | undefined): boolean {
  return vehicle?.category === 'motorbike' || vehicle?.category === 'scooter';
}

export function isSameComparisonCategory(
  first: Vehicle | undefined,
  second: Vehicle | undefined,
): boolean {
  if (!first || !second) return true;
  return isMotorbikeVehicle(first) === isMotorbikeVehicle(second);
}
