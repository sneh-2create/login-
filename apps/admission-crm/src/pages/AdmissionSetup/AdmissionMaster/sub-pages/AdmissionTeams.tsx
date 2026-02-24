import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import {
    PageHeader,
    PageToolbar,
    ActionButton,
    Button,
    Input,
    SelectSingle,
    useToast,
} from '@od-erp/ui';
import { Plus, RefreshCw, Save, Trash2, UserPlus } from 'lucide-react';
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

const AdmissionTeams = () => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    const [teams, setTeams] = useState<TeamRow[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);
    const { data: counselorList = [], isLoading: counselorsLoading } = useCounselors(entityId, 'counselor');

    // Build SelectSingle options: label = "name-employeeId", value = _id
    // Matches Angular's employeeOptionList (array of names) — we use _id as value for correctness
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

    // ── Duplicate check — matches Angular's isDuplicateTeams()
    const isDuplicateName = (name: string, index: number) =>
        !!name && teams.some((t, i) => i !== index && t.name === name);

    // ── Validation — matches Angular's hasEmptyTeams()
    const hasEmptyTeams = () =>
        teams.some(t => !t.name.trim() || !t.leadDetails.employeeName);

    // ── Validation — matches Angular's hasEmptyMemberDetail(teamIndex)
    const hasEmptyMemberDetail = (teamIndex: number) =>
        teams[teamIndex]?.memberDetails.some(m => !m.employeeName);

    // ── Validate all — matches Angular's validateTeams()
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

    // ── Add Team — matches Angular's addTeams()
    const addTeam = () => {
        if (hasEmptyTeams()) {
            showToast('error', 'Please complete existing teams (name + lead) before adding a new one');
            return;
        }
        setTeams(prev => [...prev, EMPTY_TEAM()]);
    };

    // ── Remove Team — matches Angular's removeTeams(index)
    const removeTeam = (index: number) => {
        if (!window.confirm('Are you sure you want to delete this team?')) return;
        setTeams(prev => prev.filter((_, i) => i !== index));
    };

    // ── Team name change — matches Angular's onTeamsNameChange()
    const onTeamNameChange = (value: string, index: number) => {
        if (isDuplicateName(value, index)) {
            showToast('error', 'Duplicate team name is not allowed');
            setTeams(prev => prev.map((t, i) => i === index ? { ...t, name: '' } : t));
            return;
        }
        setTeams(prev => prev.map((t, i) => i === index ? { ...t, name: value } : t));
    };

    // ── Select Lead — matches Angular's selectReceivedData(event, team)
    const onLeadChange = (empId: string, teamIndex: number) => {
        const details = resolveEmployee(empId);
        setTeams(prev => prev.map((t, i) =>
            i === teamIndex ? { ...t, leadDetails: details } : t
        ));
    };

    // ── Add Member — matches Angular's addMemberDetail(teamIndex)
    const addMember = (teamIndex: number) => {
        if (hasEmptyMemberDetail(teamIndex)) {
            showToast('error', 'Please fill existing member rows before adding a new one');
            return;
        }
        setTeams(prev => prev.map((t, i) => {
            if (i !== teamIndex) return t;
            return { ...t, memberDetails: [...t.memberDetails, { ...EMPTY_EMPLOYEE }] };
        }));
    };

    // ── Remove Member — matches Angular's removeMemberDetail(teamIndex, subIndex)
    const removeMember = (teamIndex: number, memberIndex: number) => {
        setTeams(prev => prev.map((t, i) => {
            if (i !== teamIndex) return t;
            const updated = t.memberDetails.filter((_, mi) => mi !== memberIndex)
                .filter(m => m.employeeId); // Angular: filter out empty employeeId entries
            return { ...t, memberDetails: updated };
        }));
    };

    // ── Select Member — matches Angular's selectReceivedData1()
    const onMemberChange = (empId: string, teamIndex: number, memberIndex: number) => {
        const details = resolveEmployee(empId);
        setTeams(prev => prev.map((t, ti) => {
            if (ti !== teamIndex) return t;
            const members = t.memberDetails.map((m, mi) =>
                mi === memberIndex ? { ...details } : m
            );
            return { ...t, memberDetails: members };
        }));
    };

    // Get member options filtered to exclude already-selected members in this team
    const getMemberOptions = (team: TeamRow, currentMemberIndex: number) => {
        const usedIds = new Set(
            team.memberDetails
                .filter((_, i) => i !== currentMemberIndex)
                .map(m => m.employee)
                .filter(Boolean)
        );
        return counselorOptions.filter(opt => !usedIds.has(opt.value));
    };

    // ── Save — matches Angular's updateTeams()
    const handleSave = async () => {
        if (!validateTeams()) return;
        setLoading(true);
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
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

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

            {isDataLoading ? (
                <div className="flex justify-center items-center py-16 text-[var(--color-muted-foreground)]">
                    <RefreshCw size={20} className="animate-spin mr-2" /> Loading…
                </div>
            ) : teams.length === 0 ? (
                <div className="text-center py-16 text-[var(--color-muted-foreground)] text-sm">
                    No teams configured yet.
                </div>
            ) : (
                <div className="mt-3 flex flex-col gap-4">
                    {teams.map((team, teamIndex) => (
                        <div
                            key={teamIndex}
                            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 relative"
                        >
                            {/* Team header row */}
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-[var(--color-foreground)]">
                                    {team.name || <span className="text-[var(--color-muted-foreground)] font-normal italic">Enter Team Name</span>}
                                </h4>
                                {canEdit && (
                                    <button
                                        onClick={() => removeTeam(teamIndex)}
                                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Delete team"
                                    >
                                        <Trash2 size={13} /> Delete
                                    </button>
                                )}
                            </div>

                            {/* Team Name + Lead */}
                            <div className="flex flex-wrap gap-4 mb-4">
                                <div className="w-64">
                                    <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
                                        Team Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={team.name}
                                        onChange={e => onTeamNameChange(e.target.value, teamIndex)}
                                        placeholder="Team Name"
                                        maxLength={90}
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="w-64">
                                    <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
                                        Lead <span className="text-red-500">*</span>
                                    </label>
                                    <SelectSingle
                                        value={team.leadDetails.employee || ''}
                                        options={counselorOptions}
                                        placeholder="Select Lead"
                                        onChange={val => onLeadChange(String(val), teamIndex)}
                                        disabled={!canEdit}
                                        containerClassName="w-full"
                                    />
                                </div>
                            </div>

                            {/* Member Details */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-sm font-medium text-[var(--color-foreground)]">
                                        Member Details
                                    </h5>
                                    {canEdit && (
                                        <button
                                            onClick={() => addMember(teamIndex)}
                                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                                            title="Add Member"
                                        >
                                            <UserPlus size={13} /> Add Member
                                        </button>
                                    )}
                                </div>

                                {team.memberDetails.length === 0 ? (
                                    <p className="text-xs text-[var(--color-muted-foreground)] italic">
                                        No members yet. Click &quot;Add Member&quot; above.
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {team.memberDetails.map((member, memberIndex) => (
                                            <div key={memberIndex} className="flex items-center gap-1">
                                                <SelectSingle
                                                    value={member.employee || ''}
                                                    options={getMemberOptions(team, memberIndex)}
                                                    placeholder="Select Member"
                                                    onChange={val => onMemberChange(String(val), teamIndex, memberIndex)}
                                                    disabled={!canEdit}
                                                    containerClassName="w-56"
                                                />
                                                {canEdit && (
                                                    <button
                                                        onClick={() => removeMember(teamIndex, memberIndex)}
                                                        className="flex items-center justify-center w-7 h-7 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Remove member"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Save button */}
            {!isDataLoading && teams.length > 0 && canEdit && (
                <div className="flex justify-end mt-4">
                    <Button variant="primary" onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                        {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdmissionTeams;
