import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MenuItem } from './types';

interface SidebarExpansionPanelProps {
    item: MenuItem | null;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const SidebarExpansionPanel: React.FC<SidebarExpansionPanelProps> = ({
    item,
    onMouseEnter,
    onMouseLeave,
}) => {
    if (!item || !item.submenu) return null;

    return (
        <div
            className="fixed left-20 top-16 bottom-0 w-80 bg-white border-r border-gray-200 shadow-xl z-10 overflow-y-auto"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{item.title}</h3>
                <div className="space-y-6">
                    {item.submenu.map((category, catIndex) => (
                        <div key={catIndex}>
                            <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                                {category.title}
                            </h4>
                            {category.page && !category.submenu ? (
                                <Link
                                    to={category.page}
                                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    {category.title}
                                </Link>
                            ) : (
                                category.submenu && (
                                    <ul className="space-y-1">
                                        {category.submenu.map((subItem, subIndex) => (
                                            <li key={subIndex}>
                                                <Link
                                                    to={subItem.page}
                                                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                                                >
                                                    <span>{subItem.title}</span>
                                                    {subItem.fav && (
                                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
