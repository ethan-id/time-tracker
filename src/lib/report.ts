import { Entry, NotesMap, Report } from "@/types";
import { roundHalfUp1 } from "./time";

export function buildReport(entries: Entry[], timezone: string, notes: NotesMap): Report {
  const byEng = new Map<string, Entry[]>();
  for (const e of entries) {
    const arr = byEng.get(e.engagement) ?? [];
    arr.push(e);
    byEng.set(e.engagement, arr);
  }

  const engagements = Array.from(byEng.entries()).map(([engagement, engEntries]) => {
    const byCat = new Map<string, Entry[]>();
    for (const e of engEntries) {
      const arr = byCat.get(e.category) ?? [];
      arr.push(e);
      byCat.set(e.category, arr);
    }

    const categories = Array.from(byCat.entries()).map(([category, catEntries]) => {
      const totalMinutes = catEntries.reduce((s, x) => s + x.minutes, 0);
      const totalOIT = roundHalfUp1(catEntries.reduce((s, x) => s + x.oit, 0));
      const note = notes[`${engagement}|||${category}`];
      return { category, entries: catEntries.length, totalMinutes, totalOIT, note };
    });

    const totalMinutes = engEntries.reduce((s, x) => s + x.minutes, 0);
    const totalOIT = roundHalfUp1(engEntries.reduce((s, x) => s + x.oit, 0));

    return { engagement, categories, totals: { entries: engEntries.length, minutes: totalMinutes, oit: totalOIT } };
  });

  const overallMinutes = entries.reduce((s, x) => s + x.minutes, 0);
  const overallOIT = roundHalfUp1(entries.reduce((s, x) => s + x.oit, 0));

  return { timezone, engagements, overall: { entries: entries.length, minutes: overallMinutes, oit: overallOIT } };
}


