import React from 'react';
import { HorizontalTabsProps } from '@od-erp/types';
import { cn } from '../../utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HorizontalTabs: React.FC<HorizontalTabsProps> = ({ 
  tabs = [], 
  activeTab, 
  onTabChange,
  className,
  fullWidth
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);

  // Guard against missing tabs
  if (!tabs || tabs.length === 0) return null;

  const checkScroll = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftArrow(scrollLeft > 5); // Add a small threshold
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      setContainerWidth(el.getBoundingClientRect().width);
      checkScroll();
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);

    el.addEventListener('scroll', checkScroll);

    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.6;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const canFitTabs = containerWidth / Math.max(tabs.length, 1) >= 100;
  const shouldDistribute = fullWidth && canFitTabs;

  return (
    <div className={cn("group relative", fullWidth ? "w-full" : "w-fit")}>
      {/* Left Arrow */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className={cn(
          "absolute left-0 top-0 bottom-[2px] z-10 flex items-center justify-center w-8 bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity duration-200",
          showLeftArrow 
            ? "opacity-100 pointer-events-auto lg:opacity-0 lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      {/* Tabs Container */}
      <div 
        ref={containerRef}
        className={cn(
          "flex flex-nowrap border-b border-gray-200 overflow-x-auto no-scrollbar scroll-smooth",
          fullWidth ? "w-full" : "w-fit",
          className
        )}
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        ` }} />
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "flex-shrink-0 px-4 pb-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors duration-200 ease-in-out hover:text-primary focus:outline-none text-center",
              shouldDistribute ? "flex-1" : "",
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className={cn(
          "absolute right-0 top-0 bottom-[2px] z-10 flex items-center justify-center w-8 bg-gradient-to-l from-white via-white/90 to-transparent transition-opacity duration-200",
          showRightArrow 
            ? "opacity-100 pointer-events-auto lg:opacity-0 lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};
