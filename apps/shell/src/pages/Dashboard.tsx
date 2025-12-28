import React from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, BookOpen, FileText, Briefcase, Settings } from 'lucide-react';

interface ModuleCard {
    title: string;
    description: string;
    path: string;
    icon: React.ReactNode;
    color: string;
}

const modules: ModuleCard[] = [
    {
        title: 'Admission CRM',
        description: 'Manage student admissions, leads, and follow-ups',
        path: '/admission',
        icon: <Users size={32} />,
        color: 'bg-blue-500',
    },
    {
        title: 'Fee Module',
        description: 'Handle fee collection, invoices, and payments',
        path: '/fee',
        icon: <DollarSign size={32} />,
        color: 'bg-green-500',
    },
    {
        title: 'Academic Module',
        description: 'Manage courses, schedules, and curriculum',
        path: '/academic',
        icon: <BookOpen size={32} />,
        color: 'bg-purple-500',
    },
    {
        title: 'Exam/COE',
        description: 'Examination controller and result processing',
        path: '/exam',
        icon: <FileText size={32} />,
        color: 'bg-orange-500',
    },
    {
        title: 'HRM',
        description: 'Employee management and payroll',
        path: '/hrm',
        icon: <Briefcase size={32} />,
        color: 'bg-indigo-500',
    },
    {
        title: 'Back Office',
        description: 'System configuration and administration',
        path: '/back-office',
        icon: <Settings size={32} />,
        color: 'bg-gray-500',
    },
];

export const Dashboard: React.FC = () => {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome to OD ERP</h1>
                <p className="text-gray-600 mt-2">Select a module to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <Link
                        key={module.path}
                        to={module.path}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                    >
                        <div className={`${module.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4`}>
                            {module.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                        <p className="text-gray-600 text-sm">{module.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};
