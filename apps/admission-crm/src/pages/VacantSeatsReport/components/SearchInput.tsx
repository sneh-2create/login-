import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    onSearch,
    placeholder = 'Search...'
}) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, onSearch]);

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ca9c9] focus:border-transparent text-sm"
            />
        </div>
    );
};
