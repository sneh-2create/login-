import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function getScrollParent(node: HTMLElement | null): HTMLElement {
    if (!node || node === document.body || node === document.documentElement) {
        return document.documentElement;
    }
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
    if (isScrollable && node.scrollHeight > node.clientHeight) {
        return node;
    }
    return getScrollParent(node.parentElement);
}
