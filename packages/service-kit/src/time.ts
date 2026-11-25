/** ISO 8601 with an explicit offset, matching the envelope contract. */
export function isoNow(): string {
  return new Date().toISOString().replace(/Z$/, '+00:00');
}
