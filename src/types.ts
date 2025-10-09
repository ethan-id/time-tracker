export type EntryInput = {
  engagement: string;
  category: string;
  start: string; // either "HH:mm" (preferred) or "YYYY-MM-DDTHH:mm"
  end: string;   // either "HH:mm" (preferred) or "YYYY-MM-DDTHH:mm"
};

export type Entry = {
  id: number;
  engagement: string;
  category: string;
  startISO: string; // Date(start local).toISOString()
  endISO: string;   // Date(end local).toISOString()
  minutes: number;  // integer, floor seconds
  oit: number;      // one-decimal, half-up
};

export type NotesMap = Record<string, string>; // key = entry id as string

export type CategorySummary = {
  category: string;
  entries: Entry[];
  totalMinutes: number;
  totalOIT: number; // one-decimal at display
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


