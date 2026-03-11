import React from 'react';
import { 
    User, 
    Tags, 
    MessageSquare, 
    Clock, 
    Receipt, 
    FileText, 
    CheckSquare, 
    Landmark,
    ArrowRight
} from 'lucide-react';
import { AdmissionLead } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';

interface DetailsSidebarProps {
    selectedItem: string;
    onItemSelect: (_item: string) => void;
    student: AdmissionLead;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    visible: boolean;
}

const DetailsSidebar = ({ selectedItem, onItemSelect, student }: DetailsSidebarProps) => {
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    
    // Check permissions
    const canViewFollowUp = permissions.includes('viewAdmissionStudentData');
    const canMoveStudent = permissions.includes('moveAdmissionStudentDataToEntity');
    
    // Check if student has "Moved to Other" tag
    const hasMovedTag = student.tags?.some((t: any) => 
        (typeof t === 'string' ? t : t.tag) === 'Moved to Other'
    );
    
    // Check stage conditions
    const isFinalStage = ['Approved', 'Rejected', 'Withdrawn'].includes(student.currentStage || '');
    const isApproved = student.currentStage === 'Approved';
    
    // Define menu items with visibility conditions
    const menuItems: MenuItem[] = [
        {
            id: 'Admission Form',
            label: 'Admission',
            icon: <User size={18} />,
            visible: true
        },
        {
            id: 'Tags and Notes',
            label: 'Tags & Notes',
            icon: <Tags size={18} />,
            visible: true
        },
        {
            id: 'Follow Up',
            label: 'Follow Up',
            icon: <MessageSquare size={18} />,
            visible: canViewFollowUp
        },
        {
            id: 'Timeline',
            label: 'Timeline',
            icon: <Clock size={18} />,
            visible: true
        },
        {
            id: 'View Transaction',
            label: 'View Transactions',
            icon: <Receipt size={18} />,
            visible: true
        },
        {
            id: 'View Document',
            label: 'View Document',
            icon: <FileText size={18} />,
            visible: true
        },
        {
            id: 'Verify Document',
            label: 'Verify Document',
            icon: <CheckSquare size={18} />,
            visible: true
        },
        {
            id: 'Move Application',
            label: 'Move Application',
            icon: <ArrowRight size={18} />,
            visible: canMoveStudent && !isFinalStage && !hasMovedTag
        },
        {
            id: 'Bank Details',
            label: 'Bank Details',
            icon: <Landmark size={18} />,
            visible: true
        },
        {
            id: 'Move Student',
            label: 'Move Student',
            icon: <ArrowRight size={18} />,
            visible: canMoveStudent && isApproved && !hasMovedTag
        }
    ];
    
    // Filter visible items
    const visibleItems = menuItems.filter(item => item.visible);
    
    return (
        <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden sticky top-6">
            <div className="bg-primary px-4 py-3">
                <h3 className="text-white font-semibold text-sm">Navigation</h3>
            </div>
            
            <nav className="p-2">
                {visibleItems.map((item) => {
                    const isActive = selectedItem === item.id;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => onItemSelect(item.id)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                                transition-all duration-200 text-left
                                ${isActive 
                                    ? 'bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20' 
                                    : 'text-[var(--color-foreground)] hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)]'
                                }
                            `}
                        >
                            <span className={isActive ? 'text-primary' : 'text-[var(--color-muted-foreground)]'}>
                                {item.icon}
                            </span>
                            <span className="text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default DetailsSidebar;
