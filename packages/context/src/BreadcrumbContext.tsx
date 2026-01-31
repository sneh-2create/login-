import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

interface BreadcrumbContextType {
    breadcrumbs: BreadcrumbItem[];
    setBreadcrumbs: (_items: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
    breadcrumbs: [],
    setBreadcrumbs: (_items: BreadcrumbItem[]) => { },
});

export const useBreadcrumbs = () => useContext(BreadcrumbContext);

export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

    return (
        <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};
