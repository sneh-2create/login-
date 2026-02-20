import { useMemo } from 'react';
import { Button, DatePicker, SelectSingle, MultiSelect, Toggle } from '@od-erp/ui';

interface TemplateFilterProps {
  // Visibility
  isAdmissionAdmin: boolean;
  isLead: boolean;
  userName: string;
  isLoading: boolean;

  // Local filter state (pending — not yet committed to API)
  localCounselor: string;
  localStartDate: number | undefined;
  localEndDate: number | undefined;
  localSource: string;
  localStatus: string[];
  localCallStatus: string;
  localShowMemberDetails: boolean;

  // Setters
  setLocalCounselor: (_val: string) => void;
  setLocalStartDate: (_val: number | undefined) => void;
  setLocalEndDate: (_val: number | undefined) => void;
  setLocalSource: (_val: string) => void;
  setLocalStatus: (_val: string[]) => void;
  setLocalCallStatus: (_val: string) => void;
  setLocalShowMemberDetails: (_val: boolean) => void;

  // Counselor dropdown options (for admin / lead)
  counselorOptions: { label: string; value: string }[];

  // Callbacks
  onApply: () => void;
}

const sourceOptions = [
  { label: 'All Sources', value: '' },
  { label: 'Visit', value: 'visit' },
  { label: 'MyOperator', value: 'myOperator' }
];

const callStatusOptions = [
  { label: 'All Call Status', value: '' },
  { label: 'Received', value: 'received' },
  { label: 'Missed', value: 'missed' },
  { label: 'Transferred', value: 'transferred' },
  { label: 'No Receiver', value: 'noReceiver' },
  { label: 'Call Not Picked', value: 'callNotPicked' }
];

export const TemplateFilter = ({
  isAdmissionAdmin,
  isLead,
  userName,
  isLoading,
  localCounselor,
  localStartDate,
  localEndDate,
  localSource,
  localStatus,
  localCallStatus,
  localShowMemberDetails,
  setLocalCounselor,
  setLocalStartDate,
  setLocalEndDate,
  setLocalSource,
  setLocalStatus,
  setLocalCallStatus,
  setLocalShowMemberDetails,
  counselorOptions,
  onApply
}: TemplateFilterProps) => {
  // Status options react to local source selection (visit has different statuses)
  const statusOptions = useMemo(() => {
    const base = [{ label: 'All Status', value: '' }];
    if (localSource === 'visit') {
      return [
        ...base,
        { label: 'Pending', value: 'pending' },
        { label: 'Re Visit', value: 'duplicate' },
        { label: 'New Visit', value: 'converted' }
      ];
    }
    return [
      ...base,
      { label: 'Pending', value: 'pending' },
      { label: 'Duplicate', value: 'duplicate' },
      { label: 'Converted', value: 'converted' },
      { label: 'Rejected', value: 'rejected' }
    ];
  }, [localSource]);

  const handleSourceChange = (val: string) => {
    setLocalSource(val);
    // Reset status when source changes — visit has different status options
    setLocalStatus(['pending']);
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow border border-gray-200 mb-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start">

        {/* Counselor dropdown — admin or team lead */}
        {(isAdmissionAdmin || isLead) && (
          <div className="w-full">
            <SelectSingle
              label="Counselor"
              value={localCounselor}
              onChange={(val) => setLocalCounselor(val as string)}
              options={counselorOptions}
              placeholder="Select Counselor"
              containerClassName="w-full"
            />
          </div>
        )}

        {/* Non-lead, non-admin: read-only name label (matches Angular) */}
        {!isAdmissionAdmin && !isLead && (
          <div className="w-full">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Name</label>
            <p className="text-sm font-medium text-gray-800">{userName}</p>
          </div>
        )}

        <div className="w-full">
          <DatePicker
            label="Start Date"
            value={localStartDate ? new Date(localStartDate) : null}
            onChange={(date) => setLocalStartDate(date ? date.getTime() : undefined)}
            maxDate={localEndDate ? new Date(localEndDate) : undefined}
            className="w-full"
          />
        </div>

        <div className="w-full">
          <DatePicker
            label="End Date"
            value={localEndDate ? new Date(localEndDate) : null}
            onChange={(date) => setLocalEndDate(date ? date.getTime() : undefined)}
            minDate={localStartDate ? new Date(localStartDate) : undefined}
            className="w-full"
          />
        </div>

        <div className="w-full">
          <SelectSingle
            label="Source"
            value={localSource}
            onChange={(val) => handleSourceChange(val as string)}
            options={sourceOptions}
            placeholder="Select Source"
            containerClassName="w-full"
          />
        </div>

        <div className="w-full">
          <MultiSelect
            label="Status"
            value={localStatus}
            onChange={(val) => setLocalStatus(val as string[])}
            options={statusOptions}
            placeholder="Select Status"
            containerClassName="w-full"
          />
        </div>

        <div className="w-full">
          <SelectSingle
            label="Call Status"
            value={localCallStatus}
            onChange={(val) => setLocalCallStatus(val as string)}
            options={callStatusOptions}
            placeholder="Select Call Status"
            containerClassName="w-full"
          />
        </div>

        {(isAdmissionAdmin || isLead) && (
          <div className="w-full flex items-center self-center">
            <Toggle
              label="Show Member Details"
              checked={localShowMemberDetails}
              onChange={(e) => setLocalShowMemberDetails(e.target.checked)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="primary" onClick={onApply} isLoading={isLoading}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default TemplateFilter;
