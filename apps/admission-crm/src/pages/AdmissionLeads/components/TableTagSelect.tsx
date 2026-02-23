import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAdmissionMaster, useEditAdmissionStudentData } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { useToast } from '@od-erp/ui';

interface TableTagSelectProps {
    student: any;
    onTagChange?: (_tag: any) => void;
}

const TableTagSelect: React.FC<TableTagSelectProps> = ({ student, onTagChange }) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const { data: admissionMaster } = useAdmissionMaster(entityId, session);
    const { mutate: updateStudent } = useEditAdmissionStudentData();
    const { showToast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (tag: any) => {
        if (tag.label && tag.label.toLowerCase() === 'positive') {
            setIsOpen(false);
            if (onTagChange) {
                onTagChange(tag);
            }
            return;
        }

        updateStudent({
            id: student._id,
            data: { tag: tag.tag }, 
        }, {
            onSuccess: () => {
                showToast('success', 'Tag updated successfully');
                setIsOpen(false);
                if (onTagChange) {
                    onTagChange(tag);
                }
            }
        });
    };
    
    // Group tags
    const groupedTags = admissionMaster?.tags?.reduce((acc: any, tag: any) => {
        const group = tag.label ? tag.label.toUpperCase() : 'OTHER';
        if (!acc[group]) acc[group] = [];
        acc[group].push(tag);
        return acc;
    }, {});


    // Helper to get tag details from master data
    const getTagDetails = (tagName: string) => {
        return admissionMaster?.tags?.find((t: any) => t.tag === tagName) || { tag: tagName, colour: '#9ca3af' };
    };

    // Determine current tag (handle array of strings or object)
    const currentTagName = Array.isArray(student.tags) && student.tags.length > 0 
        ? student.tags[0] 
        : (student.tag?.tag || student.tag || '');
        
    const currentTag = getTagDetails(currentTagName);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-sm border rounded cursor-pointer min-h-[32px]"
                style={{ 
                    backgroundColor: currentTagName ? `${currentTag.colour}33` : '#fff',
                    borderColor: '#e5e7eb'
                }}
            >
                <span className="truncate">{currentTagName || 'Select Tag'}</span>
                <ChevronDown size={14} className="text-[var(--color-muted-foreground)] ml-1" />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full min-w-[150px] mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md shadow-lg max-h-60 overflow-y-auto left-0">
                    {groupedTags && Object.entries(groupedTags).map(([group, tags]: [string, any]) => (
                        <div key={group}>
                            <div className="px-2 py-1 bg-[var(--color-background)] text-xs font-semibold text-[var(--color-muted-foreground)] uppercase">
                                {group}
                            </div>
                            {tags.map((tag: any) => (
                                <div
                                    key={tag._id}
                                    onClick={() => handleSelect(tag)}
                                    className="px-3 py-2 text-sm hover:bg-[var(--color-background)] cursor-pointer flex items-center gap-2"
                                    style={{ borderLeft: `3px solid ${tag.colour}` }}
                                >
                                    {tag.tag}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TableTagSelect;
