
import { AdmissionLead } from '@od-erp/types';
import { useAdmissionMaster } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { Tags as TagsIcon, MessageSquare } from 'lucide-react';

interface TagsAndNotesViewProps {
    student: AdmissionLead;
}

const TagsAndNotesView = ({ student }: TagsAndNotesViewProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const { data: admissionMaster } = useAdmissionMaster(entityId, student?.session || '');
    
    // Get tag colors
    const getTagColor = (tagName: string) => {
        const tagObj = admissionMaster?.tags?.find((t: any) => (t.tag || t) === tagName);
        return tagObj?.colour || '#3b82f6';
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tags & Notes</h2>
                
                {/* Current Tags */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <TagsIcon size={16} />
                        Current Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {student.tags && student.tags.length > 0 ? (
                            student.tags.map((tag: any, index: number) => {
                                const tagName = typeof tag === 'string' ? tag : tag.tag;
                                return (
                                    <span
                                        key={index}
                                        className="px-4 py-2 rounded-lg text-white font-semibold shadow-sm"
                                        style={{ backgroundColor: getTagColor(tagName) }}
                                    >
                                        {tagName}
                                    </span>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 text-sm">No tags assigned</p>
                        )}
                    </div>
                </div>
                
                {/* Official Remark */}
                {student.officialRemark && (
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <MessageSquare size={16} />
                            Official Remark
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-700">{student.officialRemark}</p>
                        </div>
                    </div>
                )}
                
                {/* Tag History (if available) */}
                {student.tagHistory && student.tagHistory.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tag History</h3>
                        <div className="space-y-2">
                            {student.tagHistory.map((item: any, index: number) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="px-3 py-1 rounded text-white text-sm font-semibold"
                                            style={{ backgroundColor: getTagColor(item.tag) }}
                                        >
                                            {item.tag}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    {item.remark && (
                                        <p className="text-sm text-gray-600 mt-2">{item.remark}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagsAndNotesView;
