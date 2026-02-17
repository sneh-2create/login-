import React from 'react';
import { cn } from '../../utils';

interface Tab {
  label: string;
  value: string;
}

interface HorizontalTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (_value: string) => void;
  className?: string;
}

export const HorizontalTabs: React.FC<HorizontalTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  className
}) => {
  return (
    <div className={cn("flex flex-nowrap overflow-x-auto border-b border-gray-200 no-scrollbar w-fit", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors duration-200 ease-in-out hover:text-primary focus:outline-none",
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
