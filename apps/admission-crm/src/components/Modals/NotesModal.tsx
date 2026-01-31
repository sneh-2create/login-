import { useState } from 'react';
import { AdmissionLead } from '@od-erp/types';
import { useAddAdmissionNote, useAdmissionNote } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@od-erp/ui';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const NotesModal = ({ isOpen, onClose, student }: NotesModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [note, setNote] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

    const { data: notesData, isLoading } = useAdmissionNote({
        entity: entityId,
        session,
        studentId: student?._id,
        pageSize: 100 // Fetch recent notes
    }, isOpen && !!student?._id);

    const addNoteMutation = useAddAdmissionNote();

    const handleSave = async () => {
        if (!note.trim()) return;

        try {
            await addNoteMutation.mutateAsync({
                entity: entityId,
                session,
                studentId: student?._id,
                note,
                noteDate: Date.now()
            });
            setNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Student Info Bar */}
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center text-sm">
                    <div className="flex gap-6">
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">Name</span>
                            <span className="font-semibold text-gray-800">{student.name}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">Application Number</span>
                            <span className="font-semibold text-gray-800">{student.applicationNumber || 'NA'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">Father Name</span>
                            <span className="font-semibold text-gray-800">{student.fatherName || 'NA'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">School Name</span>
                            <span className="font-semibold text-gray-800">{student.schoolName || 'NA'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">Course</span>
                            <span className="font-semibold text-gray-800">{student.course || 'NA'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">Stage</span>
                            <span className="font-semibold text-orange-600">{student.currentStage || 'Lead'}</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="block text-gray-500 text-xs uppercase tracking-wider">Total Notes</span>
                        <span className="text-xl font-bold text-gray-800">{notesData?.totalCount || 0}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                    {/* Add Note Form */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-sm font-semibold mb-3 text-gray-700">Add Note</h3>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs text-gray-500 font-medium mb-1 block">Note</label>
                                <textarea
                                    className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                                    rows={2}
                                    placeholder="Enter note details..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSave}
                                    isLoading={addNoteMutation.isPending}
                                    className="w-24"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Notes List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[300px]">
                        <div className="flex border-b px-4 py-2 bg-gray-50 cursor-pointer">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`text-sm font-semibold px-2 pb-2 -mb-2.5 transition-colors duration-200 outline-none ${viewMode === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Table View
                            </button>
                            <button
                                onClick={() => setViewMode('board')}
                                className={`ml-4 text-sm font-semibold px-2 pb-2 -mb-2.5 transition-colors duration-200 outline-none ${viewMode === 'board' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Board View
                            </button>
                        </div>

                        <div className="p-4">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading notes...</div>
                            ) : notesData?.data?.length ? (
                                viewMode === 'table' ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Note</th>
                                                <th className="px-4 py-3">Created By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {notesData.data.map((item) => (
                                                <tr key={item._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                                        {format(item.noteDate, 'dd-MMM-yyyy hh:mm a')}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-800">{item.note}</td>
                                                    <td className="px-4 py-3 text-gray-500">{item.createdBy || 'Unknown'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {notesData.data.map((item) => (
                                            <div key={item._id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                        {format(item.noteDate, 'dd-MMM-yyyy')}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{format(item.noteDate, 'hh:mm a')}</span>
                                                </div>
                                                <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{item.note}</p>
                                                <div className="text-xs text-gray-500 border-t pt-2 flex justify-between items-center">
                                                    <span>By: {item.createdBy || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12 text-blue-500 font-medium text-sm">
                                    No Notes Found !
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesModal;
