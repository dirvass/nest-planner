/** Shared availability store backed by localStorage.
 *  Used by BookingPage (read) and AdminPage (read/write). */

export type VillaKey = "ALYA" | "ZEHRA";
export type BookedRange = { from: string; to: string }; // ISO date strings

const STORAGE_KEY = "verde-booked";

const DEFAULTS: Record<VillaKey, BookedRange[]> = {
  ALYA: [
    { from: `${new Date().getFullYear()}-07-12`, to: `${new Date().getFullYear()}-07-18` },
    { from: `${new Date().getFullYear()}-08-03`, to: `${new Date().getFullYear()}-08-07` },
  ],
  ZEHRA: [
    { from: `${new Date().getFullYear()}-08-14`, to: `${new Date().getFullYear()}-08-21` },
  ],
};

export function getBooked(): Record<VillaKey, BookedRange[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULTS;
}

export function setBooked(data: Record<VillaKey, BookedRange[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Convert stored ISO strings to Date objects for DayPicker */
export function toDateRanges(ranges: BookedRange[]): { from: Date; to: Date }[] {
  return ranges.map(r => ({ from: new Date(r.from), to: new Date(r.to) }));
}
