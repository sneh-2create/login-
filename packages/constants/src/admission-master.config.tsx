import { 
    Tag,
    Armchair, 
    UserCheck, 
    Users, 
    CalendarDays,
    GitMerge,
    IdCard,
    Layers,
    MessageSquare
} from 'lucide-react';
import type { SetupCard, AdmissionPhase } from '@od-erp/types';

export const ADMISSION_SETUP_CARDS: SetupCard[] = [
    {
        id: 'admissionMaster',
        title: 'Admission Master',
        description: 'Set up and manage basic admission requirements, terms, and primary application guidelines.',
        icon: <IdCard size={28} />,
        route: '/admission/setup/master',
        permission: 'viewAdmissionMaster',
        linkLabel: 'Configure Master',
    },
    {
        id: 'stagesSetup',
        title: 'Stages Setup',
        description: 'Define step-by-step admission stages, application status workflows, and approval routing.',
        icon: <GitMerge size={28} />,
        route: '/admission/setup/stagesSetup',
        permission: 'viewAdmissionStageSetupList',
        linkLabel: 'Manage Stages',
    },
];

export const ADMISSION_PHASES: AdmissionPhase[] = [
    {
        id: 'phase1',
        phaseNumber: 1,
        title: 'CORE ADMISSION SETUP',
        steps: [
            {
                id: 'admissionMaster',
                title: 'Admission Master',
                subtitle: 'Configure automated sequential numbering rules for new student applications.',
                icon: <Layers />,
                permission: 'viewAdmissionMaster',
                component: (_onSuccess) => null,
            }
        ]
    },
    {
        id: 'phase2',
        phaseNumber: 2,
        title: 'ADMISSION ORGANIZATION',
        steps: [
            {
                id: 'tags',
                title: 'Admission Tags',
                subtitle: 'Manage tags to categorize and track admission leads and students.',
                icon: <Tag />, // Icon added
                permission: 'viewAdmissionMaster',
                component: (_onSuccess) => null,
            },
            {
                id: 'seats',
                title: 'Admission Seats',
                subtitle: 'Configure available seat capacity per course, stream, and batch.',
                icon: <Armchair />,
                permission: 'viewAdmissionMaster',
                component: (_onSuccess) => null,
            }
        ]
    },
    {
        id: 'phase3',
        phaseNumber: 3,
        title: 'TEAM & COUNSELOR SETUP',
        steps: [
            {
                id: 'counselorMapper',
                title: 'Counselor Mapper',
                subtitle: 'Map counselors to specific courses, streams, or student groups.',
                icon: <UserCheck />,
                permission: 'viewAdmissionMaster',
                component: (_onSuccess) => null,
            },
            {
                id: 'admissionTeams',
                title: 'Admission Teams',
                subtitle: 'Organize counselors and staff into admission teams.',
                icon: <Users />,
                permission: 'viewAdmissionMaster',
                component: (_onSuccess) => null,
            }
        ]
    },
    {
        id: 'phase4',
        phaseNumber: 4,
        title: 'SYSTEM CONFIGURATION',
        steps: [
            {
                id: 'myOperatorConfig',
                title: 'My Operator Config',
                subtitle: 'Configure My Operator integration settings for communication.',
                icon: <MessageSquare />,
                permission: 'viewAdmissionMaster',
                component: (_onSuccess) => null,
            },
            {
                id: 'minimumAgeMaster',
                title: 'Minimum Age Master',
                subtitle: 'Set minimum age requirements per course/stream for admissions.',
                icon: <CalendarDays />,
                permission: 'updateCourseValidityChecks',
                component: (_onSuccess) => null,
            }
        ]
    }
];
