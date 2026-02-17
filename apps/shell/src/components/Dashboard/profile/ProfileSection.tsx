
import React, { useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { useEmployeeDetails, useEmployeeBirthdays, useEmployeeAnnouncements } from '@od-erp/query';
import { ProfileCard } from './ProfileCard';
import { StatCard } from './StatCard';
import { DetailsGrid } from './DetailsGrid';
import { BirthdayList } from './BirthdayList';
import { AnnouncementList } from './AnnouncementList';
import { calculateTotalExperience } from '@od-erp/utils';
import moment from 'moment';

export const ProfileSection: React.FC = () => {
    const { user, entityDetails } = useAppSelector((state) => state.auth);
    const employeeId = user?.employeeId || user?.employee_id || localStorage.getItem('employee') || '';
    const entityId = entityDetails?.id || localStorage.getItem('entityId') || '';

    const { data: profile, isLoading: isLoadingProfile } = useEmployeeDetails(employeeId);
    const { data: birthdays, isLoading: isLoadingBirthdays } = useEmployeeBirthdays(entityId);
    const { data: announcements, isLoading: isLoadingAnnouncements } = useEmployeeAnnouncements(employeeId);

    const experience = useMemo(() => {
        if (profile?.joiningDate && profile?.experience) {
            // Placeholder logic, ideally use a utility function
            return calculateTotalExperience(profile.joiningDate, profile.experience);
        }
        return profile?.experience || '-';
    }, [profile]);

    if (!employeeId) {
        return null;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                {/* Session display can be added here if needed */}
            </div>

            {profile && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left Column: Profile Card */}
                    <div className="xl:col-span-5">
                        <div className="space-y-6 h-full flex flex-col">
                            <ProfileCard profile={profile} loading={isLoadingProfile} />
                        </div>
                    </div>

                    {/* Right Column: Stats Cards */}
                    <div className="xl:col-span-7">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                            <StatCard
                                title="Joining Date"
                                value={profile.joiningDate ? moment(profile.joiningDate).format('DD/MM/YYYY') : '-'}
                                subtitle={profile.employeeId}
                                color="orange"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Designation"
                                value={profile.designation || '-'}
                                subtitle={profile.role?.[0] || '-'}
                                color="blue"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Qualification"
                                value={profile.qualification || '-'}
                                color="green"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Experience"
                                value={experience}
                                color="pink"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />
                        </div>
                    </div>

                    {/* Full Width: Personal Details */}
                    <div className="xl:col-span-12">
                        <DetailsGrid profile={profile} />
                    </div>

                    {/* Bottom Row: Birthdays and Announcements */}
                    <div className="xl:col-span-5">
                        <BirthdayList birthdays={birthdays || []} loading={isLoadingBirthdays} />
                    </div>
                    <div className="xl:col-span-7">
                        <AnnouncementList announcements={announcements || []} loading={isLoadingAnnouncements} />
                    </div>
                </div>
            )}
            {/* Loading State for Profile */}
            {isLoadingProfile && !profile && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                </div>
            )}
        </div>
    );
};
