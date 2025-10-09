# Minimal Time Tracking Tool — Full Spec (Next.js App Router, No Persistence)

## 0) Purpose & Scope

A single-page, single-session web UI to:

* Add time entries with **engagement**, **category**, **start time**, **end time**.
* Produce a **report** grouped by **engagement → category** with totals.
* Compute and display an **OIT number** (0.1 per 6 minutes) for entries, category totals, engagement totals, and overall totals.
* Allow a **note per (engagement, category)** that appears under that category in the report.
* **No persistence** of any kind (no DB, no file, no localStorage).

**Out of scope:** authentication, timers, edit history, import/export, multi-user, server routes, persistence of any form.

---

## 1) OIT Definition

* **Meaning:** 0.1 OIT per 6 minutes (i.e., 1.0 OIT per hour).
* **Formula (per entry):**
  `oit_entry = round_half_up(minutes / 60, 1)`
* **Rounding:** one decimal place, **half-up** (standard 0.5 rounds up).
* **Examples:**
  6m → 0.1, 12m → 0.2, 60m → 1.0, 3m → 0.05 → **0.1** (after one-decimal half-up).

---

## 2) Functional Requirements

### 2.1 Add Entry

**Inputs**

* `engagement` (string, required, 1–100 chars, trimmed)
* `category` (string, required, 1–100 chars, trimmed)
* `start_time` (HTML `datetime-local` string; local timezone)
* `end_time` (HTML `datetime-local` string; local timezone)

**Validation**

* `start_time` and `end_time` parse as valid local datetimes.
* `end_time > start_time`.
* **Duration minutes > 0** after flooring seconds.

**Processing**

* `minutes = floor((end - start)/60,000)`.
* `oit = round_half_up(minutes/60, 1)`.
* Store derived fields in memory.

### 2.2 Notes per (Engagement, Category)

* A single **plain-text note** associated to the exact string key pair `(engagement, category)`.
* Set/update via a small textarea under the category in the report.
* **Trim** on save; **max 1000 chars**; empty string deletes the note.
* Notes only exist for categories that appear in the current report (i.e., at least one entry in that group).

### 2.3 View Entries

* Show a session list/table of entries in insertion order with computed **minutes** and **oit**.

### 2.4 Generate Report

* Group entries by **engagement**, then by **category**.
* For each category:

  * `entries_count`
  * `total_minutes` (sum of entry minutes)
  * `total_oit` (sum of entry OIT, then shown as one decimal with half-up at display)
  * **note** (if present)
* For each engagement:

  * Engagement totals: entries, minutes, OIT.
* Overall totals: entries, minutes, OIT.
* Display timezone label (browser local).

### 2.5 Clear Session

* “Clear All” removes **entries and notes** from memory.

---

## 3) Non-Functional Requirements

* **No persistence** (refresh loses data).
* **Single timezone:** use browser local for parsing and display; convert stored datetimes to ISO only for consistency.
* **Deterministic rounding:** all OIT display is one decimal, half-up.
* **Performance target:** small session (tens–low hundreds of entries).
* **Accessibility:** keyboard operable form; labels for inputs; error text announced in-page.

---

## 4) Data Model (TypeScript)

```ts
// types.ts
export type EntryInput = {
  engagement: string;     // trimmed, 1–100
  category: string;       // trimmed, 1–100
  start: string;          // "YYYY-MM-DDTHH:mm" from <input type="datetime-local">
  end: string;            // same format
};

export type Entry = {
  id: number;
  engagement: string;
  category: string;
  startISO: string;       // Date(start local).toISOString()
  endISO: string;         // Date(end local).toISOString()
  minutes: number;        // integer, floor seconds
  oit: number;            // one-decimal, half-up
};

export type NotesMap = Record<string, string>; // key = `${engagement}|||${category}`

export type CategorySummary = {
  category: string;
  entries: number;
  totalMinutes: number;
  totalOIT: number;       // one-decimal at display
  note?: string;
};

export type EngagementSummary = {
  engagement: string;
  categories: CategorySummary[];
  totals: {
    entries: number;
    minutes: number;
    oit: number;
  };
};

export type Report = {
  timezone: string;
  engagements: EngagementSummary[];
  overall: {
    entries: number;
    minutes: number;
    oit: number;
  };
};
```

---

## 5) Algorithms & Utilities

```ts
// lib/time.ts
export function parseLocalDateTime(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);                 // interpreted as local time by browser
  return isNaN(d.getTime()) ? null : d;
}

export function diffMinutesFloor(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  if (ms <= 0) return 0;
  return Math.floor(ms / 60000);
}

export function roundHalfUp1(n: number): number {
  // one decimal half-up
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
```

```ts
// lib/report.ts
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
```

---

## 6) State Management (Client-Only)

```ts
// state.ts
import { Entry, EntryInput, NotesMap } from "@/types";
import { parseLocalDateTime, diffMinutesFloor, calcOIT, toISO } from "@/lib/time";

export type State = {
  entries: Entry[];
  nextId: number;
  notes: NotesMap;
  error?: string;
};

export type Action =
  | { type: "ADD"; payload: EntryInput }
  | { type: "SET_NOTE"; payload: { engagement: string; category: string; note: string } }
  | { type: "CLEAR" }
  | { type: "DISMISS_ERROR" };

export const initialState: State = { entries: [], nextId: 1, notes: {} };

const keyOf = (e: string, c: string) => `${e}|||${c}`;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const { engagement: rawEng, category: rawCat, start, end } = action.payload;
      const engagement = (rawEng ?? "").trim();
      const category = (rawCat ?? "").trim();
      if (!engagement || !category || engagement.length > 100 || category.length > 100) {
        return { ...state, error: "Engagement and Category must be 1–100 characters." };
      }
      const startD = parseLocalDateTime(start);
      const endD = parseLocalDateTime(end);
      if (!startD || !endD) return { ...state, error: "Invalid start/end date-times." };
      const minutes = diffMinutesFloor(startD, endD);
      if (minutes <= 0) return { ...state, error: "End time must be after start time." };

      const entry: Entry = {
        id: state.nextId,
        engagement,
        category,
        startISO: toISO(startD),
        endISO: toISO(endD),
        minutes,
        oit: calcOIT(minutes),
      };
      return { ...state, entries: [...state.entries, entry], nextId: state.nextId + 1 };
    }
    case "SET_NOTE": {
      const engagement = (action.payload.engagement ?? "").trim();
      const category = (action.payload.category ?? "").trim();
      if (!engagement || !category) return { ...state, error: "Engagement and Category are required for notes." };
      const note = (action.payload.note ?? "").trim();
      if (note.length > 1000) return { ...state, error: "Note must be ≤ 1000 characters." };
      const k = keyOf(engagement, category);
      const notes = { ...state.notes };
      if (note.length === 0) delete notes[k];
      else notes[k] = note;
      return { ...state, notes };
    }
    case "CLEAR":
      return { entries: [], nextId: 1, notes: {} };
    case "DISMISS_ERROR":
      return { ...state, error: undefined };
    default:
      return state;
  }
}
```

---

## 7) UI Spec (Single Page)

### 7.1 Page Structure

* **Header:** “Time Tracker (Session Only)”
* **Error Banner:** Inline dismissible alert when `state.error` exists.
* **Entry Form:**

  * Inputs: Engagement (text), Category (text), Start (datetime-local), End (datetime-local).
  * Submit → dispatch `ADD`.
  * Trim text; leave inputs filled after submission (optional reset UX).
* **Entries Table:**

  * Columns: ID, Engagement, Category, Start (local), End (local), Minutes, OIT.
  * Read-only; (optional) add a row “X entries”.
* **Controls:**

  * Button “Clear All” → dispatch `CLEAR`.
* **Report Section:**

  * “Timezone: <browser TZ>”
  * For each **ENGAGEMENT**:

    * List each **Category** with: `Entries`, `Total Minutes` + `HH:MM`, `OIT` (one decimal).
    * **Note editor** under the category:

      * `textarea` (2–4 rows), value bound to `notes[key]`.
      * `onBlur` or “Save Note” button → dispatch `SET_NOTE`.
      * Char counter `n / 1000`.
    * If a note exists, display: `Note: <text>` (plain text).
    * Engagement Totals line: entries, minutes + `HH:MM`, OIT.
  * **Overall Totals** box.

**Display Rules**

* All OIT values shown with `toFixed(1)`.
* Times shown in user’s local timezone (use `new Date(iso).toLocaleString()` for readouts).
* Notes are **plain text**; no markdown/HTML rendering.

### 7.2 Accessibility

* `<label>` for each input.
* Error region has `role="alert"`.
* Buttons have discernible text; focus states visible.

---

## 8) Edge Cases & Rules

* Cross-midnight entries allowed if `end > start`.
* Seconds ignored (floored before minute diff).
* If two categories differ by case/spacing, they’re treated as distinct (only trimming applied).
* Notes tied to exact `(engagement, category)` strings.
* No delete/edit entry controls (not required); if needed later, still session-only.

---

## 9) Acceptance Criteria

1. **Add Entry**

   * Valid input produces an entry with correct `minutes` and `oit`.
   * Examples to verify: 6m→0.1, 12m→0.2, 60m→1.0, 3m→0.1 (due to half-up on 0.05).
2. **Validation**

   * Invalid datetime or `end ≤ start` shows an inline error; no entry added.
   * Overlong `engagement`/`category` rejected ( >100 chars ).
3. **Report**

   * Groups by engagement → category; category totals equal sum of member entries.
   * Engagement totals equal sum of its categories.
   * Overall totals equal sum of all entries.
4. **OIT Display**

   * All OIT numbers shown to one decimal; half-up rounding used for sums and entries.
5. **Notes**

   * Adding/editing a note for an existing category updates the report.
   * Emptying a note removes it from report and state.
   * Clear All removes **entries and notes**.
6. **No Persistence**

   * Reloading the page clears all data.

---

## 10) Directory Layout (suggested)

```
app/
  page.tsx
lib/
  report.ts
  time.ts
state.ts
types.ts
styles/ (optional)
```

---

## 11) UI Copy (reference)

* Error messages:

  * “Engagement and Category must be 1–100 characters.”
  * “Invalid start/end date-times.”
  * “End time must be after start time.”
  * “Note must be ≤ 1000 characters.”
* Labels:

  * Engagement, Category, Start, End, Add Entry, Clear All, Save Note.

---

## 12) Test Matrix (Manual)

| Case             | Input                       | Expected                                                       |
| ---------------- | --------------------------- | -------------------------------------------------------------- |
| Exact 6 minutes  | 09:00 → 09:06               | minutes=6, oit=0.1                                             |
| 3 minutes        | 09:00 → 09:03               | minutes=3, oit=0.1                                             |
| 59m59s (floored) | 09:00 → 09:59:59            | minutes=59, oit=1.0 (59/60=0.983… → 1.0 after one-dec half-up) |
| Cross-midnight   | 23:50 → 00:10               | minutes=20, oit=0.3                                            |
| Invalid times    | 10:00 → 10:00               | error, no entry                                                |
| Overlong fields  | engagement=101 chars        | error                                                          |
| Notes            | “Research” note of 20 chars | appears under that category; counter updates                   |
| Clear All        | click                       | entries=[], notes={}                                           |

*(Note: For 59 minutes, `59/60 = 0.9833…` → rounds to **1.0** at one decimal; this matches half-up.)*

---

## 13) Minimal Styling (if Tailwind)

* Page container: `mx-auto max-w-3xl p-4 space-y-6`
* Panels: `border rounded p-3`
* Buttons: `px-3 py-1 rounded border`
* Inputs: `border rounded p-2`
* Note textarea: `w-full border rounded p-2 text-sm`

---

## 14) Security & Privacy

* Pure client; no network calls.
* No storage; nothing retained after reload.
* User content stays in memory only.

---

## 15) Future-Safe Decisions (without adding features)

* Clean separation of **types**, **state**, **lib** utilities, and **UI** to allow later persistence or server routes **without** changing business logic.
* All rounding and grouping centralized in `lib/`.