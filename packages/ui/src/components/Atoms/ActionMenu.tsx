import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

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

// Global state to track which menu is currently open
const menuCallbacks: Map<string, () => void> = new Map();

export const ActionMenu: React.FC<ActionMenuProps> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState<{ top?: number; left: number; bottom?: number }>({ left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuId = useRef<string>(`menu-${Math.random().toString(36).substr(2, 9)}`);

    // Register this menu's close callback
    useEffect(() => {
        menuCallbacks.set(menuId.current, () => setIsOpen(false));
        return () => {
            menuCallbacks.delete(menuId.current);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
             if(isOpen) setIsOpen(false);
        };
        const handleResize = () => {
             if(isOpen) setIsOpen(false);
        };
        const handleClickOutside = (e: MouseEvent) => {
             if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
                 return;
             }
             setIsOpen(false);
        };

        if (isOpen) {
            window.addEventListener('click', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Close all other open menus
        if (!isOpen) {
            menuCallbacks.forEach((closeCallback, id) => {
                if (id !== menuId.current) {
                    closeCallback();
                }
            });
        }
        
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuHeightApprox = 150; // Estimate menu height

            const left = rect.right - 160; // Align right

            if (spaceBelow < menuHeightApprox) {
                // Open upwards
                setPosition({
                    bottom: window.innerHeight - rect.top + 4,
                    left: left
                });
            } else {
                // Open downwards
                setPosition({
                    top: rect.bottom + 4,
                    left: left
                });
            }
        }
        setIsOpen(!isOpen);
    };

    const visibleItems = items.filter(item => !item.hidden);

    if (visibleItems.length === 0) return null;

    return (
        <>
            <button
                ref={buttonRef}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none"
                onClick={handleToggle}
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && createPortal(
                <div 
                    className="fixed z-[9999] w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    style={{ 
                        top: position.top, 
                        bottom: position.bottom,
                        left: position.left,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="py-1">
                        {visibleItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
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
                                        : 'hover:bg-gray-50 cursor-pointer text-gray-700 hover:text-gray-900'}
                                    ${item.className || ''}
                                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
