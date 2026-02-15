import { AdmissionLead } from '@od-erp/types';
import ViewAdmissionDetails from '../../AdmissionStudentData/components/ViewAdmissionDetails';
import TagsNotesView from './TagsNotesView';
import TimelineView from './TimelineView';
import TransactionsView from './TransactionsView';
import DocumentsView from './DocumentsView';
import BankDetailsView from './BankDetailsView';
import FollowUpView from './FollowUpView';
import MoveApplicationView from './MoveApplicationView';
import MoveStudentView from './MoveStudentView';
import VerifyDocumentsView from './VerifyDocumentsView';

interface DetailsContentAreaProps {
    selectedItem: string;
    student: AdmissionLead;
}

const DetailsContentArea = ({ selectedItem, student }: DetailsContentAreaProps) => {
    const renderContent = () => {
        switch (selectedItem) {
            case 'Admission Form':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Admission Form</h3>
                        </div>
                        <div className="p-6">
                            <ViewAdmissionDetails
                                studentId={student._id}
                                onClose={() => {}} // No close needed in page view
                            />
                        </div>
                    </div>
                );
                
            case 'Tags and Notes':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Tags & Notes</h3>
                        </div>
                        <div className="p-6">
                            <TagsNotesView student={student} />
                        </div>
                    </div>
                );
                
            case 'Follow Up':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Follow Up</h3>
                        </div>
                        <div className="p-6">
                            <FollowUpView student={student} />
                        </div>
                    </div>
                );
                
            case 'Timeline':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Timeline</h3>
                        </div>
                        <div className="p-6">
                            <TimelineView student={student} />
                        </div>
                    </div>
                );
                
            case 'View Transaction':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Transactions</h3>
                        </div>
                        <div className="p-6">
                            <TransactionsView student={student} />
                        </div>
                    </div>
                );
                
            case 'View Document':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Documents</h3>
                        </div>
                        <div className="p-6">
                            <DocumentsView student={student} />
                        </div>
                    </div>
                );
                
            case 'Verify Document':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Verify Documents</h3>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <VerifyDocumentsView studentId={student._id} inline={true} />
                        </div>
                    </div>
                );
                
            case 'Bank Details':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Bank Details</h3>
                        </div>
                        <div className="p-6">
                            <BankDetailsView student={student} />
                        </div>
                    </div>
                );
                
            case 'Move Application':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Move Application</h3>
                        </div>
                        <div className="p-6">
                            <MoveApplicationView student={student} />
                        </div>
                    </div>
                );
                
            case 'Move Student':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-primary px-4 py-3 border-b border-gray-200">
                            <h3 className="text-white font-semibold">Move Student</h3>
                        </div>
                        <div className="p-6">
                            <MoveStudentView student={student} />
                        </div>
                    </div>
                );
                
            default:
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg">Select an item from the sidebar</p>
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-[400px]">
            {renderContent()}
        </div>
    );
};

export default DetailsContentArea;
