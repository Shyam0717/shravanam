'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Lecture, FilterType } from '@/types/Lecture';
import { ChapterNavigation } from '@/components/ChapterNavigation';
import { LectureCard } from '@/components/LectureCard';
import { useUserStorage } from '@/lib/useUserStorage';

// Import static data
import bgLecturesRaw from '@/data/bg_lectures.json';

const bgLectures = (bgLecturesRaw as Lecture[]).map((l, i) => ({ ...l, id: i + 10000 })); // Offset to avoid potential conflict if IDs existed

export default function LectureListPage() {
  const { data, update } = useUserStorage();
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Read filter from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter') as FilterType;
    if (filter && ['all', 'listened', 'unlistened', 'bookmarked'].includes(filter)) {
      setFilterType(filter);
    }
  }, []);

  // Filter lectures
  const filteredLectures = bgLectures.filter(lecture => {
    // 1. Chapter filter
    if (selectedChapter && lecture.chapter !== selectedChapter) return false;

    // 2. Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchesTitle = lecture.title.toLowerCase().includes(query);
      const matchesVerse = lecture.verseRange?.toLowerCase().includes(query);
      const matchesLocation = lecture.location.toLowerCase().includes(query);
      if (!matchesTitle && !matchesVerse && !matchesLocation) return false;
    }

    // 3. Status filter
    if (filterType === 'listened' && !data.listenedLectures.includes(lecture.id)) return false;
    if (filterType === 'unlistened' && data.listenedLectures.includes(lecture.id)) return false;
    if (filterType === 'bookmarked' && !data.bookmarkedLectures.includes(lecture.id)) return false;

    return true;
  });

  // Toggle helpers
  const toggleListened = (id: number) => {
    update(prev => {
      const newListened = prev.listenedLectures.includes(id)
        ? prev.listenedLectures.filter(lid => lid !== id)
        : [...prev.listenedLectures, id];
      return { ...prev, listenedLectures: newListened };
    });
  };

  const toggleBookmarked = (id: number) => {
    update(prev => {
      const newBookmarked = prev.bookmarkedLectures.includes(id)
        ? prev.bookmarkedLectures.filter(bid => bid !== id)
        : [...prev.bookmarkedLectures, id];
      return { ...prev, bookmarkedLectures: newBookmarked };
    });
  };

  const saveNotes = (id: number, content: string) => {
    update(prev => ({
      ...prev,
      notes: { ...prev.notes, [id]: content }
    }));
  };

  // Group lectures by chapter for navigation
  const lecturesByChapter = bgLectures.reduce((acc: Record<number, Lecture[]>, lecture) => {
    const chapter = lecture.chapter;
    if (!acc[chapter]) {
      acc[chapter] = [];
    }
    acc[chapter].push(lecture);
    return acc;
  }, {});

  const chapters = Object.keys(lecturesByChapter)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Hidden on mobile unless menu open (handled by layout, but here we just hide on small screens) */}
      <div className="hidden lg:block w-80 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-sand-50/50 dark:bg-neutral-900/50 overflow-y-auto custom-scrollbar">
        <ChapterNavigation
          chapters={chapters}
          selectedChapter={selectedChapter}
          onChapterSelect={setSelectedChapter}
          lecturesByChapter={lecturesByChapter}
          listenedIds={data.listenedLectures}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-50/30 dark:bg-neutral-950/30">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          {/* Mobile Chapter Navigation */}
          <div className="lg:hidden mb-6">
            <select
              value={selectedChapter || ''}
              onChange={(e) => setSelectedChapter(e.target.value ? Number(e.target.value) : null)}
              className="w-full p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <option value="">All Chapters</option>
              {chapters.map(chapter => (
                <option key={chapter} value={chapter}>Chapter {chapter}</option>
              ))}
            </select>
          </div>

          {/* Header & Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="heading-1 text-2xl mb-1">
                  {selectedChapter ? `Chapter ${selectedChapter}` : 'All Lectures'}
                </h1>
                <p className="text-sm text-foreground-muted">
                  {filteredLectures.length} lectures found
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted group-focus-within:text-sage-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search lectures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 w-full md:w-64 transition-all"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-icon ${showFilters ? 'bg-sage-100 text-sage-700 dark:bg-sage-900 dark:text-sage-300' : ''}`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Chips */}
            {showFilters && (
              <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 animate-in slide-in-from-top-2">
                <div className="text-sm font-medium text-foreground mr-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by:
                </div>
                {(['all', 'listened', 'unlistened', 'bookmarked'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filterType === type
                      ? 'bg-sage-600 text-white shadow-md transform scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-foreground-muted hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lecture Grid */}
          {filteredLectures.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredLectures.map((lecture) => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  listened={data.listenedLectures.includes(lecture.id)}
                  bookmarked={data.bookmarkedLectures.includes(lecture.id)}
                  notes={data.notes[lecture.id] || ''}
                  onToggleListened={() => toggleListened(lecture.id)}
                  onToggleBookmarked={() => toggleBookmarked(lecture.id)}
                  onNotesSave={(content) => saveNotes(lecture.id, content)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No lectures found</h3>
              <p className="text-foreground-muted mt-1">
                Try adjusting your search or filters
              </p>
              {(searchTerm || filterType !== 'all' || selectedChapter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setSelectedChapter(null);
                  }}
                  className="btn-secondary mt-4"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}