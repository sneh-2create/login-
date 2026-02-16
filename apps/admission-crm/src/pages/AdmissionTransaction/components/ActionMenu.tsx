import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@od-erp/ui';

export interface ActionMenuItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    hidden?: boolean;
    className?: string;
}

interface ActionMenuProps {
    items: ActionMenuItem[];
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const visibleItems = items.filter(item => !item.hidden);

    if (visibleItems.length === 0) return null;

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Settings className="h-7 w-7" />
            </Button>

            {isOpen && (
                <div 
                    className="fixed z-50 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    style={{
                        top: menuRef.current?.getBoundingClientRect().bottom ?? 0,
                        left: (menuRef.current?.getBoundingClientRect().right ?? 0) - 224, // 224px = 56 * 4 (w-56)
                    }}
                >
                    <div className="py-1">
                        {visibleItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (!item.disabled) {
                                        item.onClick();
                                        setIsOpen(false);
                                    }
                                }}
                                disabled={item.disabled}
                                className={`
                                    flex w-full items-center gap-2 px-4 py-2 text-sm text-left
                                    ${item.disabled 
                                        ? 'cursor-not-allowed opacity-50 bg-gray-50' 
                                        : 'hover:bg-gray-100 cursor-pointer'
                                    }
                                    ${item.className || ''}
                                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
