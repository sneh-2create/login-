import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppSelector } from '@od-erp/store';
import {
    PageHeader,
    PageToolbar,
    ActionButton,
    Button,
    Input,
    SelectSingle,
    EditableTable,
    EditableTableColumn,
    useToast,
    useStepOrchestrator,
} from '@od-erp/ui';
import { Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useAdmissionMaster, useCounselors } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

// ── Types ──────────────────────────────────────────────────────────────────

interface EmployeeDetail {
    employeeId: string;
    employeeName: string;
    employee: string;   // _id
    mobile: string;
    email: string;
}

const EMPTY_EMPLOYEE: EmployeeDetail = {
    employeeId: '',
    employeeName: '',
    employee: '',
    mobile: '',
    email: '',
};

interface TeamRow {
    name: string;
    leadDetails: EmployeeDetail;
    memberDetails: EmployeeDetail[];
}

const EMPTY_TEAM = (): TeamRow => ({
    name: '',
    leadDetails: { ...EMPTY_EMPLOYEE },
    memberDetails: [],
});

// ── Component ──────────────────────────────────────────────────────────────

const AdmissionTeams: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const { registerSaveHandler, setFooterLeftActions, setIsLoading } = useStepOrchestrator();

    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    const [teams, setTeams] = useState<TeamRow[]>([]);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);
    const { data: counselorList = [], isLoading: counselorsLoading } = useCounselors(entityId, 'counselor');

    // Build SelectSingle options: label = "name-employeeId", value = _id
    const counselorOptions = useMemo(() =>
        counselorList.map((emp: any) => ({
            value: emp._id as string,
            label: `${emp.name}-${emp.employeeId}`,
        })),
        [counselorList]
    );

    // Helper: resolve full EmployeeDetail from _id
    const resolveEmployee = (id: string): EmployeeDetail => {
        const emp = counselorList.find((e: any) => e._id === id);
        if (!emp) return { ...EMPTY_EMPLOYEE };
        return {
            employeeId: emp.employeeId || '',
            employeeName: emp.name || '',
            employee: emp._id || '',
            mobile: emp.mobile || '',
            email: emp.email || '',
        };
    };

    // Matches Angular's viewAdmissionMaster() hydration
    useEffect(() => {
        if (admissionMaster?.teams && counselorList.length > 0) {
            const hydrated: TeamRow[] = admissionMaster.teams.map((item: any) => ({
                name: item.name || '',
                leadDetails: item.leadDetails || { ...EMPTY_EMPLOYEE },
                memberDetails: (item.memberDetails || []).map((m: any) => ({ ...m })),
            }));
            setTeams(hydrated);
        } else if (admissionMaster && !admissionMaster.teams?.length) {
            setTeams([]);
        }
    }, [admissionMaster, counselorList]);

    // Duplicate check
    const isDuplicateName = (name: string, index: number) =>
        !!name && teams.some((t, i) => i !== index && t.name === name);

    // Validation
    const hasEmptyTeams = () =>
        teams.some(t => !t.name.trim() || !t.leadDetails.employeeName);

    const validateTeams = (): boolean => {
        for (const team of teams) {
            if (!team.name.trim()) {
                showToast('error', 'Please add team name first');
                return false;
            }
            if (!team.leadDetails.employeeName) {
                showToast('error', 'Please select a lead for the team');
                return false;
            }
            if (!team.memberDetails || team.memberDetails.length === 0) {
                showToast('error', 'Please add at least one member to the team');
                return false;
            }
            for (const member of team.memberDetails) {
                if (!member.employeeName) {
                    showToast('error', 'Please select a member for each member row or remove empty ones');
                    return false;
                }
            }
        }
        return true;
    };

    // Actions
    const addTeam = useCallback(() => {
        if (hasEmptyTeams()) {
            showToast('error', 'Please complete existing teams (name + lead) before adding a new one');
            return;
        }
        setTeams(prev => [...prev, EMPTY_TEAM()]);
    }, [teams, showToast]);

    const removeTeam = useCallback((index: number) => {
        if (!window.confirm('Are you sure you want to delete this team?')) return;
        setTeams(prev => prev.filter((_, i) => i !== index));
    }, []);

    const onTeamNameChange = (value: string, index: number) => {
        if (isDuplicateName(value, index)) {
            showToast('error', 'Duplicate team name is not allowed');
            setTeams(prev => prev.map((t, i) => i === index ? { ...t, name: '' } : t));
            return;
        }
        setTeams(prev => prev.map((t, i) => i === index ? { ...t, name: value } : t));
    };

    const onLeadChange = (empId: string, teamIndex: number) => {
        const details = resolveEmployee(empId);
        setTeams(prev => prev.map((t, i) =>
            i === teamIndex ? { ...t, leadDetails: details } : t
        ));
    };

    const removeMember = (teamIndex: number, memberIndex: number) => {
        setTeams(prev => prev.map((t, i) => {
            if (i !== teamIndex) return t;
            const updated = t.memberDetails.filter((_, mi) => mi !== memberIndex)
                .filter(m => m.employeeId);
            return { ...t, memberDetails: updated };
        }));
    };

    const getMemberOptions = (team: TeamRow, currentMemberIndex: number) => {
        const usedIds = new Set(
            team.memberDetails
                .filter((_, i) => i !== currentMemberIndex)
                .map(m => m.employee)
                .filter(Boolean)
        );
        return counselorOptions.filter(opt => !usedIds.has(opt.value));
    };

    // Save
    const handleSave = useCallback(async (options?: { navigateNext?: boolean }) => {
        if (!validateTeams()) return;
        setIsLoading(true);
        try {
            const filteredTeams = teams.map(t => ({
                name: t.name,
                leadDetails: t.leadDetails,
                memberDetails: t.memberDetails,
            }));
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                teams: filteredTeams,
            });
            showToast('success', 'Teams updated successfully');
            refetch();
            if (onSuccess) onSuccess(options?.navigateNext);
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setIsLoading(false);
        }
    }, [entityId, session, teams, refetch, onSuccess, setIsLoading, showToast, validateTeams]);

    // Register save handler with Orchestrator
    useEffect(() => {
        if (isEmbedded) {
            registerSaveHandler(handleSave);
        }
    }, [isEmbedded, handleSave, registerSaveHandler]);

    // Register Footer Left Actions
    useEffect(() => {
        if (isEmbedded && canEdit) {
            setFooterLeftActions(
                <Button 
                    variant="soft-primary" 
                    onClick={addTeam} 
                    className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5 font-bold rounded-md transition-all shadow-sm"
                >
                    <Plus size={18} /> Add New Team
                </Button>
            );
        } else {
            setFooterLeftActions(null);
        }
    }, [isEmbedded, canEdit, setFooterLeftActions, addTeam]);

    // Columns Definition
    const columns = useMemo<EditableTableColumn<TeamRow>[]>(() => {
        const cols: EditableTableColumn<TeamRow>[] = [
            {
                header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Team Name <span className="text-red-500">*</span></span>,
                width: '20%',
                cell: (row, i) => (
                    <Input
                        value={row.name}
                        onChange={e => onTeamNameChange(e.target.value, i)}
                        placeholder="Team Name"
                        maxLength={90}
                        disabled={!canEdit}
                        className="h-10 border-[var(--color-border)] rounded-lg"
                        containerClassName="!m-0"
                    />
                ),
            },
            {
                header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Team Lead <span className="text-red-500">*</span></span>,
                width: '25%',
                cell: (row, i) => (
                    <SelectSingle
                        value={row.leadDetails.employee || ''}
                        options={counselorOptions}
                        placeholder="Select Lead"
                        onChange={val => onLeadChange(String(val), i)}
                        disabled={!canEdit}
                        containerClassName="w-full relative z-[50]"
                        className="h-10 border-[var(--color-border)] rounded-lg"
                    />
                ),
            },
            {
                header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Members</span>,
                width: '50%',
                cell: (row, teamIndex) => (
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Member Chips */}
                        {row.memberDetails.filter(m => m.employee).map((member, memberIndex) => (
                            <div key={memberIndex} className="inline-flex items-center gap-1.5 bg-primary/5 text-primary px-2 py-1 rounded pl-1 border border-primary/10">
                                {/* Initial Block */}
                                <div className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                                    {member.employeeName?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-medium">{member.employeeName}</span>
                                {canEdit && (
                                    <button
                                        onClick={() => removeMember(teamIndex, memberIndex)}
                                        className="text-primary/40 hover:text-primary ml-1"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Dropdown for adding members */}
                        {canEdit && (
                            <div className="min-w-[150px] relative">
                                <SelectSingle
                                    // Use '' so the dropdown resets to placeholder after selection
                                    value={''}
                                    options={getMemberOptions(row, -1)}
                                    placeholder="Add member..."
                                    onChange={val => {
                                        if (!val) return;
                                        const details = resolveEmployee(String(val));
                                        setTeams(prev => prev.map((t, ti) => {
                                            if (ti !== teamIndex) return t;
                                            // Make sure we only add valid members
                                            if (details.employee) {
                                              return { ...t, memberDetails: [...t.memberDetails, details] };
                                            }
                                            return t;
                                        }));
                                    }}
                                    disabled={!canEdit}
                                    containerClassName="w-[180px] relative z-[99]"
                                />
                            </div>
                        )}
                    </div>
                ),
            },
        ];

        if (canEdit) {
            cols.push({
                header: '',
                width: 60,
                cell: (_, i) => (
                    <div className="flex justify-center">
                        <Button
                            variant="soft-danger"
                            size="icon"
                            onClick={() => removeTeam(i)}
                            className="rounded-lg transition-all duration-200 border-none shadow-none hover:bg-red-100"
                            title="Delete team"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                ),
            });
        }
        
        return cols;
    }, [counselorOptions, canEdit, getMemberOptions, onLeadChange, onTeamNameChange, removeMember, removeTeam, resolveEmployee]);

    const isDataLoading = isLoading || counselorsLoading;

    const actionButtons: ActionButton[] = [{
        icon: RefreshCw,
        onClick: () => refetch(),
        title: 'Refresh',
        className: 'text-primary hover:bg-primary/10',
        isVisible: true,
        iconClass: isDataLoading ? 'animate-spin' : '',
        variant: 'outline',
    }];

    return (
        <div className="w-full font-sans">
            {!isEmbedded && (
                <PageHeader
                    title="Admission Teams"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admission Setup', href: '/admission/setup' },
                        { label: 'Admission Master', href: '/admission/setup/master' },
                        { label: 'Admission Teams' },
                    ]}
                    actionButtons={actionButtons}
                />
            )}

            {!isEmbedded && (
                <PageToolbar
                    actions={actionButtons}
                    extraContent={
                        canEdit ? (
                            <Button variant="outline" onClick={addTeam} className="flex items-center gap-1.5">
                                <Plus size={15} /> Add Team
                            </Button>
                        ) : undefined
                    }
                />
            )}

            {isDataLoading ? (
                <div className="flex justify-center items-center py-16 text-[var(--color-muted-foreground)]">
                    <RefreshCw size={20} className="animate-spin mr-2" /> Loading…
                </div>
            ) : teams.length === 0 && !isEmbedded ? (
                <div className="text-center py-16 text-[var(--color-muted-foreground)] text-sm">
                    No teams configured yet.
                </div>
            ) : (
                <EditableTable
                    columns={columns}
                    data={teams}
                    isLoading={isDataLoading}
                    emptyMessage="No teams configured yet."
                    className={isEmbedded ? '' : 'mt-3'}
                    minWidth={950}
                    showPagination={false}
                />
            )}

            {!isDataLoading && canEdit && !isEmbedded && (
                <div className="flex justify-end mt-8">
                    <Button 
                        variant="primary" 
                        onClick={() => handleSave()} 
                        disabled={isDataLoading} 
                        className="flex items-center gap-2 px-10 h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        <Save size={18} /> Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdmissionTeams;
