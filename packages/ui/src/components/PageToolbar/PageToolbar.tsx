import React from 'react';
import { HorizontalTabs } from '../Atoms/HorizontalTabs';
import { Button } from '../Atoms/Button';
import { Tooltip } from '../Atoms/Tooltip';

export interface ActionButton {
    icon: React.ElementType;
    onClick: () => void;
    title: string;
    isVisible?: boolean;
    className?: string;
    iconClass?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
}

interface PageToolbarProps {
    tabs?: { label: string; value: string }[];
    activeTab?: string;
    onTabChange?: (_value: string) => void;
    actions?: ActionButton[];
    className?: string;
    extraContent?: React.ReactNode;
}

export const PageToolbar: React.FC<PageToolbarProps> = ({ 
    tabs, 
    activeTab, 
    onTabChange, 
    actions, 
    className,
    extraContent
}) => {
    const [isSticky, setIsSticky] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const sentinelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // When toolbar scrolls up and reaches the header (top-24 = 96px), show sticky button
                // entry.boundingClientRect.top gives us the distance from viewport top
                const hasScrolledPastHeader = entry.boundingClientRect.top <= 96;
                const shouldBeSticky = !entry.isIntersecting && hasScrolledPastHeader;
                setIsSticky(shouldBeSticky);
            },
            { 
                threshold: [0, 0.1, 0.5, 1],
                rootMargin: '0px 0px 0px 0px'
            }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );

    return (
        <div className="relative">
            <div ref={sentinelRef} className="absolute -top-1 w-full h-1 opacity-0 pointer-events-none" />
            
            {/* Placeholder to prevent layout shift */}
            {isSticky && (
                <div className={`flex flex-col md:flex-row justify-between items-end md:items-center mb-4 gap-4 opacity-0 pointer-events-none ${className || ''}`}>
                    <div className="h-10 w-full" />
                </div>
            )}

            <div
                className={`transition-all duration-300 ease-in-out ${
                    isSticky
                        ? "fixed top-24 left-64 z-[9999] flex items-center justify-start"
                        : `flex flex-col md:flex-row justify-between items-end md:items-center mb-4 gap-4 ${className || ''}`
                }`}
            >
                {isSticky ? (
                    <div
                        className={`shadow-lg rounded-r-full p-2 flex items-center transition-all duration-300 ${isHovered ? 'bg-white border border-gray-200 pl-4' : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] animate-pulse'}`}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            maxWidth: isHovered ? "100%" : "50px"
                        }}
                    >
                        <div className={`ml-2 cursor-pointer transition-transform duration-300 ${isHovered ? "text-primary" : "text-white rotate-180"}`}>
                             <ChevronRight className="h-6 w-6" />
                        </div>
                        
                        <div className={`flex items-center gap-4 overflow-hidden transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0 w-0 h-0"}`}>
                            {/* Render Tabs in Floating View if present */}
                            {tabs && tabs.length > 0 && activeTab && onTabChange && (
                                <div className="shrink-0">
                                    <HorizontalTabs
                                        tabs={tabs}
                                        activeTab={activeTab}
                                        onTabChange={onTabChange}
                                        className="px-0 mb-0"
                                    />
                                </div>
                            )}

                            {/* Extra content (e.g. session selector) */}
                            {extraContent && (
                                <div className="shrink-0">{extraContent}</div>
                            )}

                             <div className="flex items-center gap-2">
                                {actions?.map((btn, index) => (
                                    btn.isVisible !== false && (
                                        <Tooltip key={index} content={btn.title} placement="bottom">
                                            <Button
                                                variant={btn.variant || "outline"}
                                                className={`!p-0 !w-9 !h-9 ${btn.className || ''}`}
                                                onClick={btn.onClick}
                                                title={btn.title}
                                            >
                                                <btn.icon className={`h-4 w-4 ${btn.iconClass || ''}`} />
                                            </Button>
                                        </Tooltip>
                                    )
                                ))}
                             </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 w-full md:w-auto overflow-x-auto">
                            {tabs && tabs.length > 0 && activeTab && onTabChange && (
                                <HorizontalTabs
                                    tabs={tabs}
                                    activeTab={activeTab}
                                    onTabChange={onTabChange}
                                    className="px-0 mb-0"
                                />
                            )}
                        </div>
                        <div className="hidden md:flex items-center space-x-2 shrink-0">
                            {/* Extra content (e.g. session selector) */}
                            {extraContent && (
                                <div className="shrink-0">{extraContent}</div>
                            )}
                            {actions?.map((btn, index) => (
                                btn.isVisible !== false && (
                                    <Tooltip key={index} content={btn.title} placement="bottom">
                                        <Button
                                            variant={btn.variant || "outline"}
                                            className={`!p-0 !w-9 !h-9 ${btn.className || ''}`}
                                            onClick={btn.onClick}
                                            title={btn.title}
                                        >
                                            <btn.icon className={`h-4 w-4 ${btn.iconClass || ''}`} />
                                        </Button>
                                    </Tooltip>
                                )
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
