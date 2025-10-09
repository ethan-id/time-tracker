import { Entry, EntryInput, NotesMap } from "@/types";
import { parseLocalDateTime, diffMinutesFloor, calcOIT, toISO, parseLocalTimeHM, rollEndIfBefore } from "@/lib/time";

export type State = {
  entries: Entry[];
  nextId: number;
  notes: NotesMap;
  error?: string;
};

export type Action =
  | { type: "ADD"; payload: EntryInput }
  | { type: "SET_NOTE"; payload: { entryId: number; note: string } }
  | { type: "CLEAR" }
  | { type: "DISMISS_ERROR" };

export const initialState: State = { entries: [], nextId: 1, notes: {} };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const { engagement: rawEng, category: rawCat, start, end } = action.payload;
      const engagement = (rawEng ?? "").trim();
      const category = (rawCat ?? "").trim();
      if (!engagement || !category || engagement.length > 100 || category.length > 100) {
        return { ...state, error: "Engagement and Category must be 1–100 characters." };
      }
      // Support either full datetime-local (legacy) or time-only HH:mm
      const startD = start.includes(":") && start.length <= 5 ? parseLocalTimeHM(start) : parseLocalDateTime(start);
      const rawEnd = end.includes(":") && end.length <= 5 ? parseLocalTimeHM(end) : parseLocalDateTime(end);
      const endD = startD && rawEnd ? rollEndIfBefore(startD, rawEnd) : rawEnd;
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
      const note = (action.payload.note ?? "").trim();
      if (note.length > 1000) return { ...state, error: "Note must be ≤ 1000 characters." };
      const notes = { ...state.notes };
      const key = String(action.payload.entryId);
      if (note.length === 0) delete notes[key];
      else notes[key] = note;
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


