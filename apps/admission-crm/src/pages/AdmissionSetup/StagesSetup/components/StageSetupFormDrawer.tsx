import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Button, Input, useToast, EditableTable, EditableTableColumn,
    Toggle, SelectSingle, MultiSelect, Checkbox,
} from '@od-erp/ui';
import { X, RefreshCw, Plus, Trash2, Copy } from 'lucide-react';
import { useAdmissionStageSetup, useCourses, useQuery } from '@od-erp/query';
import { admissionStudentDataService, communicationService, admissionService } from '@od-erp/api-client';
import { DISPLAY_STAGE_FIELDS } from '@od-erp/constants';

import type { StageField, TxnMapping, StageFormData, StageSetupFormDrawerProps } from '@od-erp/types';

const defaultForm: StageFormData = {
    stage: '',
    sequence: '',
    stageType: 'lead',
    checkSeats: false,
    sendSMS: false,
    sendWhatsAppWeb: false,
    sendWhatsApp: false,
    sendEmail: false,
    smsTemplate: '',
    whatsAppWebTemplate: '',
    whatsAppTemplate: '',
    emailTemplate: '',
    txnRequired: false,
    saveZeroAmountTransaction: false,
    stageCounselor: [],
    fields: [],
    txnMapping: [],
};

const FIELD_TYPES = ['text', 'date', 'selectBox', 'phone', 'toggle', 'file'];
const STAGE_TYPES = [
    { value: 'lead', label: 'Lead' },
    { value: 'application', label: 'Application' },
];

// ── Communication templates hook ──────────────────────────────────────────────
const useCommunicationTemplates = (entityId: string, channel: string, enabled: boolean) =>
    useQuery({
        queryKey: ['communicationTemplates', entityId, channel],
        queryFn: () => communicationService.listCommunicationTemplate(entityId, 'admissionReminder', channel),
        enabled: enabled && !!entityId,
        staleTime: 60000 * 5,
    });

const useEmployeeList = (entityId: string) =>
    useQuery({
        queryKey: ['employeeList', entityId],
        queryFn: () => admissionService.listEmployee(entityId),
        enabled: !!entityId,
        staleTime: 60000 * 5,
    });

// ── Main component ────────────────────────────────────────────────────────────
const StageSetupFormDrawer = ({ isOpen, onClose, onSuccess, editData, entityId, session, admissionMaster }: StageSetupFormDrawerProps) => {
    const { showToast } = useToast();
    const [form, setForm] = useState<StageFormData>(defaultForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Copy Fields From Stage modal
    const [copyFieldsOpen, setCopyFieldsOpen] = useState(false);
    const [selectedCopyStage, setSelectedCopyStage] = useState('');

    // Bulk push options text per field index
    const [optionListMap, setOptionListMap] = useState<Record<number, string>>({});

    const { data: existingStages } = useAdmissionStageSetup(entityId, session);
    const { data: courses = [] } = useCourses(entityId, session);
    const { data: employees = [] } = useEmployeeList(entityId);

    const admissionStages: string[] = admissionMaster?.stages || [];
    const admissionHead: string[] = admissionMaster?.admissionHead || [];

    // Communication template lists
    const { data: templateListSms = [] } = useCommunicationTemplates(entityId, 'sms', !!entityId);
    const { data: templateListWhatsapp = [] } = useCommunicationTemplates(entityId, 'whatsApp', !!entityId);
    const { data: templateListWhatsappWeb = [] } = useCommunicationTemplates(entityId, 'whatsAppWeb', !!entityId);
    const { data: templateListEmail = [] } = useCommunicationTemplates(entityId, 'email', !!entityId);

    const usedStages = (existingStages || [])
        .filter((s: any) => s._id !== editData?._id)
        .map((s: any) => s.stage);

    const availableStages = admissionStages.filter(s => !['Approved', 'Rejected', 'Withdrawn'].includes(s));

    // Stage options for SelectSingle
    const stageOptions = availableStages.map(s => ({ value: s, label: s, disabled: usedStages.includes(s) }));

    // Employee options for MultiSelect
    const employeeOptions = (employees as any[]).map(e => ({
        value: e._id || e.employeeId || e.name,
        label: e.name || e.displayName || e._id,
    }));

    // Communication template options helpers
    const toOptions = (list: any[]) => list.map((t: any) => ({ value: t._id, label: t.name || t._id }));

    useEffect(() => {
        if (editData) {
            const txnMapping = (editData.txnMapping || []).map((row: any) => ({
                ...row,
                course: typeof row.course === 'string' ? row.course : row.course?.name || '',
                isEditableDisable: (row.headData?.length || 0) > 1,
                disableHead: (row.headData || []).map((h: any) => h.admissionHead),
            }));
            setForm({
                ...defaultForm,
                ...editData,
                stageCounselor: editData.stageCounselor || [],
                fields: editData.fields || [],
                txnMapping,
            });
        } else {
            setForm(defaultForm);
        }
        setErrors({});
        setOptionListMap({});
    }, [editData]);

    // ── Derived ──────────────────────────────────────────────────────────────
    const usedFieldKeys = useMemo(() => form.fields.map(f => f.key), [form.fields]);

    const fieldKeyOptions = DISPLAY_STAGE_FIELDS.map(f => ({
        value: f.value,
        label: `${f.name}`,
        disabled: usedFieldKeys.includes(f.value),
    }));

    const fieldTypeOptions = FIELD_TYPES.map(t => ({ value: t, label: t.toUpperCase() }));

    const getStreamsForCourse = (courseName: string): { value: string; label: string }[] => {
        const found = (courses as any[]).find((c: any) =>
            (typeof c === 'string' ? c : c.name) === courseName
        );
        return (found?.stream || []).map((s: string) => ({ value: s, label: s }));
    };

    const courseOptions = (courses as any[]).map((c: any) => {
        const name = typeof c === 'string' ? c : c.name;
        return { value: name, label: name };
    });

    const headOptions = admissionHead.map(h => ({ value: h, label: h }));

    // ── Helpers ───────────────────────────────────────────────────────────────
    const setField = <K extends keyof StageFormData>(key: K, value: StageFormData[K]) =>
        setForm(prev => ({ ...prev, [key]: value }));

    // ── Validation ───────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!form.stage) errs.stage = 'Stage is required';
        if (form.sequence === '' || isNaN(Number(form.sequence)) || Number(form.sequence) < 0)
            errs.sequence = 'Valid sequence number is required';
        for (const f of form.fields) {
            if (!f.key || !f.displayName) { errs.fields = 'All field rows must have a key and display name'; break; }
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            // Strip UI-only fields from txnMapping (isEditableDisable, disableHead are React state only)
            const txnMapping = form.txnMapping.map(({ isEditableDisable: _ie, disableHead: _dh, ...row }) => ({
                ...row,
                course: typeof row.course === 'string' ? row.course : (row.course as any)?.name || '',
            }));

            // Build payload matching Angular's shape:
            // - omit notification toggles + templates when false/empty
            const payload: Record<string, any> = {
                stage: form.stage,
                sequence: form.sequence,
                stageType: form.stageType,
                checkSeats: form.checkSeats,
                txnRequired: form.txnRequired,
                saveZeroAmountTransaction: form.saveZeroAmountTransaction,
                stageCounselor: form.stageCounselor,
                fields: form.fields,
                txnMapping,
                entity: entityId,
                session,
            };

            // Preserve _id on edit
            if (editData?._id) payload._id = editData._id;

            // Only include notification flags + templates when active
            if (form.sendSMS) { payload.sendSMS = true; if (form.smsTemplate) payload.smsTemplate = form.smsTemplate; }
            if (form.sendWhatsAppWeb) { payload.sendWhatsAppWeb = true; if (form.whatsAppWebTemplate) payload.whatsAppWebTemplate = form.whatsAppWebTemplate; }
            if (form.sendWhatsApp) { payload.sendWhatsApp = true; if (form.whatsAppTemplate) payload.whatsAppTemplate = form.whatsAppTemplate; }
            if (form.sendEmail) { payload.sendEmail = true; if (form.emailTemplate) payload.emailTemplate = form.emailTemplate; }

            if (editData?._id) {
                await admissionStudentDataService.editAdmissionStageSetup(payload);
            } else {
                await admissionStudentDataService.addAdmissionStageSetup(payload);
            }
            onSuccess();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save stage setup');
        } finally {
            setLoading(false);
        }
    };


    // ── Field helpers ─────────────────────────────────────────────────────────
    const addField = () => {
        setForm(prev => ({
            ...prev,
            fields: [...prev.fields, { key: '', displayName: '', requiredField: false, fieldType: 'text', sequence: 0, groupBy: '', option: false, options: [] }],
        }));
    };

    const updateField = (index: number, key: keyof StageField, value: any) =>
        setForm(prev => {
            const fields = [...prev.fields];
            fields[index] = { ...fields[index], [key]: value };
            if (key === 'fieldType') fields[index].option = value === 'selectBox';
            if (key === 'key') {
                const found = DISPLAY_STAGE_FIELDS.find(f => f.value === value);
                if (found) {
                    fields[index].displayName = found.name;
                    fields[index].groupBy = found.groupBy;
                    fields[index].fieldType = found.fieldType;
                    fields[index].option = found.fieldType === 'selectBox';
                }
            }
            return { ...prev, fields };
        });

    const removeField = (index: number) => {
        setForm(prev => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
        setOptionListMap(prev => { const n = { ...prev }; delete n[index]; return n; });
    };

    const pushOptions = (index: number) => {
        const arr = (optionListMap[index] || '').split('|').map(s => s.trim()).filter(Boolean);
        updateField(index, 'options', arr);
    };

    const copyFields = () => {
        const found = (existingStages || []).find((s: any) => s.stage === selectedCopyStage);
        if (found?.fields) setForm(prev => ({ ...prev, fields: [...found.fields] }));
        setCopyFieldsOpen(false);
        setSelectedCopyStage('');
    };

    // ── Txn helpers ───────────────────────────────────────────────────────────
    const addTxnRow = () =>
        setForm(prev => ({
            ...prev,
            txnMapping: [...prev.txnMapping, { course: '', stream: '', amount: 0, headData: [], amountEditable: false, isEditableDisable: false, disableHead: [] }],
        }));

    const updateTxnRow = (index: number, key: keyof TxnMapping, value: any) =>
        setForm(prev => {
            const txnMapping = [...prev.txnMapping];
            txnMapping[index] = { ...txnMapping[index], [key]: value };
            if (key === 'course') txnMapping[index].stream = '';
            return { ...prev, txnMapping };
        });

    const removeTxnRow = (index: number) =>
        setForm(prev => ({ ...prev, txnMapping: prev.txnMapping.filter((_, i) => i !== index) }));

    const addHeadRow = (txnIndex: number) => {
        setForm(prev => {
            const txnMapping = [...prev.txnMapping];
            const existing = txnMapping[txnIndex];
            const newDisableHead = existing.headData.map(h => h.admissionHead).filter(Boolean);
            txnMapping[txnIndex] = {
                ...existing,
                headData: [...existing.headData, { admissionHead: '', headAmount: 0 }],
                disableHead: newDisableHead,
                isEditableDisable: existing.headData.length >= 1,
                amountEditable: existing.headData.length >= 1 ? false : existing.amountEditable,
            };
            return { ...prev, txnMapping };
        });
    };

    const updateHeadRow = (txnIndex: number, headIndex: number, key: string, value: any) =>
        setForm(prev => {
            const txnMapping = [...prev.txnMapping];
            const headData = [...txnMapping[txnIndex].headData];
            headData[headIndex] = { ...headData[headIndex], [key]: value };
            txnMapping[txnIndex].headData = headData;
            txnMapping[txnIndex].amount = headData.reduce((sum, h) => sum + (Number(h.headAmount) || 0), 0);
            return { ...prev, txnMapping };
        });

    const removeHeadRow = (txnIndex: number, headIndex: number) =>
        setForm(prev => {
            const txnMapping = [...prev.txnMapping];
            const headData = txnMapping[txnIndex].headData.filter((_, i) => i !== headIndex);
            txnMapping[txnIndex] = {
                ...txnMapping[txnIndex],
                headData,
                amount: headData.reduce((sum, h) => sum + (Number(h.headAmount) || 0), 0),
                disableHead: headData.map(h => h.admissionHead).filter(Boolean),
                isEditableDisable: headData.length > 1,
                amountEditable: headData.length > 1 ? false : txnMapping[txnIndex].amountEditable,
            };
            return { ...prev, txnMapping };
        });

    const copyAllCourseHeads = () => {
        if (!form.txnMapping.length || !form.txnMapping[0].course) {
            showToast('error', 'Please add course fields for first row');
            return;
        }
        const first = form.txnMapping[0];
        if (!first.headData.length || !first.headData[0].admissionHead) {
            showToast('error', 'Please add head values first');
            return;
        }
        const existingKeys = form.txnMapping.map(r => r.course + r.stream);
        const allCombos: TxnMapping[] = [];
        for (const course of courses as any[]) {
            const courseName: string = typeof course === 'string' ? course : course.name;
            for (const stream of (course.stream || []) as string[]) {
                if (!existingKeys.includes(courseName + stream)) {
                    allCombos.push({ course: courseName, stream, amount: first.amount, headData: [...first.headData], amountEditable: first.amountEditable, isEditableDisable: first.isEditableDisable, disableHead: [...first.disableHead] });
                }
            }
        }
        setForm(prev => ({ ...prev, txnMapping: [...prev.txnMapping, ...allCombos] }));
    };

    // ── EditableTable column defs ─────────────────────────────────────────────
    const fieldColumns = useMemo<EditableTableColumn<StageField>[]>(() => [
        {
            header: 'Field Key',
            width: 150,
            cell: (row, i) => (
                <SelectSingle
                    options={fieldKeyOptions.map(o => ({ ...o, disabled: o.disabled && o.value !== row.key }))}
                    value={row.key}
                    onChange={val => updateField(i, 'key', val)}
                    placeholder="Select Field"
                />
            ),
        },
        {
            header: 'Display Name',
            width: 150,
            cell: (row, i) => (
                <Input value={row.displayName} onChange={e => updateField(i, 'displayName', e.target.value)} placeholder="Display name" />
            ),
        },
        {
            header: 'Field Type',
            width: 130,
            cell: (row, i) => (
                <SelectSingle
                    options={fieldTypeOptions}
                    value={row.fieldType}
                    onChange={val => updateField(i, 'fieldType', val as string)}
                />
            ),
        },
        {
            header: 'Seq',
            width: 80,
            cell: (row, i) => (
                <Input type="number" value={row.sequence} onChange={e => updateField(i, 'sequence', Number(e.target.value))} placeholder="0" />
            ),
        },
        {
            header: 'Group By',
            width: 180,
            cell: (row, i) => (
                <Input value={row.groupBy} onChange={e => updateField(i, 'groupBy', e.target.value)} placeholder="Group" />
            ),
        },
        {
            header: 'Required',
            width: 80,
            cell: (row, i) => (
                <Checkbox checked={row.requiredField} onChange={v => updateField(i, 'requiredField', v)} />
            ),
        },
        {
            header: 'Action',
            width: 44,
            cell: (_, i) => (
                <button onClick={() => removeField(i)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                    <Trash2 size={14} />
                </button>
            ),
        },
    ], [form.fields, usedFieldKeys]);

    // Options sub-section (only for selectBox fields)
    const renderFieldOptions = (field: StageField, i: number) => {
        if (field.fieldType !== 'selectBox') return null;
        return (
            <div className="px-4 pb-3 bg-[var(--color-background)] border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between pt-2 mb-2">
                    <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
                        Options for <strong>{field.displayName || field.key}</strong>
                    </span>
                    <Button variant="outline" onClick={() => updateField(i, 'options', [...field.options, ''])} className="h-6 px-2 text-xs flex items-center gap-1">
                        <Plus size={10} /> Add
                    </Button>
                </div>
                {field.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2 mb-1">
                        <Input
                            value={opt}
                            onChange={e => { const opts = [...field.options]; opts[oi] = e.target.value; updateField(i, 'options', opts); }}
                            placeholder={`Option ${oi + 1}`}
                        />
                        <button onClick={() => updateField(i, 'options', field.options.filter((_, fi) => fi !== oi))} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0">
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
                <div className="flex items-end gap-2 mt-2">
                    <div className="flex-1">
                        <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Bulk (pipe-separated): <span className="font-mono">Male|Female|Other</span></p>
                        <textarea
                            rows={2}
                            className="w-full text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                            placeholder="Enter options list..."
                            value={optionListMap[i] || ''}
                            onChange={e => setOptionListMap(prev => ({ ...prev, [i]: e.target.value }))}
                        />
                    </div>
                    <Button variant="primary" onClick={() => pushOptions(i)} className="h-8 px-3 text-xs flex-shrink-0">
                        Push Options
                    </Button>
                </div>
            </div>
        );
    };

    const txnColumns = useMemo<EditableTableColumn<TxnMapping>[]>(() => [
        {
            header: 'Course',
            width: 180,
            cell: (row, i) => (
                <SelectSingle
                    options={courseOptions}
                    value={row.course}
                    onChange={val => updateTxnRow(i, 'course', val as string)}
                    placeholder="Select Course"
                />
            ),
        },
        {
            header: 'Stream',
            width: 150,
            cell: (row, i) => {
                const streams = getStreamsForCourse(row.course);
                return (
                    <SelectSingle
                        options={streams}
                        value={row.stream}
                        onChange={val => updateTxnRow(i, 'stream', val as string)}
                        placeholder="Select Stream"
                        disabled={!row.course || streams.length === 0}
                    />
                );
            },
        },
        {
            header: 'Total',
            width: 80,
            cell: (row) => (
                <span className="text-sm font-semibold text-[var(--color-foreground)]">₹{row.amount}</span>
            ),
        },
        {
            header: 'Editable',
            width: 80,
            cell: (row, i) => (
                <Toggle
                    checked={row.amountEditable}
                    disabled={row.isEditableDisable}
                    onChange={e => updateTxnRow(i, 'amountEditable', e.target.checked)}
                />
            ),
        },
        {
            header: 'Head Data',
            cell: (row, txnIndex) => (
                <div className="space-y-1 py-1">
                    {row.headData.map((head, headIndex) => (
                        <div key={headIndex} className="flex items-center gap-2">
                            <div className="flex-1">
                                <SelectSingle
                                    options={headOptions.map(h => ({
                                        ...h,
                                        disabled: row.disableHead.includes(h.value) && h.value !== head.admissionHead,
                                    }))}
                                    value={head.admissionHead}
                                    onChange={val => updateHeadRow(txnIndex, headIndex, 'admissionHead', val as string)}
                                    placeholder="Select Head"
                                />
                            </div>
                            <Input
                                type="number"
                                value={head.headAmount}
                                onChange={e => updateHeadRow(txnIndex, headIndex, 'headAmount', Number(e.target.value))}
                                placeholder="Amount"
                                className="w-24 text-xs"
                            />
                            <button onClick={() => removeHeadRow(txnIndex, headIndex)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={() => addHeadRow(txnIndex)} className="h-7 px-2 text-xs flex items-center gap-1 mt-1">
                        <Plus size={11} /> Add Head
                    </Button>
                </div>
            ),
        },
        {
            header: '',
            width: 44,
            cell: (_, i) => (
                <button onClick={() => removeTxnRow(i)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                    <Trash2 size={14} />
                </button>
            ),
        },
    ], [form.txnMapping, admissionHead, courses]);

    if (!isOpen) return null;

    return createPortal((
        <div className="fixed inset-0 z-[99999] flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-full max-w-6xl bg-[var(--color-card)] h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] bg-primary flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-white">{editData ? 'Edit Stage Setup' : 'Add Stage Setup'}</h2>
                        <p className="text-sm text-white/70">Configure admission stage fields and transaction mapping</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/10 text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-2 space-y-3">

                    {/* ── Basic Configuration ─────────────────────────────────────── */}
                    <section className="bg-[var(--color-background)] rounded-lg p-2 space-y-4">
                        <h3 className="text-sm font-semibold text-[var(--color-foreground)] border-b border-[var(--color-border)] pb-2">Basic Configuration</h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Stage */}
                            <div>
                                <SelectSingle
                                    label="Stage *"
                                    options={stageOptions}
                                    value={form.stage}
                                    onChange={val => setField('stage', val as string)}
                                    placeholder="Select Stage"
                                    error={errors.stage}
                                />
                            </div>

                            {/* Sequence */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-dark)] mb-1.5">Sequence *</label>
                                <Input
                                    type="number"
                                    value={form.sequence}
                                    onChange={e => setField('sequence', e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="Enter sequence number"
                                />
                                {errors.sequence && <p className="mt-1 text-xs text-red-500">{errors.sequence}</p>}
                            </div>

                            {/* Stage Type */}
                            <div>
                                <SelectSingle
                                    label="Stage Type"
                                    options={STAGE_TYPES}
                                    value={form.stageType}
                                    onChange={val => setField('stageType', val as string)}
                                />
                            </div>

                            {/* Stage Counselor */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-dark)] mb-1.5">Stage Counselor</label>
                                <MultiSelect
                                    options={employeeOptions}
                                    value={form.stageCounselor}
                                    onChange={vals => setField('stageCounselor', vals as string[])}
                                    placeholder="Select Counselors"
                                />
                            </div>
                        </div>

                        {/* ── Toggles ──────────────────────────────────────────── */}
                        <div className="grid grid-cols-1 gap-4 pt-2">

                            {/* Check Seats */}
                            <Toggle label="Check Seats" checked={form.checkSeats} onChange={e => setField('checkSeats', e.target.checked)} />

                            {/* Send SMS */}
                            <div className="flex items-center gap-4">
                                <Toggle label="Send SMS" checked={form.sendSMS} onChange={e => { setField('sendSMS', e.target.checked); if (!e.target.checked) setField('smsTemplate', ''); }} />
                                {form.sendSMS && (
                                    <div className="flex-1">
                                        <SelectSingle
                                            options={toOptions(templateListSms as any[])}
                                            value={form.smsTemplate}
                                            onChange={val => setField('smsTemplate', val as string)}
                                            placeholder="Select SMS Template"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Send WhatsApp Web */}
                            <div className="flex items-center gap-4">
                                <Toggle label="Send WhatsApp Web" checked={form.sendWhatsAppWeb} onChange={e => { setField('sendWhatsAppWeb', e.target.checked); if (!e.target.checked) setField('whatsAppWebTemplate', ''); }} />
                                {form.sendWhatsAppWeb && (
                                    <div className="flex-1">
                                        <SelectSingle
                                            options={toOptions(templateListWhatsappWeb as any[])}
                                            value={form.whatsAppWebTemplate}
                                            onChange={val => setField('whatsAppWebTemplate', val as string)}
                                            placeholder="Select WhatsApp Web Template"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Send WhatsApp */}
                            <div className="flex items-center gap-4">
                                <Toggle label="Send WhatsApp" checked={form.sendWhatsApp} onChange={e => { setField('sendWhatsApp', e.target.checked); if (!e.target.checked) setField('whatsAppTemplate', ''); }} />
                                {form.sendWhatsApp && (
                                    <div className="flex-1">
                                        <SelectSingle
                                            options={toOptions(templateListWhatsapp as any[])}
                                            value={form.whatsAppTemplate}
                                            onChange={val => setField('whatsAppTemplate', val as string)}
                                            placeholder="Select WhatsApp Template"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Send Email */}
                            <div className="flex items-center gap-4">
                                <Toggle label="Send Email" checked={form.sendEmail} onChange={e => { setField('sendEmail', e.target.checked); if (!e.target.checked) setField('emailTemplate', ''); }} />
                                {form.sendEmail && (
                                    <div className="flex-1">
                                        <SelectSingle
                                            options={toOptions(templateListEmail as any[])}
                                            value={form.emailTemplate}
                                            onChange={val => setField('emailTemplate', val as string)}
                                            placeholder="Select Email Template"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── Custom Fields ──────────────────────────────────────────────── */}
                    <section className="bg-[var(--color-background)] rounded-lg p-2">
                        <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border)] pb-2">
                            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Custom Fields</h3>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => { setCopyFieldsOpen(true); setSelectedCopyStage(''); }} className="h-7 px-3 text-xs flex items-center gap-1.5">
                                    <Copy size={12} /> Copy From Stage
                                </Button>
                                <Button variant="outline" onClick={addField} className="h-7 px-3 text-xs flex items-center gap-1.5">
                                    <Plus size={13} /> Add Field
                                </Button>
                            </div>
                        </div>
                        {errors.fields && <p className="text-xs text-red-500 mb-2">{errors.fields}</p>}
                        <EditableTable columns={fieldColumns} data={form.fields} emptyMessage="No custom fields added." />
                        {form.fields.map((field, i) => renderFieldOptions(field, i))}
                    </section>

                    {/* ── Transaction Mapping ────────────────────────────────────────── */}
                    <section className="bg-[var(--color-background)] rounded-lg p-2">
                        <div className="flex flex-wrap items-center gap-6 border-b border-[var(--color-border)] pb-3 mb-3">
                            <Toggle
                                label="Transaction Required"
                                checked={form.txnRequired}
                                onChange={e => { setField('txnRequired', e.target.checked); if (!e.target.checked) setField('txnMapping', []); }}
                            />
                            {form.txnRequired && (
                                <Toggle
                                    label="Save Zero Amount Transaction"
                                    checked={form.saveZeroAmountTransaction}
                                    onChange={e => setField('saveZeroAmountTransaction', e.target.checked)}
                                />
                            )}
                        </div>

                        {form.txnRequired && (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">Transaction Mapping</h4>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" onClick={copyAllCourseHeads} className="h-7 px-3 text-xs flex items-center gap-1.5">
                                            <Copy size={12} /> Copy Course Heads
                                        </Button>
                                        <Button variant="outline" onClick={addTxnRow} className="h-7 px-3 text-xs flex items-center gap-1.5">
                                            <Plus size={13} /> Add Row
                                        </Button>
                                    </div>
                                </div>
                                <EditableTable columns={txnColumns} data={form.txnMapping} emptyMessage="No transaction mapping rows added." />
                            </>
                        )}
                    </section>
                </div>

                {/* Footer */}
                <div className="px-3 py-2 border-t border-[var(--color-border)] bg-[var(--color-card)] flex justify-end gap-3 flex-shrink-0">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} disabled={loading} className="flex items-center gap-2 min-w-[80px]">
                        {loading && <RefreshCw size={14} className="animate-spin" />}
                        {editData ? 'Update' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* ── Copy Fields From Stage Modal ───────────────────────────────── */}
            {copyFieldsOpen && (
                <div className="absolute inset-0 flex items-center justify-center z-[99999]">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setCopyFieldsOpen(false)} />
                    <div className="relative bg-[var(--color-card)] rounded-xl shadow-2xl p-6 w-full max-w-sm z-10 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-[var(--color-foreground)]">Copy Fields From Stage</h3>
                            <button onClick={() => setCopyFieldsOpen(false)} className="p-1 rounded hover:bg-[var(--color-background)] text-[var(--color-muted-foreground)]">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="mb-6">
                            <SelectSingle
                                label="Stage"
                                options={(existingStages || []).map((s: any) => ({ value: s.stage, label: s.stage }))}
                                value={selectedCopyStage}
                                onChange={val => setSelectedCopyStage(val as string)}
                                placeholder="Select Stage"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setCopyFieldsOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={copyFields} disabled={!selectedCopyStage}>Copy Fields</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ), document.body);
};

export default StageSetupFormDrawer;
