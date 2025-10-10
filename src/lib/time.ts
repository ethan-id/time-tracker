export function parseLocalDateTime(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function diffMinutesFloor(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  if (ms <= 0) return 0;
  return Math.floor(ms / 60000);
}

export function roundHalfUp1(n: number): number {
  return Math.round(n * 10 + Number.EPSILON) / 10;
}

export function calcOIT(minutes: number): number {
  return roundHalfUp1(minutes / 60);
}

export function toISO(d: Date): string {
  return d.toISOString();
}

export function formatHM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

// Parse "HH:mm" as a Date anchored to today in local timezone
export function parseLocalTimeHM(s: string): Date | null {
  if (!s) return null;
  const parts = s.split(":");
  if (parts.length < 2) return null;
  const hh = Number(parts[0]);
  const mm = Number(parts[1]);
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
}

// If end is strictly before start, roll end to next day to support cross-midnight
export function rollEndIfBefore(start: Date, end: Date): Date {
  if (end.getTime() < start.getTime()) {
    const rolled = new Date(end.getTime());
    rolled.setDate(rolled.getDate() + 1);
    return rolled;
  }
  return end;
}

// Convert ISO string to HH:mm format (24-hour)
export function isoToHHMM(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours();
  const mm = d.getMinutes();
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}


