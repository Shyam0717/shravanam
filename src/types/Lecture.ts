// BG Lecture type (Bhagavad Gita)
export interface Lecture {
  id: number;
  chapter: number;
  verseRange: string;
  location: string;
  date: string;
  title: string;
  filename: string;
  audioUrl: string;
  listened: boolean;
  bookmarked: boolean;
  notes: string;
  summary: string;
}

// SB Lecture type (Srimad Bhagavatam)
export interface SBLecture {
  id: number;
  canto: number;
  chapter: number;
  verse: string;
  location: string;
  date: string;
  title: string;
  filename: string;
  audioUrl: string;
  listened: boolean;
  bookmarked: boolean;
  notes: string;
  summary: string;
}

// NOD Lecture type (Nectar of Devotion)
export interface NODLecture {
  id: number;
  chapter: number | null;
  location: string;
  date: string;
  title: string;
  filename: string;
  audioUrl: string;
  listened: boolean;
  bookmarked: boolean;
  notes: string;
  summary: string;
}

export interface LectureStats {
  total: number;
  listened: number;
  bookmarked: number;
}

export type FilterType = 'all' | 'listened' | 'unlistened' | 'bookmarked';

// Union type for any lecture
export type AnyLecture = Lecture | SBLecture | NODLecture;
