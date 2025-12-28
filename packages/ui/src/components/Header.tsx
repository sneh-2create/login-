import React, { useState } from 'react';
import { useSession } from '@od-erp/store';
import { User } from 'lucide-react';
import { cn } from '../utils.ts';

interface HeaderProps {
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
    const { session } = useSession();
    const [showQuickActions, setShowQuickActions] = useState(false);

    const entityName = session?.user?.name || "OD ERP";
    const quickActionIcon = "https://cdn.lordicon.com/mwzdatpw.json";

    return (
        <header
            className={cn(
                "h-[80px] bg-white shadow-sm flex items-center justify-between px-6 fixed top-0 left-0 w-full z-30 transition-all duration-300",
                className
            )}
        >
            <div className="flex items-center gap-4">
                <div className="w-[180px] flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#9C41ED]">OD ERP</span>
                </div>

                <h3 className="text-lg font-medium text-[#6c7293] hidden md:block cursor-pointer hover:text-[#9C41ED] transition-colors">
                    {entityName}
                </h3>

                {/* Horizontal Menu (Legacy Parity) */}
                <nav className="hidden lg:flex items-center gap-6 pl-8">
                    {['Fee', 'Advanced', 'Analytics', 'Admission'].map((item) => (
                        <div key={item} className="group relative cursor-pointer">
                            <span className="text-[13px] font-medium text-[#6c7293] group-hover:text-[#9C41ED] transition-colors uppercase tracking-wide">
                                {item}
                            </span>
                            {/* Active/Hover Indicator Line (Optional) */}
                            <span className="absolute -bottom-[29px] left-0 w-full h-[2px] bg-[#9C41ED] scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        </div>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center px-4 py-2 bg-gray-50 rounded-full text-sm text-[#6c7293] font-medium border border-gray-100">
                    2024-2025
                </div>

                <button
                    className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-bold text-[#9C41ED] border border-[#9C41ED] rounded-md hover:bg-[#9C41ED] hover:text-white transition-all uppercase tracking-wide"
                >
                    Create Ticket
                </button>

                <div
                    className="relative cursor-pointer w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                    onMouseEnter={() => setShowQuickActions(true)}
                    onMouseLeave={() => setShowQuickActions(false)}
                >
                    <lord-icon
                        src={quickActionIcon}
                        trigger="hover"
                        colors="primary:#9C41ED,secondary:#9C41ED"
                        style={{ width: '30px', height: '30px' }}
                    />

                    {showQuickActions && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-xl rounded-lg border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 origin-top-right">
                            <h5 className="text-sm font-bold text-gray-800 mb-2 border-b pb-2">Quick Actions</h5>
                            <div className="space-y-2">
                                <div className="p-2 hover:bg-gray-50 rounded cursor-pointer flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xs">IS</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">Institute Setup</p>
                                        <p className="text-[10px] text-gray-500">Informative Details</p>
                                    </div>
                                </div>
                                <div className="p-2 hover:bg-gray-50 rounded cursor-pointer flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xs">FS</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">Fee Structure</p>
                                        <p className="text-[10px] text-gray-500">Fee Details</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="ml-2 w-10 h-10 rounded-full bg-[#f2ebf8] flex items-center justify-center text-[#9C41ED] hover:bg-[#9C41ED] hover:text-white transition-colors cursor-pointer">
                    <User size={20} />
                </div>
            </div>
        </header>
    );
};
