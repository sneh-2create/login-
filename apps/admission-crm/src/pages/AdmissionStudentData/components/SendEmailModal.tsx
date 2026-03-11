import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { Button, SelectSingle, MultiSelect, TextArea, useToast } from '@od-erp/ui';
import { useCommunicationTemplates, useSendAdmissionEmail, useCommunicationConfig } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { AdmissionLead } from '@od-erp/types';
import { useEffect } from 'react';

interface SendEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedStudents: AdmissionLead[];
    onSuccess?: () => void;
}

const SEND_TO_OPTIONS = [
    { value: 'primary', label: 'PRIMARY' },
    { value: 'father', label: 'FATHER' },
    { value: 'mother', label: 'MOTHER' },
    { value: 'guardian', label: 'GUARDIAN' }
];

const SendEmailModal = ({ isOpen, onClose, selectedStudents, onSuccess }: SendEmailModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const { showToast } = useToast();

    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [sendTo, setSendTo] = useState<string[]>([]);
    const [content, setContent] = useState('');
    const [subject, setSubject] = useState('');
    const [senderId, setSenderId] = useState('');
    const [DLT_TE_ID, setDLT_TE_ID] = useState('');

    const { data: templates } = useCommunicationTemplates(entityId, 'admissionReminder', 'email');
    const { data: communicationConfig } = useCommunicationConfig(entityId, session);
    const { mutate: sendEmail, isPending: isSending } = useSendAdmissionEmail();

    useEffect(() => {
        if (communicationConfig?.emailConfig?.senderId?.length > 0 && !senderId) {
            setSenderId(communicationConfig.emailConfig.senderId[0]);
        }
    }, [communicationConfig, senderId]);

    const handleTemplateChange = (val: string | number | (string | number)[]) => {
        const templateId = val as string;
        setSelectedTemplateId(templateId);

        const template = templates?.find((t: any) => t._id === templateId);
        if (template) {
            setContent(template.content);
            setSubject(template.subject || '');
            setSendTo(template.sendToNumbers || []);
            setDLT_TE_ID(template.DLT_TE_ID || '');
        }
    };

    const handleSenderId = (val: string | number | (string | number)[]) => {
        setSenderId(val as string);
    };

    const handleSend = () => {
        if (!selectedTemplateId || sendTo.length === 0) {
            showToast('error', 'Please fill all required fields');
            return;
        }

        const dataList = selectedStudents.map(row => {
            const item: any = { ...row };

            if (row.studentDetails) {
                item.fatherMobile = row.studentDetails.fatherMobile;
                item.motherMobile = row.studentDetails.motherMobile;
                item.guardianMobile = row.studentDetails.guardianMobile;
                item.studentAddress = row.studentDetails.address;
                item.socialCategory = row.studentDetails.socialCategory;
                item.studentCity = row.studentDetails.city;
            }

            item.dueAmount = row.dueAmount;
            if (row.installments) {
                item.installments = row.installments.toString();
            }

            return item;
        });

        const payload = {
            dataList,
            content,
            subject,
            sendToNumbers: sendTo,
            senderId,
            DLT_TE_ID,
            entity: entityId,
            session
        };

        sendEmail(payload, {
            onSuccess: () => {
                showToast('success', 'Emails initiated successfully');
                onSuccess?.();
                onClose();
                setSelectedTemplateId('');
                setContent('');
                setSubject('');
                setSendTo([]);
                setSenderId('');
                setDLT_TE_ID('');
            },
            onError: (err: any) => {
                showToast('error', err.response?.data?.message || err.message || 'Failed to send emails');
            }
        });
    };

    if (!isOpen) return null;

    const senderIdOptions = communicationConfig?.emailConfig?.senderId?.map((id: string) => ({ label: id, value: id })) || [];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-2xl mx-4 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h2 className="text-lg font-semibold text-[var(--color-foreground)] flex items-center gap-2">
                        <Mail size={18} className="text-primary" />
                        Send Admission Reminder Email
                    </h2>
                    <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-3 py-3 flex flex-col gap-3">
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        Sending to <span className="font-bold text-[var(--color-foreground)]">{selectedStudents.length}</span> student{selectedStudents.length !== 1 ? 's' : ''}.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <SelectSingle
                            label="Select Template"
                            options={templates?.map((t: any) => ({ label: t.name, value: t._id })) || []}
                            value={selectedTemplateId}
                            onChange={handleTemplateChange}
                            placeholder="Select Template"
                        />
                        <MultiSelect
                            label="Send to Email of"
                            options={SEND_TO_OPTIONS}
                            value={sendTo}
                            onChange={(val) => setSendTo(val as string[])}
                            placeholder="Select recipients"
                        />
                        <SelectSingle
                            label="Select Sender ID"
                            options={senderIdOptions}
                            value={senderId}
                            onChange={handleSenderId}
                            placeholder="Select Sender ID"
                        />
                        {DLT_TE_ID && (
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">DLT_TE_ID</label>
                                <div className="flex items-center h-10 px-3 border border-[var(--color-border)] rounded-md bg-[var(--color-background)]">
                                    <span className="text-sm font-semibold text-[var(--color-foreground)]">{DLT_TE_ID}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {subject && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Subject</label>
                            <div className="flex items-center px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-background)]">
                                <span className="text-sm font-medium text-[var(--color-foreground)]">{subject}</span>
                            </div>
                        </div>
                    )}

                    <TextArea
                        label="Content"
                        value={content}
                        onChange={() => {}}
                        placeholder="Select a template to preview content"
                        readOnly
                        disabled
                        rows={5}
                    />
                </div>

                {/* Footer */}
                <div className="px-3 py-2 border-t border-[var(--color-border)] bg-[var(--color-background)] rounded-b-lg flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSend}
                        disabled={isSending || !selectedTemplateId || sendTo.length === 0}
                    >
                        {isSending ? 'Sending...' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SendEmailModal;
