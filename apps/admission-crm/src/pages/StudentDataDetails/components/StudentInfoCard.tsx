import { useMemo } from 'react';
import { format } from 'date-fns';
import { Phone, User as UserIcon } from 'lucide-react';
import { AdmissionLead } from '@od-erp/types';
import { useClickToCall } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { Tooltip } from '@od-erp/ui';

interface StudentInfoCardProps {
    student: AdmissionLead;
}

const StudentInfoCard = ({ student }: StudentInfoCardProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const myOperatorId = useAppSelector((state) => state.auth.user?.myOperatorId) || localStorage.getItem('myOperatorId') || '';
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    
    const clickToCallMutation = useClickToCall();
    
    // Check permissions
    const canViewPhone = permissions.includes('viewAdmissionPhoneNumber');
    const canClickToCall = permissions.includes('peerToPeerCallForAdmission');
    
    // Generate photo URL with fallback
    const photoUrl = useMemo(() => {
        if (student.photo) {
            // Handle Google Drive URLs
            if (student.photo.includes('drive.google.com')) {
                const fileIdMatch = student.photo.match(/\/d\/([^/]+)/);
                if (fileIdMatch) {
                    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
                }
            }
            return student.photo;
        }
        
        // Gender-based fallback
        const randomNum = Math.floor(Math.random() * 5) + 1;
        if (student.gender?.toLowerCase() === 'female') {
            return `/assets/avatars/girl${randomNum}.png`;
        }
        return `/assets/avatars/boy${randomNum}.png`;
    }, [student.photo, student.gender]);
    
    // Mask phone number if no permission
    const displayPhone = useMemo(() => {
        if (!student.phone) return '-';
        if (canViewPhone) return student.phone;
        
        // Mask: show last 5 digits
        const phone = student.phone.toString();
        if (phone.length > 5) {
            return '*'.repeat(phone.length - 5) + phone.slice(-5);
        }
        return phone;
    }, [student.phone, canViewPhone]);
    
    // Handle click to call
    const handleClickToCall = async () => {
        if (!student.phone) return;
        
        try {
            const result = await clickToCallMutation.mutateAsync({
                entity: entityId,
                session: session,
                phone: student.phone,
                applicationNumber: student.applicationNumber,
                myOperatorId: myOperatorId
            });
            alert(result.message || 'Call initiated successfully');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to initiate call';
            alert(`Error: ${errorMessage}`);
        }
    };
    
    // Stage color coding with primary colors
    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'Rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'Withdrawn':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            default:
                return 'bg-primary/10 text-primary border-primary/20';
        }
    };
    
    return (
        <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden">
            {/* Horizontal Layout */}
            <div className="flex items-stretch">
                {/* Photo Section - Left Side */}
                <div className="bg-primary/5 p-8 flex items-center justify-center border-r border-[var(--color-border)]">
                    <div className="relative">
                        <img
                            src={photoUrl}
                            alt={student.name || 'Student'}
                            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                            onError={(e) => {
                                // Fallback to default avatar on error
                                e.currentTarget.src = '/assets/avatars/boy1.png';
                            }}
                        />
                        <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2 shadow-md">
                            <UserIcon size={20} className="text-white" />
                        </div>
                    </div>
                </div>
                
                {/* Info Section - Right Side */}
                <div className="flex-1 p-6">
                    <div className="grid grid-cols-4 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Application Number</div>
                                <div className="text-base font-bold text-[var(--color-foreground)]">{student.applicationNumber || '-'}</div>
                                <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                                    {student.date ? format(new Date(student.date), 'dd-MMM-yyyy') : '-'}
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Student Name</div>
                                <div className="text-sm font-semibold text-[var(--color-foreground)]">{student.name || '-'}</div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Date of Birth</div>
                                <div className="text-sm text-[var(--color-foreground)]">
                                    {student.dob ? format(new Date(student.dob), 'dd-MMM-yyyy') : '-'}
                                </div>
                            </div>
                        </div>
                        
                        {/* Column 2 */}
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Father Name</div>
                                <div className="text-sm text-[var(--color-foreground)]">{student.fatherName || '-'}</div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Course</div>
                                <div className="text-sm font-medium text-[var(--color-foreground)]">{student.course || '-'}</div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Stream</div>
                                <div className="text-sm font-medium text-[var(--color-foreground)]">{student.stream || '-'}</div>
                            </div>
                        </div>
                        
                        {/* Column 3 */}
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Receipt Number</div>
                                <div className="text-sm text-[var(--color-foreground)]">{student.receiptNumber || '-'}</div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Phone Number</div>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium text-[var(--color-foreground)]">{displayPhone}</div>
                                    {canClickToCall && student.phone && (
                                        <Tooltip content="Click to Call" placement="top">
                                            <button
                                                onClick={handleClickToCall}
                                                className="p-1.5 rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                                            >
                                                <Phone size={14} />
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Source</div>
                                <div className="text-sm text-[var(--color-foreground)]">{student.source || '-'}</div>
                            </div>
                        </div>
                        
                        {/* Column 4 - Current Stage */}
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Admission Date</div>
                                <div className="text-sm text-[var(--color-foreground)]">
                                    {student.doa ? format(new Date(student.doa), 'dd-MMM-yyyy') : '-'}
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-medium text-[var(--color-muted-foreground)] mb-2">Current Stage</div>
                                <div className={`px-3 py-2 rounded-lg border-2 text-center font-bold text-sm ${getStageColor(student.currentStage || '')}`}>
                                    {student.currentStage || 'Student'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentInfoCard;
