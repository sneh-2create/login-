import type { PhaseTimelineProps } from '@od-erp/types';
import { cn } from '../../utils';

export const PhaseTimeline = ({
    title,
    phaseNumber,
    children
}: PhaseTimelineProps) => {
    return (
        <div>
            {/* Phase Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-12 flex justify-center">
                    {/* Small dot on timeline */}
                    <div className={cn(
                        "w-2.5 h-2.5 rounded-full z-10 bg-primary"
                    )} />
                </div>
                <h2 className={cn(
                    "text-[12px] font-black uppercase tracking-[0.2em] opacity-90 text-primary"
                )}>
                    Phase {phaseNumber}: {title}
                </h2>
            </div>

            <div className="relative">
                {/* Main Vertical Timeline Line - Centered at 24px (half of w-12 markers) */}
                <div 
                    className={cn(
                        "absolute left-[23px] top-[-30px] bottom-0 w-[2.5px] bg-[var(--color-border)] opacity-40 rounded-full",
                    )}
                />
                
                <div className="flex flex-col gap-3">
                    {children}
                </div>
            </div>
        </div>
    );
};
