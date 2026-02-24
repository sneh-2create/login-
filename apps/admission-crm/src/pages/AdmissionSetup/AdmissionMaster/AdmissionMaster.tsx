import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import { PageHeader } from '@od-erp/ui';
import {
    Hash,
    Layers,
    Receipt,
    CreditCard,
    Tag,
    MapPin,
    Armchair,
    UserCheck,
    Copy,
    Settings,
    Users,
    CalendarDays,
} from 'lucide-react';

interface MasterCard {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    route: string;
    permission: string;
    color: string;
}

const AdmissionMaster = () => {
    const navigate = useNavigate();
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const masterCards: MasterCard[] = [
        {
            id: 'applicationNumber',
            title: 'Application Number Setup',
            description: 'Configure the format and sequence of admission application numbers.',
            icon: <Hash size={28} />,
            route: '/admission/setup/master/applicationNumber',
            permission: 'viewAdmissionMaster',
            color: 'from-blue-500 to-blue-600',
        },
        {
            id: 'stages',
            title: 'Stages Master Setup',
            description: 'Define and manage the master list of admission pipeline stages.',
            icon: <Layers size={28} />,
            route: '/admission/setup/master/stages',
            permission: 'viewAdmissionMaster',
            color: 'from-violet-500 to-violet-600',
        },
        {
            id: 'txnReceipt',
            title: 'Transaction Receipt Setup',
            description: 'Customize the layout and content of admission transaction receipts.',
            icon: <Receipt size={28} />,
            route: '/admission/setup/master/txnReceipt',
            permission: 'viewAdmissionMaster',
            color: 'from-emerald-500 to-emerald-600',
        },
        {
            id: 'admissionHead',
            title: 'Admission Heads',
            description: 'Configure fee heads used for categorizing admission transactions.',
            icon: <CreditCard size={28} />,
            route: '/admission/setup/master/admissionHead',
            permission: 'viewAdmissionMaster',
            color: 'from-amber-500 to-amber-600',
        },
        {
            id: 'tags',
            title: 'Admission Tags',
            description: 'Manage tags to categorize and track admission leads and students.',
            icon: <Tag size={28} />,
            route: '/admission/setup/master/tags',
            permission: 'viewAdmissionMaster',
            color: 'from-pink-500 to-pink-600',
        },
        {
            id: 'source',
            title: 'Admission Source',
            description: 'Define sources from which admission leads are captured.',
            icon: <MapPin size={28} />,
            route: '/admission/setup/master/source',
            permission: 'viewAdmissionMaster',
            color: 'from-cyan-500 to-cyan-600',
        },
        {
            id: 'seats',
            title: 'Admission Seats',
            description: 'Configure available seat capacity per course, stream, and batch.',
            icon: <Armchair size={28} />,
            route: '/admission/setup/master/seats',
            permission: 'viewAdmissionMaster',
            color: 'from-teal-500 to-teal-600',
        },
        {
            id: 'counselorMapper',
            title: 'Counselor Mapper',
            description: 'Map counselors to specific courses, streams, or student groups.',
            icon: <UserCheck size={28} />,
            route: '/admission/setup/master/counselorMapper',
            permission: 'viewAdmissionMaster',
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            id: 'duplicateFields',
            title: 'Duplicate Fields Master',
            description: 'Configure which fields are checked to detect duplicate admissions.',
            icon: <Copy size={28} />,
            route: '/admission/setup/master/duplicateFields',
            permission: 'viewAdmissionMaster',
            color: 'from-orange-500 to-orange-600',
        },
        {
            id: 'myOperatorConfig',
            title: 'My Operator Config',
            description: 'Configure My Operator integration settings for communication.',
            icon: <Settings size={28} />,
            route: '/admission/setup/master/myOperatorConfig',
            permission: 'viewAdmissionMaster',
            color: 'from-slate-500 to-slate-600',
        },
        {
            id: 'admissionTeams',
            title: 'Admission Teams',
            description: 'Organize counselors and staff into admission teams.',
            icon: <Users size={28} />,
            route: '/admission/setup/master/admissionTeams',
            permission: 'viewAdmissionMaster',
            color: 'from-rose-500 to-rose-600',
        },
        {
            id: 'minimumAgeMaster',
            title: 'Minimum Age Master',
            description: 'Set minimum age requirements per course/stream for admissions.',
            icon: <CalendarDays size={28} />,
            route: '/admission/setup/master/minimumAgeMaster',
            permission: 'updateCourseValidityChecks',
            color: 'from-lime-500 to-lime-600',
        },
    ];

    const visibleCards = masterCards.filter(card => permissions.includes(card.permission));

    return (
        <div className="w-full max-w-full font-sans">
            <PageHeader
                title="Admission Master"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission', href: '/admission' },
                    { label: 'Admission Setup', href: '/admission/setup' },
                    { label: 'Admission Master' },
                ]}
                actionButtons={[]}
            />

            <div>
                {visibleCards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-4">
                        {visibleCards.map((card) => (
                            <button
                                key={card.id}
                                onClick={() => navigate(card.route)}
                                className="group relative bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-left hover:shadow-lg hover:border-primary/40 transition-all duration-200 cursor-pointer overflow-hidden"
                            >
                                {/* Top accent line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} rounded-t-xl`} />

                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} text-white mb-3 group-hover:scale-110 transition-transform duration-200`}>
                                    {card.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-1.5 group-hover:text-primary transition-colors duration-200">
                                    {card.title}
                                </h3>
                                <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                                    {card.description}
                                </p>

                                {/* Arrow indicator */}
                                <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span>Configure</span>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center mt-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-background)] flex items-center justify-center mb-4">
                            <Settings size={28} className="text-[var(--color-muted-foreground)]" />
                        </div>
                        <p className="text-[var(--color-muted-foreground)] font-medium">No master modules available</p>
                        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">You do not have permission to access any master setup modules.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionMaster;
