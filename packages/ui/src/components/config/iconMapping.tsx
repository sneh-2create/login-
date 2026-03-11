
import React from 'react';
import {
    LayoutDashboard,
    Building2,
    HelpCircle,
    FileText,
    BarChart3,
    Coins,
    Users,
    GraduationCap,
    BookOpen,
    Library,
    Calendar
} from 'lucide-react';

export const iconMapping: { [key: string]: React.ReactNode } = {
    'flaticon3-house': <LayoutDashboard size={20} />,
    'flaticon2-list-2': <Building2 size={20} />,
    'flaticon-coins': <Coins size={20} />,
    'flaticon3-graduated': <GraduationCap size={20} />,
    'flaticon-notepad': <FileText size={20} />,
    'flaticon2-graphic': <BarChart3 size={20} />,
    'flaticon-interface-10': <Users size={20} />,
    'flaticon3-calendar': <Calendar size={20} />,
    'flaticon3-team': <Users size={20} />,
    'flaticon-folder-1': <BookOpen size={20} />,
    'flaticon2-open-text-book': <Library size={20} />,
    'flaticon-information': <HelpCircle size={20} />,
    // Add defaults and fallbacks
    'default': <LayoutDashboard size={20} />
};

export const getIcon = (iconName: string): React.ReactNode => {
    return iconMapping[iconName] || iconMapping['default'];
};
