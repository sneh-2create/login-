import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useViewAdmissionStudentData, useAdmissionMaster } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@od-erp/ui';
import StudentInfoCard from './components/StudentInfoCard';
import StageProgressIndicator from './components/StageProgressIndicator';
import DetailsSidebar from './components/DetailsSidebar';
import DetailsContentArea from './components/DetailsContentArea';

const StudentDataDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get navigation context
    const from = (location.state as any)?.from || 'studentData';
    
    // Redux state
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    
    // Local state
    const [selectedItem, setSelectedItem] = useState('Admission Form');
    
    // Fetch student data
    const { data: student, isLoading } = useViewAdmissionStudentData(id || '');
    
    // Fetch admission master (contains stages array) - matches Angular's viewAdmissionMaster
    const { data: admissionMaster } = useAdmissionMaster(entityId, student?.session || session);
    
    
    // Handle back navigation
    const handleBack = () => {
        // Restore filters from localStorage
        const filterData = localStorage.getItem('filterInDetailsPage');
        if (filterData) {
            localStorage.setItem('filterObjectData', filterData);
            localStorage.removeItem('filterInDetailsPage');
        }
        
        // Navigate based on where we came from
        if (from === 'followUps') {
            navigate('/admission/followUps');
        } else if (from === 'admissionLeadLogs') {
            navigate('/admission/admissionLeadLogs');
        } else {
            navigate('/admission/studentData');
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Right-Aligned Back Button */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {student?.applicationNumber || 'Student Details'}
                        </h1>
                        <p className="text-sm text-gray-500">Student Information & Application Status</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="border-primary text-primary hover:bg-primary/10"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Student Data
                    </Button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading student details...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {!isLoading && !student && (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-500 text-lg">Student not found</p>
                        <Button onClick={handleBack} className="mt-4 bg-primary text-white hover:bg-primary/90">
                            Go Back
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!isLoading && student && (
                <div className="p-6 space-y-6">
                    {/* Student Info Card - Horizontal Layout */}
                    <StudentInfoCard student={student} />

                    {/* Stage Progress Indicator - Below Info Card */}
                    <StageProgressIndicator 
                        currentStage={student.currentStage || ''}
                        stages={admissionMaster?.stages || []}
                    />

                    {/* Content Area with Sidebar - Side Panel Layout */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Sidebar */}
                        <div className="col-span-3">
                            <DetailsSidebar
                                selectedItem={selectedItem}
                                onItemSelect={setSelectedItem}
                                student={student}
                            />
                        </div>

                        {/* Content Panel - Right Side */}
                        <div className="col-span-9">
                            <DetailsContentArea
                                selectedItem={selectedItem}
                                student={student}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDataDetails;
