import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Button, SelectSingle, MultiSelect, TextArea, useToast } from '@od-erp/ui';
import { useCommunicationTemplates, useSendAdmissionWhatsappWeb } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { AdmissionLead } from '@od-erp/types';

interface SendWhatsappWebModalProps {
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

const SendWhatsappWebModal = ({ isOpen, onClose, selectedStudents, onSuccess }: SendWhatsappWebModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const { showToast } = useToast();

    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [sendTo, setSendTo] = useState<string[]>([]);
    const [content, setContent] = useState('');

    const { data: templates } = useCommunicationTemplates(entityId, 'admissionReminder', 'whatsApp');
    const { mutate: sendWhatsappWeb, isPending: isSending } = useSendAdmissionWhatsappWeb();

    const handleTemplateChange = (val: string | number | (string | number)[]) => {
        const templateId = val as string;
        setSelectedTemplateId(templateId);

        const template = templates?.find((t: any) => t._id === templateId);
        if (template) {
            setContent(template.content);
            setSendTo(template.sendToNumbers || []);
        }
    };

    const handleSend = () => {
        if (!selectedTemplateId || sendTo.length === 0) {
            showToast('error', 'Please fill all required fields');
            return;
        }

        const dataList = selectedStudents.map(row => {
            const item: any = {};
            item.name = row.name;
            item.fatherName = row.fatherName;
            item.regNo = row.regNo;
            item.course = row.course;
            item.stream = row.stream;
            item.batch = row.batch;
            item.section = row.section;
            item.phone = row.phone;
            item._id = row._id;

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
            sendToNumbers: sendTo,
            entity: entityId,
            session
        };

        sendWhatsappWeb(payload, {
            onSuccess: () => {
                showToast('success', 'WhatsApp Web messages will be initiated');
                onSuccess?.();
                onClose();
                setSelectedTemplateId('');
                setContent('');
                setSendTo([]);
            },
            onError: (err: any) => {
                showToast('error', err.response?.data?.message || err.message || 'Failed to send WhatsApp Web messages');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-2xl mx-4 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h2 className="text-lg font-semibold text-[var(--color-foreground)] flex items-center gap-2">
                        <MessageCircle size={18} className="text-primary" />
                        Send Admission Reminder WhatsApp Web
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
                            label="Send to Numbers of"
                            options={SEND_TO_OPTIONS}
                            value={sendTo}
                            onChange={(val) => setSendTo(val as string[])}
                            placeholder="Select recipients"
                        />
                    </div>

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

export default SendWhatsappWebModal;
