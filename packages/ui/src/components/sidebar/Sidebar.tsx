import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useMenu } from '@od-erp/store';
import { cn } from '../../utils.ts';
import { getIconSrc } from './iconMapping';
import { LayoutDashboard } from 'lucide-react';

interface SidebarProps {
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const location = useLocation();
    const { menuItems } = useMenu();

    return (
        <div
            className={cn(
                "bg-white h-screen shadow-[0px_0px_20px_0px_rgba(76,87,125,0.02)] transition-all duration-300 z-20 flex flex-col fixed left-0 top-[80px] pb-20",
                "w-[100px]",
                className
            )}
            style={{ height: 'calc(100vh - 80px)' }}
        >
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 scrollbar-hide">
                <ul className="flex flex-col gap-1 items-center w-full">
                    {menuItems && menuItems.map((item: any) => {
                        const isActive = location.pathname === item.page || (item.page !== '/' && location.pathname.startsWith(`${item.page}`));
                        const iconSrc = getIconSrc(item.title, isActive);

                        return (
                            <li key={item.id || item.title} className="w-full px-2">
                                <NavLink
                                    to={item.page || '#'}
                                    className={({ isActive: linkActive }) => cn(
                                        "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 gap-1 min-h-[70px] cursor-pointer",
                                        (isActive || linkActive)
                                            ? "bg-[#f2ebf8] text-[#9C41ED]"
                                            : "text-[#646c9a] hover:bg-[#f8f9fa] hover:text-[#5d78ff]"
                                    )}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        {iconSrc ? (
                                            <lord-icon
                                                src={iconSrc}
                                                trigger="hover"
                                                colors={`primary:${(isActive) ? '#9C41ED' : '#646c9a'}`}
                                                style={{ width: '30px', height: '30px' }}
                                            />
                                        ) : (
                                            <LayoutDashboard className="w-6 h-6" />
                                        )}
                                    </div>

                                    <span className={cn(
                                        "text-[11px] text-center leading-tight tracking-wide font-medium",
                                        (isActive) ? "font-bold" : ""
                                    )}>
                                        {item.title}
                                    </span>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};
