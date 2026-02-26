import React from 'react';
import { ChevronRight, X } from 'lucide-react';
import { HorizontalTabs } from '../Atoms/HorizontalTabs';
import { Button } from '../Atoms/Button';
import { Tooltip } from '../Atoms/Tooltip';
import { getScrollParent } from '../../utils';

import { PageToolbarProps } from '@od-erp/types';

export const PageToolbar: React.FC<PageToolbarProps> = ({
    tabs,
    activeTab,
    onTabChange,
    secondaryTabs,
    secondaryActiveTab,
    onSecondaryTabChange,
    actions,
    className,
    extraContent,
    actionsBreakpoint = 1024,
}) => {
    const [isSticky, setIsSticky] = React.useState(false);
    const [actionsExpanded, setActionsExpanded] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [sidebarWidth, setSidebarWidth] = React.useState(0);
    const [windowWidth, setWindowWidth] = React.useState(() => window.innerWidth);
    const [isWide, setIsWide] = React.useState(true);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inlineContentRef = React.useRef<HTMLDivElement>(null);
    const sentinelRef = React.useRef<HTMLDivElement>(null);
    const stickyBarRef = React.useRef<HTMLDivElement>(null);

    // Track window width for strict mobile hide
    React.useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    // Track the toolbar container's own rendered width (accounts for sidebar open/close).
    React.useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setIsWide(entry.contentRect.width >= actionsBreakpoint);
        });
        ro.observe(el);
        // Initial read
        setIsWide(el.getBoundingClientRect().width >= actionsBreakpoint);
        return () => ro.disconnect();
    }, [actionsBreakpoint]);

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

    // Detect when toolbar sentinel scrolls past the header line (70px)
    React.useEffect(() => {
        const parent = getScrollParent(containerRef.current);
        const HEADER_HEIGHT = 70;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // When using a scroll root that isn't the viewport, 
                // the boundingClientRect is relative to the viewport.
                // We want to stick when the element reaches the top of the root.
                const isStickyTriggered = entry.boundingClientRect.top <= (parent === document.documentElement ? HEADER_HEIGHT : parent.getBoundingClientRect().top) + 10;
                setIsSticky(!entry.isIntersecting && isStickyTriggered);
            },
            { 
                threshold: [0, 1],
                root: parent === document.documentElement ? null : parent,
                // If parent is viewport, we need margin for header. 
                // If parent is a scroll container starting below header, margin is 0.
                rootMargin: parent === document.documentElement ? `-${HEADER_HEIGHT}px 0px 0px 0px` : '0px'
            }
        );
        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, []);

    // Publish --table-sticky-top so DataTable can pin itself exactly here
    React.useEffect(() => {
        if (!isSticky) {
            // Use a large negative value to prevent the "Always Sticky" DataTable 
            // from snapping to the top of the container prematurely.
            document.documentElement.style.setProperty('--table-sticky-top', '-1000');
            document.documentElement.style.setProperty('--table-sticky-top-px', '-1000px');
            return;
        }
        const publish = () => {
            const el = stickyBarRef.current;
            if (!el) return;
            
            const parent = getScrollParent(containerRef.current);
            const rect = el.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();
            
            // Calculate offset relative to the scroll parent if applicable
            const relativeBottom = parent === document.documentElement ? rect.bottom : (rect.bottom - parentRect.top);
            
            document.documentElement.style.setProperty('--table-sticky-top', `${relativeBottom}`);
            document.documentElement.style.setProperty('--table-sticky-top-px', `${relativeBottom}px`);
        };
        publish();
        const ro = new ResizeObserver(publish);
        if (stickyBarRef.current) ro.observe(stickyBarRef.current);
        return () => ro.disconnect();
    }, [isSticky]);

    // Collapse when toolbar scrolls back into view
    React.useEffect(() => {
        if (!isSticky) setActionsExpanded(false);
    }, [isSticky]);

    const visibleActions = actions?.filter(btn => btn.isVisible !== false) ?? [];
    const hasTabs = !!(tabs && tabs.length > 0 && activeTab && onTabChange);
    const hasSecondaryTabs = !!(secondaryTabs && secondaryTabs.length > 0 && secondaryActiveTab && onSecondaryTabChange);
    const hasActions = visibleActions.length > 0 || !!extraContent;

    /** Combined actions: extraContent + ActionButtons */
    const CombinedActions = ({ small = false }: { small?: boolean }) => (
        <div className="flex items-center gap-2 flex-wrap justify-end">
            {extraContent && <div className="shrink-0">{extraContent}</div>}
            {visibleActions.length > 0 && (
                <div className="flex items-center gap-2">
                    {visibleActions.map((btn, i) => (
                        <Tooltip key={i} content={btn.title} placement="bottom">
                            <Button
                                variant={btn.variant || 'outline'}
                                className={`!p-0 ${small ? '!w-8 !h-8' : '!w-9 !h-9'} flex-shrink-0 ${btn.className || ''}`}
                                onClick={btn.onClick}
                                title={btn.title}
                            >
                                <btn.icon className={`h-4 w-4 ${btn.iconClass || ''}`} />
                            </Button>
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div ref={containerRef} className="relative">
            {/* Sentinel — invisible anchor used to detect scroll position */}
            <div ref={sentinelRef} className="absolute top-0 w-full h-px opacity-0 pointer-events-none" />

            {/* ── NON-STICKY: normal inline toolbar (Acts as placeholder when sticky) ───── */}
            <div 
                ref={inlineContentRef} 
                className={`${isSticky ? 'opacity-0 pointer-events-none select-none' : 'block'}`}
                aria-hidden={isSticky}
            >
                {/* Actions Row (Desktop only) */}
                {!isMobile && hasActions && (
                    <div className={`flex flex-row justify-end items-center mb-2 gap-4 ${className || ''}`}>
                        {isWide && <CombinedActions />}
                    </div>
                )}

                {/* Tabs row — always visible */}
                {hasTabs && (
                    <div className="w-full mb-1">
                        <HorizontalTabs
                            tabs={tabs!}
                            activeTab={activeTab!}
                            onTabChange={onTabChange!}
                            className="px-0 mb-0"
                            fullWidth
                        />
                    </div>
                )}

                {/* Secondary Tabs row */}
                {hasSecondaryTabs && (
                    <div className="w-full mb-4">
                        <HorizontalTabs
                            tabs={secondaryTabs!}
                            activeTab={secondaryActiveTab!}
                            onTabChange={onSecondaryTabChange!}
                            className="px-0 mb-0"
                            fullWidth
                        />
                    </div>
                )}

                {/* NARROW desktop flow: combined actions move below tabs if space is tight */}
                {!isMobile && !isWide && hasActions && (
                    <div className={`flex flex-row justify-end items-center mb-2 gap-2 ${className || ''}`}>
                        <CombinedActions />
                    </div>
                )}
            </div>

            {/* ── STICKY: bar fixed below header ───────────────────────────── */}
            {isSticky && (
                <>
                    {/* Backdrop — fades in/out smoothly on hover */}
                    <div
                        className="fixed inset-0 backdrop-blur-sm bg-black/20 transition-opacity duration-300 ease-in-out pointer-events-none"
                        style={{
                            zIndex: 9998,
                            opacity: isHovered ? 1 : 0,
                        }}
                    />

                    <div
                        ref={stickyBarRef}
                        data-sticky-header="true"
                        className="fixed z-[9999] bg-white/70 backdrop-blur-md border-b border-gray-200/60 shadow-sm hover:bg-white/90"
                        style={{
                            top: '70px',
                            left: isMobile ? 0 : sidebarWidth,
                            right: 0,
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* ROW 1: Desktop Actions Group */}
                        {!isMobile && (
                            <div 
                                className={`flex items-center px-3 pb-1.5 min-h-[40px] ${actionsExpanded ? 'justify-end' : 'justify-start'}`}
                                onMouseEnter={() => setActionsExpanded(true)}
                                onMouseLeave={() => setActionsExpanded(false)}
                            >
                                {hasActions && (
                                    <>
                                        {!actionsExpanded ? (
                                            <Button
                                                variant="outline"
                                                className="!p-0 !w-8 !h-8 rounded-full bg-white shadow-md border-none transition-transform hover:scale-110"
                                            >
                                                <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                                <CombinedActions small />
                                                <div className="w-[1px] h-6 bg-gray-200 mx-1" />
                                                <Button
                                                    variant="outline"
                                                    className="!p-0 !w-8 !h-8 rounded-full bg-white shadow-md border-none transition-transform hover:scale-110"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActionsExpanded(false);
                                                    }}
                                                >
                                                    <X className="h-4 w-4" strokeWidth={2.5} />
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ROW 2: Tabs */}
                        {hasTabs && (
                            <div className="w-full">
                                <HorizontalTabs
                                    tabs={tabs!}
                                    activeTab={activeTab!}
                                    onTabChange={onTabChange!}
                                    className="px-0 mb-0 border-b-0"
                                    fullWidth
                                />
                            </div>
                        )}

                        {/* ROW 3: Secondary Tabs */}
                        {hasSecondaryTabs && (
                            <div className="w-full border-t border-gray-100">
                                <HorizontalTabs
                                    tabs={secondaryTabs!}
                                    activeTab={secondaryActiveTab!}
                                    onTabChange={onSecondaryTabChange!}
                                    className="px-0 mb-0 border-b-0"
                                    fullWidth
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
