import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import { PageHeader } from '@od-erp/ui';
import {
    BookOpen,
    Layers,
} from 'lucide-react';

interface SetupCard {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    route: string;
    permission: string;
    color: string;
}

const AdmissionSetup = () => {
    const navigate = useNavigate();
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const setupCards: SetupCard[] = [
        {
            id: 'admissionMaster',
            title: 'Admission Master',
            description: 'Configure application numbers, stages, fees, tags, sources, seats, counselors, and more.',
            icon: <BookOpen size={32} />,
            route: '/admission/setup/master',
            permission: 'viewAdmissionMaster',
            color: 'from-blue-500 to-blue-600',
        },
        {
            id: 'stagesSetup',
            title: 'Stages Setup',
            description: 'Configure admission stage workflows with custom fields, transaction mapping, and communication templates.',
            icon: <Layers size={32} />,
            route: '/admission/setup/stagesSetup',
            permission: 'viewAdmissionStageSetupList',
            color: 'from-purple-500 to-purple-600',
        },
    ];

    const visibleCards = setupCards.filter(card => permissions.includes(card.permission));

    return (
        <div className="w-full max-w-full font-sans">
            <PageHeader
                title="Admission Setup"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission', href: '/admission' },
                    { label: 'Admission Setup' },
                ]}
                actionButtons={[]}
            />

            <div>
                {/* Cards Grid */}
                {visibleCards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                        {visibleCards.map((card) => (
                            <button
                                key={card.id}
                                onClick={() => navigate(card.route)}
                                className="group relative bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-left hover:shadow-lg hover:border-primary/40 transition-all duration-200 cursor-pointer overflow-hidden"
                            >
                                {/* Top accent line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} rounded-t-xl`} />

                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                    {card.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-2 group-hover:text-primary transition-colors duration-200">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                                    {card.description}
                                </p>

                                {/* Arrow indicator */}
                                <div className="mt-4 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span>Open</span>
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
                            <BookOpen size={28} className="text-[var(--color-muted-foreground)]" />
                        </div>
                        <p className="text-[var(--color-muted-foreground)] font-medium">No setup modules available</p>
                        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">You do not have permission to access any setup modules.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionSetup;
