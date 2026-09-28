/**
 * Keep user-facing vehicle names stable even when an older API/static record
 * still contains the former VF 5 trim label.
 *
 * The catalog keeps `version: "Tiêu chuẩn"` for filtering and pricing. This
 * helper is deliberately display-only and only canonicalizes the VF 5 line.
 */
export function getVehicleDisplayName(name: string, code?: string): string {
  const identity = `${code || ''} ${name || ''}`;
  if (/\bvf\s*5\b/i.test(identity)) {
    return 'VinFast VF 5';
  }

  return name;
}
