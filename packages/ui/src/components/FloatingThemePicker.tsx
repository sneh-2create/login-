import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@od-erp/store';
import { setPrimaryColor, setTheme } from '@od-erp/store';
import { PrimaryColor } from '@od-erp/types';
import { PRIMARY_COLORS, COLOR_NAMES, COLOR_PREVIEW } from '@od-erp/constants';
import { cn } from '../utils';

export const FloatingThemePicker: React.FC = () => {
    const dispatch = useAppDispatch();
    const { theme, primaryColor } = useAppSelector((state) => state.ui);
    const [isOpen, setIsOpen] = useState(false);

    const handleColorChange = (color: PrimaryColor) => {
        dispatch(setPrimaryColor(color));
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed right-6 bottom-6 z-50",
                    "w-14 h-14 rounded-full shadow-lg",
                    "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]",
                    "flex items-center justify-center",
                    "transition-all duration-300 hover:scale-110",
                    "text-white"
                )}
                title="Theme Settings"
                aria-label="Open theme settings"
            >
                {isOpen ? <X size={24} /> : <Palette size={24} />}
            </button>

            {/* Theme Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="fixed right-6 bottom-24 z-50 w-80 bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-muted)]">
                            <h3 className="text-lg font-semibold text-[var(--color-foreground)] flex items-center gap-2">
                                <Palette size={20} className="text-[var(--color-primary)]" />
                                Theme Settings
                            </h3>
                            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                                Customize your experience
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-6">
                            {/* Theme Mode */}
                            <div>
                                <label className="text-sm font-semibold text-[var(--color-foreground)] mb-3 block">
                                    Appearance
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => dispatch(setTheme('light'))}
                                        className={cn(
                                            "p-3 rounded-lg border-2 transition-all",
                                            "flex flex-col items-center gap-2",
                                            theme === 'light'
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                        )}
                                    >
                                        <div className="w-12 h-8 rounded bg-white border border-gray-200 flex items-center justify-center">
                                            <div className="w-8 h-4 bg-gray-100 rounded"></div>
                                        </div>
                                        <span className="text-xs font-medium text-[var(--color-foreground)]">Light</span>
                                    </button>
                                    <button
                                        onClick={() => dispatch(setTheme('dark'))}
                                        className={cn(
                                            "p-3 rounded-lg border-2 transition-all",
                                            "flex flex-col items-center gap-2",
                                            theme === 'dark'
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                        )}
                                    >
                                        <div className="w-12 h-8 rounded bg-gray-800 border border-gray-700 flex items-center justify-center">
                                            <div className="w-8 h-4 bg-gray-700 rounded"></div>
                                        </div>
                                        <span className="text-xs font-medium text-[var(--color-foreground)]">Dark</span>
                                    </button>
                                </div>
                            </div>

                            {/* Primary Color */}
                            <div>
                                <label className="text-sm font-semibold text-[var(--color-foreground)] mb-3 block">
                                    Primary Color
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {PRIMARY_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handleColorChange(color)}
                                            className={cn(
                                                "relative p-3 rounded-lg border-2 transition-all",
                                                "flex flex-col items-center gap-2 group",
                                                primaryColor === color
                                                    ? "border-[var(--color-primary)] scale-105"
                                                    : "border-[var(--color-border)] hover:border-gray-400 hover:scale-105"
                                            )}
                                            title={COLOR_NAMES[color]}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full shadow-md transition-transform group-hover:scale-110"
                                                style={{ backgroundColor: COLOR_PREVIEW[color] }}
                                            />
                                            <span className="text-xs font-medium text-[var(--color-foreground)] capitalize">
                                                {COLOR_NAMES[color]}
                                            </span>
                                            {primaryColor === color && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-muted)]/50">
                            <p className="text-xs text-[var(--color-muted-foreground)] text-center">
                                Changes apply instantly
                            </p>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
