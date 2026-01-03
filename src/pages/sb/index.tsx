'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, BookOpen } from 'lucide-react';
import { SBLecture, FilterType } from '@/types/Lecture';
import { LectureCard } from '@/components/LectureCard';
import { useUserStorage } from '@/lib/useUserStorage';

// Import static data
import sbLecturesRaw from '@/data/sb_lectures.json';

const sbLectures = (sbLecturesRaw as SBLecture[]).map((l, i) => ({ ...l, id: i + 20000 })); // Offset 20000

// Canto Navigation Component
function CantoNavigation({
    cantos,
    selectedCanto,
    onCantoSelect,
    lecturesByCanto,
    listenedIds
}: {
    cantos: number[];
    selectedCanto: number | null;
    onCantoSelect: (canto: number | null) => void;
    lecturesByCanto: Record<number, SBLecture[]>;
    listenedIds: number[];
}) {
    const totalLectures = Object.values(lecturesByCanto).reduce((sum, lectures) => sum + lectures.length, 0);

    return (
        <div className="glass-card p-5 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-lotus-100 dark:bg-lotus-900 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-lotus-600 dark:text-lotus-400" />
                </div>
                <div>
                    <h2 className="font-semibold text-foreground">Cantos</h2>
                    <p className="text-xs text-foreground-muted">{totalLectures} lectures</p>
                </div>
            </div>

            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                <button
                    onClick={() => onCantoSelect(null)}
                    className={`chapter-item ${selectedCanto === null ? 'active' : ''}`}
                >
                    <span>All Cantos</span>
                    <span className="badge text-xs">{totalLectures}</span>
                </button>

                {cantos.map(canto => {
                    const lectures = lecturesByCanto[canto] || [];
                    const listenedCount = lectures.filter(l => listenedIds.includes(l.id)).length;

                    return (
                        <button
                            key={canto}
                            onClick={() => onCantoSelect(canto)}
                            className={`chapter-item ${selectedCanto === canto ? 'active' : ''}`}
                        >
                            <span>Canto {canto}</span>
                            <div className="flex items-center gap-2">
                                {listenedCount > 0 && (
                                    <span className="text-[10px] text-sage-600 dark:text-sage-400 font-medium">
                                        {Math.round((listenedCount / lectures.length) * 100)}%
                                    </span>
                                )}
                                <span className="badge text-xs">{lectures.length}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function SBLecturesPage() {
    const { data, update } = useUserStorage();
    const [selectedCanto, setSelectedCanto] = useState<number | null>(null);
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
    const filteredLectures = sbLectures.filter(lecture => {
        // 1. Canto filter
        if (selectedCanto && lecture.canto !== selectedCanto) return false;

        // 2. Search filter
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            const matchesTitle = lecture.title.toLowerCase().includes(query);
            const matchesLocation = lecture.location.toLowerCase().includes(query);
            if (!matchesTitle && !matchesLocation) return false;
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

    // Group lectures by canto for navigation
    const lecturesByCanto = sbLectures.reduce((acc: Record<number, SBLecture[]>, lecture) => {
        const canto = lecture.canto;
        if (!acc[canto]) {
            acc[canto] = [];
        }
        acc[canto].push(lecture);
        return acc;
    }, {});

    const cantos = Object.keys(lecturesByCanto)
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden lg:block w-80 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-sand-50/50 dark:bg-neutral-900/50 overflow-y-auto custom-scrollbar">
                <div className="p-4">
                    <CantoNavigation
                        cantos={cantos}
                        selectedCanto={selectedCanto}
                        onCantoSelect={setSelectedCanto}
                        lecturesByCanto={lecturesByCanto}
                        listenedIds={data.listenedLectures}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-50/30 dark:bg-neutral-950/30">
                <div className="max-w-5xl mx-auto p-4 lg:p-8">
                    {/* Mobile Chapter Navigation */}
                    <div className="lg:hidden mb-6">
                        <select
                            value={selectedCanto || ''}
                            onChange={(e) => setSelectedCanto(e.target.value ? Number(e.target.value) : null)}
                            className="w-full p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                        >
                            <option value="">All Cantos</option>
                            {cantos.map(canto => (
                                <option key={canto} value={canto}>Canto {canto}</option>
                            ))}
                        </select>
                    </div>

                    {/* Header & Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="heading-1 text-2xl mb-1">
                                    {selectedCanto ? `Canto ${selectedCanto}` : 'All Cantos'}
                                </h1>
                                <p className="text-sm text-foreground-muted">
                                    {filteredLectures.length} lectures found
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted group-focus-within:text-lotus-600 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search SB lectures..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-lotus-500/20 focus:border-lotus-500 w-full md:w-64 transition-all"
                                    />
                                </div>

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`btn-icon ${showFilters ? 'bg-lotus-100 text-lotus-700 dark:bg-lotus-900 dark:text-lotus-300' : ''}`}
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
                                            ? 'bg-lotus-600 text-white shadow-md transform scale-105'
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
                            {(searchTerm || filterType !== 'all' || selectedCanto) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterType('all');
                                        setSelectedCanto(null);
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
