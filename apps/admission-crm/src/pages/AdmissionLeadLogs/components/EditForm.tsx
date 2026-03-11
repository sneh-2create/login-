import { Button, Card, DatePicker, Input, SelectSingle } from '@od-erp/ui';
import { AdmissionLeadLog } from '@od-erp/types';
import { Phone, X } from 'lucide-react';
import { formatPhone } from '../../../utils/phoneUtils';

interface EditFormData {
  name: string;
  dob: number | null;
  course: string;
  stream: string;
  email: string;
}

interface DisplayNames {
  course: string;
  stream: string;
}

interface Permissions {
  viewAdmissionPhoneNumber: boolean;
  peerToPeerCallForAdmission: boolean;
  editAdmissionLeadLogs: boolean;
  convertAdmissionLeadLogs: boolean;
}

interface EditFormProps {
  lead: AdmissionLeadLog;
  formData: EditFormData;
  courseList: { name: string; stream: string[] }[];
  streams: string[];
  permissions: Permissions;
  displayNames: DisplayNames;

  onFormDataChange: (_data: EditFormData) => void;
  onCourseChange: (_courseName: string) => void;
  onClose: () => void;
  onEdit: () => void;
  onCallNotPicked: () => void;
  onReject: () => void;
  onConvert: () => void;
  onClickToCall: (_phone: string) => void;
}

export const EditForm = ({
  lead,
  formData,
  courseList,
  streams,
  permissions,
  displayNames,
  onFormDataChange,
  onCourseChange,
  onClose,
  onEdit,
  onCallNotPicked,
  onReject,
  onConvert,
  onClickToCall
}: EditFormProps) => {
  return (
    <Card className="mb-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lead Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* Read-only info row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
          <p className="text-sm">{new Date(lead.date).toLocaleDateString()}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone</label>
          <div className="flex items-center gap-2">
            <p className="text-sm">
              {formatPhone(lead.phone, !permissions.viewAdmissionPhoneNumber)}
            </p>
            {permissions.peerToPeerCallForAdmission && (
              <Phone
                size={14}
                className="cursor-pointer text-primary"
                onClick={() => onClickToCall(lead.phone)}
              />
            )}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Source</label>
          <p className="text-sm">{lead.source}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Counselor</label>
          <p className="text-sm">{lead.counselorName}</p>
        </div>
      </div>

      {/* Editable fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          label="Name *"
          type="text"
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          containerClassName="w-full"
        />

        <div className="w-full">
          <DatePicker
            label="DOB"
            value={formData.dob ? new Date(formData.dob) : null}
            onChange={(date) => onFormDataChange({ ...formData, dob: date?.getTime() ?? null })}
            className="w-full"
          />
        </div>

        <SelectSingle
          label={`${displayNames.course} *`}
          value={formData.course}
          onChange={(val) => onCourseChange(val as string)}
          options={courseList.map((c) => ({ label: c.name, value: c.name }))}
          placeholder={`Select ${displayNames.course}`}
          containerClassName="w-full"
        />

        <SelectSingle
          label={`${displayNames.stream} *`}
          value={formData.stream}
          onChange={(val) => onFormDataChange({ ...formData, stream: val as string })}
          options={streams.map((s) => ({ label: s, value: s }))}
          placeholder={`Select ${displayNames.stream}`}
          containerClassName="w-full"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
          containerClassName="w-full"
        />
      </div>

      {/* Call Info */}
      {lead.callDetails && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Call Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="text-xs text-gray-500">Call Timestamp</label>
              <p>{new Date(lead.callDetails.callTimestamp).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Call Duration</label>
              <p>{lead.callDetails.callDuration}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Call Status</label>
              <p className="uppercase">{lead.callDetails.callStatus}</p>
            </div>
            {lead.callDetails.callRecordingLink && (
              <div>
                <label className="text-xs text-gray-500">Recording</label>
                <a
                  href={lead.callDetails.callRecordingLink.replace('http://', 'https://')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 mb-2 block">Tags</label>
          <div className="flex gap-2 flex-wrap">
            {lead.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Remark */}
      {lead.remark && (
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Remark</label>
          <p className="text-sm">{lead.remark}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        {permissions.convertAdmissionLeadLogs &&
          lead.status !== 'rejected' &&
          lead.status !== 'converted' && (
            <Button
              variant="outline"
              className="border-primary text-primary"
              onClick={onCallNotPicked}
            >
              Call Not Picked
            </Button>
          )}
        {permissions.convertAdmissionLeadLogs && lead.status !== 'rejected' && (
          <Button
            variant="outline"
            className="border-red-500 text-red-500"
            onClick={onReject}
          >
            Reject
          </Button>
        )}
        {permissions.convertAdmissionLeadLogs && lead.status !== 'converted' && (
          <Button
            variant="outline"
            className="border-green-500 text-green-500"
            onClick={onConvert}
          >
            Convert
          </Button>
        )}
        {permissions.editAdmissionLeadLogs && (
          <Button onClick={onEdit}>Edit</Button>
        )}
      </div>
    </Card>
  );
};

export default EditForm;
