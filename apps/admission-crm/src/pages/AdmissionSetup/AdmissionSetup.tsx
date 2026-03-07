import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, SetupCard } from '@od-erp/ui';
import { IdCard } from 'lucide-react';
import { ADMISSION_SETUP_CARDS } from '@od-erp/constants';

const AdmissionSetup = () => {
    const navigate = useNavigate();
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const visibleCards = ADMISSION_SETUP_CARDS.filter(card => permissions.includes(card.permission));

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {visibleCards.map((card) => (
                            <SetupCard
                                key={card.id}
                                card={card}
                                onClick={() => navigate(card.route)}
                            />
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
                            <IdCard size={28} />
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
