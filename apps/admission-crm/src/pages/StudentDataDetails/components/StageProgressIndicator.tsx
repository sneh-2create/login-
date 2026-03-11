import { useMemo } from 'react';
import { Check } from 'lucide-react';

interface StageProgressIndicatorProps {
    stages: string[]; // Array of stage names from viewAdmissionMaster
    currentStage: string;
}

const StageProgressIndicator = ({ stages, currentStage }: StageProgressIndicatorProps) => {
    // Match Angular logic exactly
    const displayStages = useMemo(() => {
        // If no stages, return empty array
        if (!stages || stages.length === 0) {
            return [];
        }
        
        // Angular: admissionStages.splice(-3) - removes last 3 stages
        const filtered = stages.slice(0, -3);
        
        // Add terminal stage based on current stage (Angular logic)
        if (currentStage === 'Approved' || currentStage === 'Rejected' || currentStage === 'Withdrawn') {
            // Add the actual terminal stage
            filtered.push(currentStage);
        } else {
            // Add default "Approved" stage
            filtered.push('Approved');
        }
        
        return filtered;
    }, [stages, currentStage]);
    
    // Extract stage names and find current index
    const currentIndex = displayStages.indexOf(currentStage);
    
    // Don't render if no stages
    if (displayStages.length === 0) {
        return null;
    }
    
    return (
        <div>
            {/* Angular-style horizontal pill layout */}
            <div className="flex items-center gap-0">
                {displayStages.map((stageName, index) => {
                    // Angular: checkHighlight(index) - returns true if index <= currentStageIndex
                    const isCompleted = index <= currentIndex;
                    const isLast = index === displayStages.length - 1;
                    
                    return (
                        <div key={`${stageName}-${index}`} className="flex items-center">
                            {/* Stage Pill - matches Angular .stepPill */}
                            <div
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-full border
                                    transition-all duration-300
                                    ${isCompleted
                                        ? 'bg-primary/10 border-primary/20' 
                                        : 'bg-[var(--color-background)] border-[var(--color-border)]'
                                    }
                                `}
                            >
                                {/* Stage Name */}
                                <span className={`text-sm font-medium ${isCompleted ? 'text-primary' : 'text-[var(--color-muted-foreground)]'}`}>
                                    {stageName}
                                </span>
                                
                                {/* Stage Number/Checkmark - matches Angular .stepPillCount */}
                                <div
                                    className={`
                                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                        ${isCompleted
                                            ? 'bg-primary text-white' 
                                            : 'bg-[var(--color-card)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]'
                                        }
                                    `}
                                >
                                    {/* Angular: checkHighlight(i) ? checkmark : number */}
                                    {isCompleted ? (
                                        <Check size={14} strokeWidth={3} />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Separator Line - matches Angular .stepPillSeprator */}
                            {!isLast && (
                                <div className="h-0.5 w-6 bg-[var(--color-border)] mx-0" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StageProgressIndicator;
