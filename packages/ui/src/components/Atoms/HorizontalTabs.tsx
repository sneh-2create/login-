import React from 'react';
import { HorizontalTabsProps } from '@od-erp/types';
import { cn } from '../../utils';

export const HorizontalTabs: React.FC<HorizontalTabsProps> = ({ 
  tabs = [], 
  activeTab, 
  onTabChange,
  className,
  fullWidth
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  // Guard against missing tabs
  if (!tabs || tabs.length === 0) return null;

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      setContainerWidth(el.getBoundingClientRect().width);
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const canFitTabs = containerWidth / Math.max(tabs.length, 1) >= 100;
  const shouldDistribute = fullWidth && canFitTabs;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-nowrap border-b border-gray-200 overflow-x-auto no-scrollbar",
        fullWidth ? "w-full" : "w-fit",
        className
      )}
    >
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
  );
};
