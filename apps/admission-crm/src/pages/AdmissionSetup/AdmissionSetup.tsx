import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import { PageHeader } from '@od-erp/ui';
import { BookUser, GitBranch, ChevronRight } from 'lucide-react';
import type { SetupCard } from '@od-erp/types';

const AdmissionSetup = () => {
    const navigate = useNavigate();
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const setupCards: SetupCard[] = [
        {
            id: 'admissionMaster',
            title: 'Admission Master',
            description: 'Set up and manage basic admission requirements, terms, and primary application guidelines.',
            icon: <BookUser size={28} />,
            route: '/admission/setup/master',
            permission: 'viewAdmissionMaster',
            linkLabel: 'Configure Master',
        },
        {
            id: 'stagesSetup',
            title: 'Stages Setup',
            description: 'Define step-by-step admission stages, application status workflows, and approval routing.',
            icon: <GitBranch size={28} />,
            route: '/admission/setup/stagesSetup',
            permission: 'viewAdmissionStageSetupList',
            linkLabel: 'Manage Stages',
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

            <div className="mt-6">
                {visibleCards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {visibleCards.map((card) => (
                            <div
                                key={card.id}
                                className="group bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                onClick={() => navigate(card.route)}
                            >
                                {/* Icon box */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                                        color: 'var(--color-primary)',
                                    }}
                                >
                                    {card.icon}
                                </div>

                                {/* Text */}
                                <div className="flex flex-col gap-1 flex-1">
                                    <h3 className="text-base font-bold text-[var(--color-foreground)]">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>

                                {/* Action link */}
                                <div
                                    className="flex items-center gap-1 text-sm font-semibold"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    <span>{card.linkLabel}</span>
                                    <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                            style={{
                                background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                                color: 'var(--color-primary)',
                            }}
                        >
                            <BookUser size={28} />
                        </div>
                        <p className="text-[var(--color-muted-foreground)] font-medium">No setup modules available</p>
                        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                            You do not have permission to access any setup modules.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionSetup;
