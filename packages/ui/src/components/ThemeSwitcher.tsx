import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@od-erp/store';
import { setTheme } from '@od-erp/store';

export const ThemeSwitcher: React.FC = () => {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state) => state.ui);

    const toggleTheme = () => {
        dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <Moon size={20} className="text-[var(--color-foreground)]" />
            ) : (
                <Sun size={20} className="text-[var(--color-foreground)]" />
            )}
        </button>
    );
};
