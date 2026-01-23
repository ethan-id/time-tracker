import { Entry, NotesMap, Report } from "@/types";
import { roundHalfUp1 } from "./time";

export function buildReport(entries: Entry[], timezone: string, notes: NotesMap): Report {
  void notes; // reserved for future: notes are displayed per-entry, not used for aggregation

  function canonKey(s: string): string {
    return (s ?? "").trim().toLowerCase();
  }

  function preferDisplayName(prev: string, next: string): string {
    const p = (prev ?? "").trim();
    const n = (next ?? "").trim();
    if (!p) return n;
    if (!n) return p;
    // If the existing label is all-lowercase and the new label has any uppercase,
    // prefer the new one (e.g. "wellabe" -> "Wellabe").
    if (p === p.toLowerCase() && n !== n.toLowerCase()) return n;
    return p;
  }

  const byEng = new Map<string, { engagement: string; entries: Entry[] }>();
  for (const e of entries) {
    const key = canonKey(e.engagement);
    const existing = byEng.get(key);
    if (existing) {
      existing.entries.push(e);
      existing.engagement = preferDisplayName(existing.engagement, e.engagement);
    } else {
      byEng.set(key, { engagement: e.engagement, entries: [e] });
    }
  }

  const engagements = Array.from(byEng.entries()).map(([engagementKey, engGroup]) => {
    const byCat = new Map<string, { category: string; entries: Entry[] }>();
    for (const e of engGroup.entries) {
      const key = canonKey(e.category);
      const existing = byCat.get(key);
      if (existing) {
        existing.entries.push(e);
        existing.category = preferDisplayName(existing.category, e.category);
      } else {
        byCat.set(key, { category: e.category, entries: [e] });
      }
    }

    const categories = Array.from(byCat.entries()).map(([categoryKey, catGroup]) => {
      const totalMinutes = catGroup.entries.reduce((s, x) => s + x.minutes, 0);
      const totalOIT = roundHalfUp1(catGroup.entries.reduce((s, x) => s + x.oit, 0));
      return { categoryKey, category: catGroup.category, entries: catGroup.entries, totalMinutes, totalOIT };
    });

    const totalMinutes = engGroup.entries.reduce((s, x) => s + x.minutes, 0);
    const totalOIT = roundHalfUp1(engGroup.entries.reduce((s, x) => s + x.oit, 0));

    return {
      engagementKey,
      engagement: engGroup.engagement,
      categories,
      totals: { entries: engGroup.entries.length, minutes: totalMinutes, oit: totalOIT },
    };
  });

  const overallMinutes = entries.reduce((s, x) => s + x.minutes, 0);
  const overallOIT = roundHalfUp1(entries.reduce((s, x) => s + x.oit, 0));

  return { timezone, engagements, overall: { entries: entries.length, minutes: overallMinutes, oit: overallOIT } };
}


