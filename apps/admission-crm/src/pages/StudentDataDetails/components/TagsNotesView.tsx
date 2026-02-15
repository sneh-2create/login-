import { useState, useMemo, useEffect } from 'react';
import { AdmissionLead } from '@od-erp/types';
import { useAdmissionMaster, useCounselors, useEditAdmissionStudentData } from '@od-erp/query';
import { useAddAdmissionFollowUp } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { Tags, Save, User } from 'lucide-react';
import { Button } from '@od-erp/ui';
import TimelineView from './TimelineView';
import FollowUpDialog, { FollowUpData } from '../../../components/Dialogs/FollowUpDialog';

interface TagsNotesViewProps {
    student: AdmissionLead;
}

const TagsNotesView = ({ student }: TagsNotesViewProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    
    // Fetch tags from admission master
    const { data: admissionMaster } = useAdmissionMaster(entityId, student?.session || session);
    
    // Fetch counselors
    const { data: counselors = [] } = useCounselors(entityId, 'counselor');
    
    // Mutations
    const editStudentMutation = useEditAdmissionStudentData();
    const addFollowUpMutation = useAddAdmissionFollowUp();
    
    // Local state
    const [selectedNote, setSelectedNote] = useState('');
    const [selectedTagId, setSelectedTagId] = useState('');
    const [selectedCounselorId, setSelectedCounselorId] = useState(student?.counselorId || '');
    const [originalTagId, setOriginalTagId] = useState('');
    const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
    const [pendingTagUpdate, setPendingTagUpdate] = useState<any>(null);
    
    // Get tags list from admission master
    const tagsList = useMemo(() => admissionMaster?.tags || [], [admissionMaster]);
    
    // Find current tag object
    const currentTag = useMemo(() => {
        if (!student?.tags || !Array.isArray(student.tags) || student.tags.length === 0) {
            return null;
        }
        const tagName = student.tags[0]; // Tags stored as array of strings
        return tagsList.find((t: any) => t.tag === tagName) || null;
    }, [student?.tags, tagsList]);
    
    // Set initial selected tag and original tag
    useEffect(() => {
        if (currentTag) {
            setSelectedTagId(currentTag.tag);
            setOriginalTagId(currentTag.tag);
        }
    }, [currentTag]);
    
    // Handle save note
    const handleSaveNote = async () => {
        if (!selectedNote.trim()) {
            return;
        }
        
        const updatedTimeline = [
            ...(student.timeline || []),
            {
                actionType: 'notes',
                date: new Date().toISOString(),
                remark: selectedNote
            }
        ];
        
        try {
            await editStudentMutation.mutateAsync({
                ...student,
                timeline: updatedTimeline,
                entity: entityId,
                session: student.session || session
            });
            setSelectedNote('');
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    };
    
    // Check if tag is positive and changed
    const checkPositiveTagChange = (newTagId: string) => {
        const newTag = tagsList.find((t: any) => t.tag === newTagId);
        
        // Check if it's a positive tag and different from original
        if (newTag && newTag.label === 'positive' && newTagId !== originalTagId) {
            return true;
        }
        return false;
    };
    
    // Handle tag change
    const handleTagChange = (newTagId: string) => {
        setSelectedTagId(newTagId);
        
        // Check if we need to show follow-up dialog
        if (checkPositiveTagChange(newTagId)) {
            const selectedTag = tagsList.find((t: any) => t.tag === newTagId);
            const selectedCounselor = counselors.find((c: any) => c._id === selectedCounselorId);
            
            setPendingTagUpdate({
                tag: selectedTag,
                counselor: selectedCounselor
            });
            setIsFollowUpDialogOpen(true);
        }
    };
    
    // Handle follow-up dialog submit
    const handleFollowUpSubmit = async (followUpData: FollowUpData) => {
        if (!pendingTagUpdate) return;
        
        try {
            // First, save the tag and counselor
            const updates: any = {
                ...student,
                entity: entityId,
                session: student.session || session
            };
            
            if (pendingTagUpdate.tag) {
                updates.tags = [pendingTagUpdate.tag.tag];
            }
            
            if (pendingTagUpdate.counselor) {
                updates.counselorId = pendingTagUpdate.counselor._id;
                updates.counselorName = pendingTagUpdate.counselor.name;
                updates.counselorMobile = pendingTagUpdate.counselor.mobile;
                updates.counselorEmail = pendingTagUpdate.counselor.email;
            }
            
            await editStudentMutation.mutateAsync(updates);
            
            // Then create follow-up
            const [hours, minutes] = followUpData.time.split(':').map(Number);
            const followUpDate = new Date(followUpData.date);
            followUpDate.setHours(hours, minutes, 0, 0);
            
            const followUpPayload = {
                studentData: student._id,
                applicationNumber: student.applicationNumber,
                counselorId: pendingTagUpdate.counselor?._id || student.counselorId,
                counselorName: pendingTagUpdate.counselor?.name || student.counselorName,
                counselorMobile: pendingTagUpdate.counselor?.mobile || student.counselorMobile,
                counselorEmail: pendingTagUpdate.counselor?.email || student.counselorEmail,
                followUpQuery: followUpData.remark,
                followUpDate: followUpDate.toISOString(),
                entity: entityId
            };
            
            await addFollowUpMutation.mutateAsync(followUpPayload);
            
            // Update original tag
            setOriginalTagId(selectedTagId);
            setIsFollowUpDialogOpen(false);
            setPendingTagUpdate(null);
        } catch (error) {
            console.error('Failed to create follow-up:', error);
        }
    };
    
    // Handle follow-up dialog cancel
    const handleFollowUpCancel = () => {
        // Revert to original tag
        setSelectedTagId(originalTagId);
        setIsFollowUpDialogOpen(false);
        setPendingTagUpdate(null);
    };
    
    // Handle update (tags + counselor) - for non-positive tags
    const handleUpdate = async () => {
        const selectedTag = tagsList.find((t: any) => t.tag === selectedTagId);
        const selectedCounselor = counselors.find((c: any) => c._id === selectedCounselorId);
        
        // Check if positive tag - should open dialog instead
        if (checkPositiveTagChange(selectedTagId)) {
            setPendingTagUpdate({
                tag: selectedTag,
                counselor: selectedCounselor
            });
            setIsFollowUpDialogOpen(true);
            return;
        }
        
        const updates: any = {
            ...student,
            entity: entityId,
            session: student.session || session
        };
        
        // Update tags if changed
        if (selectedTag) {
            updates.tags = [selectedTag.tag];
        }
        
        // Update counselor if changed
        if (selectedCounselor) {
            updates.counselorId = selectedCounselor._id;
            updates.counselorName = selectedCounselor.name;
            updates.counselorMobile = selectedCounselor.mobile;
            updates.counselorEmail = selectedCounselor.email;
        }
        
        try {
            await editStudentMutation.mutateAsync(updates);
            setOriginalTagId(selectedTagId);
        } catch (error) {
            console.error('Failed to update:', error);
        }
    };
    
    // Check if student is in terminal stage
    const isTerminalStage = ['Approved', 'Rejected', 'Withdrawn'].includes(student?.currentStage || '');
    
    return (
        <div className="space-y-6">
            {/* Main Content - Note and Tag/Counselor sections */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left Section - Note (8 columns) */}
                <div className="col-span-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Note
                        </label>
                        <div className="flex gap-4">
                            <textarea
                                className="flex-1 min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                placeholder="Enter note..."
                                value={selectedNote}
                                onChange={(e) => setSelectedNote(e.target.value)}
                            />
                            <Button
                                onClick={handleSaveNote}
                                disabled={!selectedNote.trim() || editStudentMutation.isPending}
                                className="h-10 self-end"
                            >
                                <Save size={16} className="mr-2" />
                                Save Note
                            </Button>
                        </div>
                    </div>
                </div>
                
                {/* Right Section - Tags and Counselor (4 columns) */}
                <div className="col-span-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                        {/* Tag Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Add Tags
                            </label>
                            <select
                                value={selectedTagId}
                                onChange={(e) => handleTagChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="">Select Tag</option>
                                {tagsList.map((tag: any) => (
                                    <option key={tag.tag} value={tag.tag}>
                                        {tag.tag}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Tag Display */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Tag
                            </label>
                            <div className="flex items-center justify-center p-4 rounded-lg border border-gray-200 min-h-[60px]">
                                {currentTag || selectedTagId ? (
                                    <div
                                        className="flex items-center gap-3 px-4 py-2 rounded-full"
                                        style={{
                                            backgroundColor: (tagsList.find((t: any) => t.tag === selectedTagId) || currentTag)?.colour || '#e5e7eb'
                                        }}
                                    >
                                        <Tags size={16} className="text-white" />
                                        <span className="text-white font-semibold text-sm uppercase">
                                            {selectedTagId || currentTag?.tag || ''}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm">
                                        Click on add tags button
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Counselor Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Choose Counselor
                            </label>
                            <select
                                value={selectedCounselorId}
                                onChange={(e) => setSelectedCounselorId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="">Select Counselor</option>
                                {counselors.map((counselor: any) => (
                                    <option key={counselor._id} value={counselor._id}>
                                        {counselor.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Update Button */}
                        {!isTerminalStage && (
                            <div className="pt-2">
                                <Button
                                    onClick={handleUpdate}
                                    disabled={editStudentMutation.isPending}
                                    className="w-full"
                                >
                                    <User size={16} className="mr-2" />
                                    Update
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Timeline Section */}
            <div className="bg-white rounded-lg border border-gray-200">
                <TimelineView student={student} />
            </div>
            
            {/* Follow-Up Dialog */}
            <FollowUpDialog
                isOpen={isFollowUpDialogOpen}
                onClose={handleFollowUpCancel}
                onSubmit={handleFollowUpSubmit}
                isLoading={editStudentMutation.isPending || addFollowUpMutation.isPending}
            />
        </div>
    );
};

export default TagsNotesView;
