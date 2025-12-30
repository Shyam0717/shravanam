'use client';

import { useEffect, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { NODLecture, FilterType } from '@/types/Lecture';
import { LectureCard } from '@/components/LectureCard';
import { useUserStorage } from '@/lib/useUserStorage';

// Import static data
import nodLecturesRaw from '@/data/nod_lectures.json';

const nodLectures = nodLecturesRaw as NODLecture[];

export default function NODLecturesPage() {
    const { data, update } = useUserStorage();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    // const [showFilters, setShowFilters] = useState(false);

    // Read filter from URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const filter = params.get('filter') as FilterType;
        if (filter && ['all', 'listened', 'unlistened', 'bookmarked'].includes(filter)) {
            setFilterType(filter);
        }
    }, []);

    // Filter lectures
    const filteredLectures = nodLectures.filter(lecture => {
        // 1. Search filter
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            const matchesTitle = lecture.title.toLowerCase().includes(query);
            const matchesLocation = lecture.location.toLowerCase().includes(query);
            if (!matchesTitle && !matchesLocation) return false;
        }

        // 2. Status filter
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

    // Calculate progress
    const totalLectures = nodLectures.length;
    const completedLectures = nodLectures.filter(l => data.listenedLectures.includes(l.id)).length;
    const progress = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-neutral-50/30 dark:bg-neutral-950/30 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto w-full p-4 lg:p-8">
                <div className="mb-8 text-center">
                    <h1 className="heading-1 text-3xl mb-2">📗 Nectar of Devotion Lectures</h1>
                    <p className="text-foreground-muted">
                        Srila Prabhupada&apos;s teachings on the complete science of Bhakti Yoga
                    </p>
                </div>

                {/* Progress Banner */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-foreground">
                                    {completedLectures} of {totalLectures} lectures completed
                                </span>
                                <span className="text-sm text-foreground-muted font-medium">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted group-focus-within:text-sky-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search NOD lectures..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10 w-full"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as FilterType)}
                        className="input-field sm:w-48"
                    >
                        <option value="all">All Lectures</option>
                        <option value="listened">Listened</option>
                        <option value="unlistened">Not Listened</option>
                        <option value="bookmarked">Bookmarked</option>
                    </select>
                </div>

                {/* Lectures Grid */}
                {filteredLectures.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredLectures.map(lecture => (
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
                        {(searchTerm || filterType !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterType('all');
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
    );
}
