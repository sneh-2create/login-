import { useState, useEffect, RefObject } from 'react';

const DROPDOWN_MAX_HEIGHT = 240;
const GAP = 4;

/**
 * Returns placement (open above or below) and trigger width for dynamic dropdowns.
 * When there is not enough space below the trigger (e.g. near bottom of viewport), opens above.
 * Use for SelectSingle, MultiSelect, Autocomplete, DropdownMenu so dropdown flips above when needed.
 */
export function useDropdownPosition(
    triggerRef: RefObject<HTMLElement | null>,
    open: boolean
): { 
    placement: 'top' | 'bottom'; 
    triggerWidth: number | null;
    coords: { top: number; left: number } | null;
} {
    const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
    const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (!open || !triggerRef.current) {
            setTriggerWidth(null);
            setCoords(null);
            return;
        }
        const el = triggerRef.current;
        const measure = () => {
            const rect = el.getBoundingClientRect();
            setTriggerWidth(rect.width);
            
            const spaceBelow = typeof window !== 'undefined' ? window.innerHeight - rect.bottom - GAP : DROPDOWN_MAX_HEIGHT + 1;
            const newPlacement = spaceBelow >= DROPDOWN_MAX_HEIGHT ? 'bottom' : 'top';
            setPlacement(newPlacement);

            // Calculate absolute top/left based on viewport + scroll
            const top = newPlacement === 'bottom' 
                ? rect.bottom + window.scrollY + GAP 
                : rect.top + window.scrollY - GAP;
            
            setCoords({ top, left: rect.left + window.scrollX });
        };
        measure();
        const raf = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(raf);
    }, [open, triggerRef]);

    return { placement, triggerWidth, coords };
}
