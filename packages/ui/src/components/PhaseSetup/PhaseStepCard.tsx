import { ArrowRight } from 'lucide-react';
import React from 'react';
import { cn } from '../../utils';
import { Button } from '../Atoms/Button';
import type { PhaseStepCardProps } from '@od-erp/types';

export const PhaseStepCard = ({
    title,
    subtitle,
    icon,
    isStarted,
    onAction,
}: PhaseStepCardProps) => {
    return (
        <div className="relative flex items-center gap-4 group">
            {/* Step Marker on Timeline - w-12 to match header alignment */}
            <div className="z-10 w-12 flex justify-center shrink-0">
                <div 
                    className={cn(
                        "w-8 h-8 bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20 rounded-full flex items-center justify-center font-bold text-base border-2 transition-all duration-300"
                    )}
                >
                    {React.cloneElement(icon as React.ReactElement, { size: 16 })}
                </div>
            </div>

            {/* Card Content */}
            <div 
                className={cn(
                    "flex-grow bg-[var(--color-card)] border rounded-[8px] px-4 py-3 flex items-center gap-6 transition-all duration-300",
                    isStarted 
                        ? "border-primary" 
                        : "border-dashed border-[var(--color-border)] opacity-70"
                )}
            >
                {/* Icon Box */}
                <div 
                    className={cn(
                        "flex-shrink-0 w-11 h-11 rounded-md flex items-center justify-center transition-colors duration-300",
                        isStarted ? "bg-[color-mix(in_srgb,var(--color-primary),transparent_90%)] text-primary" : "bg-[var(--color-muted)]/50 text-[var(--color-muted-foreground)]"
                    )}
                >
                    {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                </div>

                {/* Text Content */}
                <div className="flex-grow min-w-0">
                    <h3 className={cn(
                        "text-md font-bold truncate",
                        !isStarted && "text-[var(--color-muted-foreground)]"
                    )}>
                        {title}
                    </h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mt-0.5">
                        {subtitle}
                    </p>
                </div>

                {/* Action Button */}
                <div className="w-22">
                    <Button 
                        variant={isStarted ? "soft-primary" : "outline-muted"}
                        size="md"
                        onClick={onAction}
                        className={cn(
                            "w-full h-10 flex items-center justify-center gap-2 font-bold rounded-lg transition-all"
                        )}
                    >
                        {isStarted ? (
                            <>
                                Continue
                                <ArrowRight size={18} />
                            </>
                        ) : (
                            <>
                                Start
                                <ArrowRight size={18} />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
