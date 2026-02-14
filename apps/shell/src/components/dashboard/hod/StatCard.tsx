import { Card, cn } from '@od-erp/ui';
import { LucideIcon } from 'lucide-react';

interface StatItem {
    status: string;
    count: number;
}

interface StatCardProps {
    title: string;
    total: number;
    items?: StatItem[];
    icon: LucideIcon;
    colorTheme?: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'orange';
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    total,
    items = [],
    icon: Icon,
    colorTheme = 'blue',
    className
}) => {

    const themeClasses = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', iconBg: 'bg-blue-100' },
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', iconBg: 'bg-yellow-100' },
        green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', iconBg: 'bg-green-100' },
        red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', iconBg: 'bg-red-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', iconBg: 'bg-purple-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', iconBg: 'bg-orange-100' },
    };

    const theme = themeClasses[colorTheme] || themeClasses.blue;

    return (
        <Card className={cn("p-4 h-full border border-gray-100 shadow-sm transition-all hover:shadow-md", className)}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="text-gray-500 text-sm font-medium">{title}</h4>
                    <span className={cn("text-2xl font-bold mt-1 block", theme.text)}>{total}</span>
                </div>
                <div className={cn("p-2 rounded-lg", theme.iconBg)}>
                    <Icon className={theme.text} size={20} />
                </div>
            </div>

            {items.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{item.status}</span>
                            <span className="font-semibold text-gray-800">{item.count}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};
