'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, BookOpen, Headphones, BarChart3, Info } from 'lucide-react';
import { GlobalAudioPlayer } from './GlobalAudioPlayer';

interface LayoutProps {
    children: ReactNode;
}

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/lectures', label: 'BG', icon: Headphones },
    { href: '/sb', label: 'SB', icon: BookOpen },
    { href: '/nod', label: 'NOD', icon: BookOpen },
    { href: '/about', label: 'About', icon: Info },
];

export function Layout({ children }: LayoutProps) {
    const router = useRouter();

    const isActive = (href: string) => {
        if (href === '/') return router.pathname === '/';
        return router.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Top Navigation */}
            <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-semibold text-foreground">Kirtanam Sadhana</h1>
                                <p className="text-xs text-foreground-muted">Spiritual Audio Library</p>
                            </div>
                        </Link>

                        {/* Navigation */}
                        <nav className="flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active
                                            ? 'bg-sage-100 dark:bg-sage-900 text-sage-700 dark:text-sage-300'
                                            : 'text-foreground-muted hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-16 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-foreground-muted">
                            📿 Dedicated to His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
                        </p>
                        <p className="text-xs text-foreground-muted">
                            Audio source: <a href="https://iskcondesiretree.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">ISKCON Desire Tree</a>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Global Audio Player */}
            <GlobalAudioPlayer />
        </div>
    );
}
