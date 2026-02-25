export interface Tab {
    label: string;
    value: string;
}

export interface HorizontalTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (_value: string) => void;
    className?: string;
    fullWidth?: boolean;
}
