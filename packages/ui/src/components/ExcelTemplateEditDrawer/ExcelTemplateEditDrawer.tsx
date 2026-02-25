import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, RotateCcw } from 'lucide-react';
import { SelectSingle } from '../Atoms/SelectSingle';
import { MultiSelect } from '../Atoms/MultiSelect';
import { Button } from '../Atoms/Button';
import type { TableHead, FilterValue } from '@od-erp/types';
import type {
    ExcelFilterValueOption,
    ExcelTemplateEditDrawerProps,
} from '../../types/ExcelTemplateEditDrawer';

const DEFAULT_STATUS_OPTIONS: ExcelFilterValueOption[] = [
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Cancelled', value: 'cancelled' },
];

const DEFAULT_DATE_PRESETS: ExcelFilterValueOption[] = [
    { label: 'Current Date', value: 'currentDate' },
    { label: 'Last Week', value: 'lastWeek' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'This Year', value: 'thisYear' },
];

export const ExcelTemplateEditDrawer: React.FC<ExcelTemplateEditDrawerProps> = ({
    open,
    onClose,
    template,
    reportDisplayName = 'Report',
    availableHeads,
    availableFilters,
    sortByOptions,
    defaultHeads,
    multiValueFilterKeys = ['course'],
    datePresetFilterKeys = ['startDate', 'endDate'],
    datePresets = DEFAULT_DATE_PRESETS,
    statusOptions = DEFAULT_STATUS_OPTIONS,
    paymentModes = [],
    courses = [],
    onSave,
}) => {
    const [sortBy, setSortBy] = useState(template.sortBy || '');
    const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>(template.sortOrder || 'ascending');
    const [tableHeads, setTableHeads] = useState<TableHead[]>([]);
    const [filterValues, setFilterValues] = useState<FilterValue[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSortBy(template.sortBy || '');
        setSortOrder(template.sortOrder || 'ascending');
        setTableHeads(template.tableHeads ? [...template.tableHeads] : []);
        setFilterValues(template.filterValues ? [...template.filterValues] : []);
    }, [template]);

    if (!open) return null;

    // ── Table Heads helpers ───────────────────────────────────────────
    const usedHeadValues = tableHeads.map(h => h.value);

    const headOptions = (currentValue: string) =>
        availableHeads.map(h => ({
            label: h.name,
            value: h.value,
            disabled: h.value !== currentValue && usedHeadValues.includes(h.value),
        }));

    const handleHeadChange = (index: number, field: keyof TableHead, value: string | number) => {
        setTableHeads(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            // Auto-fill display name when a field is picked for the first time
            if (field === 'value' && !updated[index].name) {
                const found = availableHeads.find(h => h.value === value);
                if (found) updated[index].name = found.name;
            }
            return updated;
        });
    };

    const addTableHead = () => setTableHeads(prev => [...prev, { value: '', name: '', seqNo: 0 }]);
    const removeTableHead = (i: number) => setTableHeads(prev => prev.filter((_, idx) => idx !== i));
    const applyDefaultFields = () => setTableHeads(defaultHeads.map(h => ({ ...h })));

    // ── Filter Helpers ────────────────────────────────────────────────
    const usedFilters = filterValues.map(f => f.filter);

    const filterKeyOptions = (currentKey: string) =>
        availableFilters
            .filter(f => f.value === currentKey || !usedFilters.includes(f.value))
            .map(f => ({ label: f.name, value: f.value }));

    const getFilterValueOptions = (filterKey: string): ExcelFilterValueOption[] => {
        if (datePresetFilterKeys.includes(filterKey)) return datePresets;
        if (filterKey === 'status') return statusOptions;
        if (filterKey === 'paymentMode') return paymentModes.map(m => ({ label: m, value: m }));
        if (filterKey === 'course') return courses.map(c => ({ label: c, value: c }));
        return [];
    };

    const handleFilterChange = (index: number, field: 'filter' | 'value', value: string) => {
        setFilterValues(prev => {
            const updated = [...prev];
            updated[index] = field === 'filter' ? { filter: value, value: '' } : { ...updated[index], value };
            return updated;
        });
    };

    const handleMultiFilterChange = (index: number, values: string[]) => {
        setFilterValues(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], value: values.join(',') };
            return updated;
        });
    };

    const addFilter = () => setFilterValues(prev => [...prev, { filter: '', value: '' }]);
    const removeFilter = (i: number) => setFilterValues(prev => prev.filter((_, idx) => idx !== i));

    // ── Save ─────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!template._id) return;
        setIsSaving(true);
        try {
            await onSave({
                _id: template._id,
                sortBy,
                sortOrder,
                tableHeads: tableHeads.filter(h => h.value),
                filterValues: filterValues.filter(f => f.filter),
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = 'w-full h-9 px-3 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30';

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 z-[1001] w-full max-w-2xl bg-[var(--color-card)] shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] shrink-0">
                    <div>
                        <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider mb-0.5">
                            {reportDisplayName}
                        </p>
                        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                            Edit Template —{' '}
                            <span className="text-[var(--color-primary)]">{template.viewName}</span>
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">

                    {/* Sort Settings */}
                    <section>
                        <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 tracking-wide uppercase border-b border-[var(--color-border)] pb-2">
                            Sort Settings
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <SelectSingle
                                label="Sort By"
                                value={sortBy}
                                onChange={v => setSortBy(v as string)}
                                options={sortByOptions.map(o => ({ label: o.name, value: o.value }))}
                                placeholder="Select sort field"
                                containerClassName="w-full"
                            />
                            <SelectSingle
                                label="Sort Order"
                                value={sortOrder}
                                onChange={v => setSortOrder(v as 'ascending' | 'descending')}
                                options={[
                                    { label: 'Ascending', value: 'ascending' },
                                    { label: 'Descending', value: 'descending' },
                                ]}
                                placeholder="Select order"
                                containerClassName="w-full"
                            />
                        </div>
                    </section>

                    {/* Column Configuration */}
                    <section>
                        <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border)] pb-2">
                            <h3 className="text-sm font-semibold text-[var(--color-foreground)] tracking-wide uppercase">
                                Column Configuration ({tableHeads.length} columns)
                            </h3>
                            <button
                                onClick={applyDefaultFields}
                                className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                                title="Reset to default fields"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Apply Defaults
                            </button>
                        </div>

                        <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-2 mb-1 px-1">
                            <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Field</span>
                            <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Display Label</span>
                            <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Seq No</span>
                            <span className="w-8" />
                        </div>

                        <div className="space-y-2">
                            {tableHeads.map((head, i) => (
                                <div key={i} className="grid grid-cols-[2fr_2fr_1fr_auto] gap-2 items-end bg-[var(--color-muted)]/30 rounded-lg p-2">
                                    <SelectSingle
                                        label=""
                                        value={head.value}
                                        onChange={v => handleHeadChange(i, 'value', v as string)}
                                        options={headOptions(head.value)}
                                        placeholder="Select field"
                                        containerClassName="w-full"
                                    />
                                    <input
                                        type="text"
                                        value={head.name}
                                        onChange={e => handleHeadChange(i, 'name', e.target.value)}
                                        placeholder="Column label"
                                        className={inputClass}
                                    />
                                    <input
                                        type="number"
                                        value={head.seqNo || ''}
                                        onChange={e => handleHeadChange(i, 'seqNo', parseInt(e.target.value) || 0)}
                                        placeholder="Seq"
                                        className={inputClass}
                                    />
                                    <button
                                        onClick={() => removeTableHead(i)}
                                        className="w-8 h-8 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        title="Remove column"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addTableHead}
                            className="mt-3 flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Column
                        </button>
                    </section>

                    {/* Filter Defaults */}
                    <section>
                        <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border)] pb-2">
                            <h3 className="text-sm font-semibold text-[var(--color-foreground)] tracking-wide uppercase">
                                Filter Defaults ({filterValues.length})
                            </h3>
                        </div>
                        <p className="text-xs text-[var(--color-muted-foreground)] mb-3">
                            Pre-set filter values applied when this template is selected. Leave empty for no default.
                        </p>

                        <div className="grid grid-cols-[2fr_3fr_auto] gap-2 mb-1 px-1">
                            <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Filter</span>
                            <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Default Value</span>
                            <span className="w-8" />
                        </div>

                        <div className="space-y-2">
                            {filterValues.map((fv, i) => {
                                const isMulti = multiValueFilterKeys.includes(fv.filter);
                                const isDate = datePresetFilterKeys.includes(fv.filter);
                                const isSingle = ['status', 'paymentMode'].includes(fv.filter) || isDate;
                                const valueOptions = getFilterValueOptions(fv.filter);
                                const multiVal = fv.value ? fv.value.split(',').filter(Boolean) : [];

                                return (
                                    <div key={i} className="grid grid-cols-[2fr_3fr_auto] gap-2 items-end bg-[var(--color-muted)]/30 rounded-lg p-2">
                                        <SelectSingle
                                            label=""
                                            value={fv.filter}
                                            onChange={v => handleFilterChange(i, 'filter', v as string)}
                                            options={filterKeyOptions(fv.filter)}
                                            placeholder="Select filter"
                                            containerClassName="w-full"
                                        />
                                        {isMulti ? (
                                            <MultiSelect
                                                label=""
                                                value={multiVal}
                                                onChange={v => handleMultiFilterChange(i, v as string[])}
                                                options={valueOptions}
                                                placeholder="Select values"
                                                containerClassName="w-full"
                                            />
                                        ) : (isSingle && valueOptions.length > 0) ? (
                                            <SelectSingle
                                                label=""
                                                value={fv.value}
                                                onChange={v => handleFilterChange(i, 'value', v as string)}
                                                options={valueOptions}
                                                placeholder="Select value"
                                                containerClassName="w-full"
                                            />
                                        ) : (
                                            <div className="h-9 flex items-center px-3 text-xs text-[var(--color-muted-foreground)] italic rounded-md border border-dashed border-[var(--color-border)]">
                                                {fv.filter ? 'No presets for this filter' : 'Select a filter first'}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => removeFilter(i)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            title="Remove filter"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={addFilter}
                            disabled={filterValues.length >= availableFilters.length}
                            className="mt-3 flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            Add Filter
                        </button>
                    </section>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-3 py-2 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="px-5">
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave} className="px-6" disabled={isSaving}>
                        {isSaving ? 'Saving…' : 'Save Template'}
                    </Button>
                </div>
            </div>
        </>
    );
};
