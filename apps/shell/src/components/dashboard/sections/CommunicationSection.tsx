import React from 'react';
import { useAppSelector } from '@od-erp/store';
import { useCommunicationDashboardData } from '@od-erp/query';
import { CommunicationCard } from '../communication/CommunicationCard';
import {
    Mail,
    Wrench,
    User,
    ShieldCheck,
    MessageSquare,
    MessageCircle
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const CommunicationSection: React.FC = () => {
    const { permissions, entityDetails } = useAppSelector((state: any) => state.auth);
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';

    const hasPermission = (perm: string) => permissions?.includes(perm);
    const canViewDashboard = hasPermission('communicationDashboard');

    const { data, isLoading } = useCommunicationDashboardData(
        entityId,
        session,
        canViewDashboard && !!entityId && !!session
    );

    if (!canViewDashboard) {
        return (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">You do not have permission to view the Communication Dashboard.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Default values if data is undefined
    const {
        email = 0,
        whatsappService = 0,
        whatsappUtility = 0,
        auth = 0,
        sms = 0,
        whatsappMarketing = 0
    } = data || {};

    const cards = [
        {
            title: 'Email Alerts',
            count: email,
            icon: Mail,
            color: '#41A6ED', // Blue Icon
            bgColor: '#E3F2FD' // Light Blue BG
        },
        {
            title: 'Service Message',
            count: whatsappService,
            icon: Wrench,
            color: '#FCB965', // Orange Icon
            bgColor: '#FFF3E0' // Light Orange BG
        },
        {
            title: 'Utility Message',
            count: whatsappUtility,
            icon: User,
            color: '#FE6C8A', // Pink Icon
            bgColor: '#FCE4EC' // Light Pink BG
        },
        {
            title: 'Authentication Messages',
            count: auth,
            icon: ShieldCheck,
            color: '#9C27B0', // Purple Icon
            bgColor: '#F3E5F5' // Light Purple BG
        },
        {
            title: 'SMS used',
            count: sms,
            icon: MessageSquare,
            color: '#F57F17', // Darker Yellow/Orange for visibility
            bgColor: '#FFFDE7' // Light Yellow BG
        },
        {
            title: 'WhatsApp Marketing Message',
            count: whatsappMarketing,
            icon: MessageCircle,
            color: '#35C87C', // Green Icon
            bgColor: '#E8F5E9' // Light Green BG
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Communication Dashboard</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <CommunicationCard
                        key={index}
                        title={card.title}
                        count={card.count}
                        icon={card.icon}
                        color={card.color}
                        bgColor={card.bgColor}
                    />
                ))}
            </div>
        </div>
    );
};
