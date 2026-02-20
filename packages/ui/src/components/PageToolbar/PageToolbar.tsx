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
    const [actionsExpanded, setActionsExpanded] = React.useState(false);
    const [sidebarWidth, setSidebarWidth] = React.useState(0);
    const sentinelRef = React.useRef<HTMLDivElement>(null);

    // Track sidebar width so sticky bar starts after sidebar
    React.useEffect(() => {
        const sidebar = document.querySelector('aside');
        if (!sidebar) return;
        const update = () => setSidebarWidth(sidebar.getBoundingClientRect().width);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(sidebar);
        return () => ro.disconnect();
    }, []);

    // Detect when toolbar sentinel scrolls past the header
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const pastHeader = entry.boundingClientRect.top <= 96;
                setIsSticky(!entry.isIntersecting && pastHeader);
            },
            { threshold: [0, 0.1, 0.5, 1] }
        );
        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, []);

    // Collapse when toolbar scrolls back into view
    React.useEffect(() => {
        if (!isSticky) setActionsExpanded(false);
    }, [isSticky]);

    const visibleActions = actions?.filter(btn => btn.isVisible !== false) ?? [];
    const hasTabs = !!(tabs && tabs.length > 0 && activeTab && onTabChange);

    const ChevronRightIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
        </svg>
    );

    const XIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );

    return (
        <div className="relative">
            {/* Sentinel — invisible anchor used to detect scroll position */}
            <div ref={sentinelRef} className="absolute -top-1 w-full h-1 opacity-0 pointer-events-none" />

            {/* ── NON-STICKY: normal inline toolbar ───────────────────────── */}
            {!isSticky && (
                <>
                    <div className={`flex flex-row justify-end items-center mb-2 gap-2 ${className || ''}`}>
                        {extraContent && <div className="shrink-0">{extraContent}</div>}
                        <div className="flex items-center gap-2">
                            {visibleActions.map((btn, i) => (
                                <Tooltip key={i} content={btn.title} placement="bottom">
                                    <Button
                                        variant={btn.variant || 'outline'}
                                        className={`!p-0 !w-9 !h-9 ${btn.className || ''}`}
                                        onClick={btn.onClick}
                                        title={btn.title}
                                    >
                                        <btn.icon className={`h-4 w-4 ${btn.iconClass || ''}`} />
                                    </Button>
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                    {/* Tabs row below actions, full width with equal tab widths */}
                    {hasTabs && (
                        <div className="w-full mb-4">
                            <HorizontalTabs
                                tabs={tabs!}
                                activeTab={activeTab!}
                                onTabChange={onTabChange!}
                                className="px-0 mb-0"
                                fullWidth
                            />
                        </div>
                    )}
                </>
            )}

            {/* Placeholder height to prevent layout shift */}
            {isSticky && (
                <div
                    className="opacity-0 pointer-events-none"
                    style={{ height: hasTabs ? '84px' : '44px' }}
                />
            )}

            {/* ── STICKY: 2-row bar fixed below header ────────────────────── */}
            {isSticky && (
                <div
                    className="fixed z-[9999] bg-white border-b border-gray-200 shadow-sm"
                    style={{
                        top: '64px',       // adjust to match your header height
                        left: sidebarWidth,
                        right: 0,
                    }}
                >
                    {/* ROW 1: expand toggle  +  actions (animated)  +  close btn */}
                    <div className="flex items-center gap-2 px-3 py-1.5">

                        {/* LEFT: expand toggle — hidden once expanded */}
                        <div
                            className="transition-all duration-200 overflow-hidden flex-shrink-0"
                            style={{
                                maxWidth: actionsExpanded ? 0 : '36px',
                                opacity: actionsExpanded ? 0 : 1,
                                pointerEvents: actionsExpanded ? 'none' : 'auto',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setActionsExpanded(true)}
                                onMouseEnter={() => setActionsExpanded(true)}
                                className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-colors duration-200 cursor-pointer"
                                title="Expand actions"
                            >
                                <ChevronRightIcon />
                            </button>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Actions — slide in from right */}
                        <div
                            className="flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out"
                            style={{
                                maxWidth: actionsExpanded ? '600px' : 0,
                                opacity: actionsExpanded ? 1 : 0,
                                pointerEvents: actionsExpanded ? 'auto' : 'none',
                            }}
                        >
                            {extraContent && <div className="shrink-0">{extraContent}</div>}
                            {visibleActions.map((btn, i) => (
                                <Tooltip key={i} content={btn.title} placement="bottom">
                                    <Button
                                        variant={btn.variant || 'outline'}
                                        className={`!p-0 !w-8 !h-8 flex-shrink-0 ${btn.className || ''}`}
                                        onClick={btn.onClick}
                                        title={btn.title}
                                    >
                                        <btn.icon className={`h-4 w-4 ${btn.iconClass || ''}`} />
                                    </Button>
                                </Tooltip>
                            ))}
                        </div>

                        {/* RIGHT: close/collapse — only when expanded */}
                        <div
                            className="transition-all duration-200 overflow-hidden flex-shrink-0"
                            style={{
                                maxWidth: actionsExpanded ? '36px' : 0,
                                opacity: actionsExpanded ? 1 : 0,
                                pointerEvents: actionsExpanded ? 'auto' : 'none',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setActionsExpanded(false)}
                                className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
                                title="Collapse actions"
                            >
                                <XIcon />
                            </button>
                        </div>
                    </div>

                    {/* ROW 2: Horizontal tabs — full width, equal tab widths */}
                    {hasTabs && (
                        <div className="w-full">
                            <HorizontalTabs
                                tabs={tabs!}
                                activeTab={activeTab!}
                                onTabChange={onTabChange!}
                                className="px-0 mb-0"
                                fullWidth
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
