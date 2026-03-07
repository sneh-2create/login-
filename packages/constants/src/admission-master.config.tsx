import { GitMerge, IdCard } from 'lucide-react';
import type { SetupCard } from '@od-erp/types';

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
