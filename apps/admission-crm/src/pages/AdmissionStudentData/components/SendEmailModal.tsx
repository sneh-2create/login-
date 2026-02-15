import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { Button, SelectInput, useToast } from '@od-erp/ui';
import { useCommunicationTemplates, useSendAdmissionEmail, useCommunicationConfig } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { AdmissionLead } from '@od-erp/types';
import MultiSelect from '../../AdmissionLeads/components/MultiSelect';

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

    // State
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [sendTo, setSendTo] = useState<string[]>([]);
    const [content, setContent] = useState('');
    const [subject, setSubject] = useState('');
    const [senderId, setSenderId] = useState('');
    const [DLT_TE_ID, setDLT_TE_ID] = useState('');

    // Queries
    const { data: templates } = useCommunicationTemplates(entityId, 'admissionReminder', 'email');
    const { data: communicationConfig } = useCommunicationConfig(entityId, session);
    const { mutate: sendEmail, isPending: isSending } = useSendAdmissionEmail();

    // Handle Template Selection
    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        
        const template = templates?.find((t: any) => t._id === templateId);
        if (template) {
            setContent(template.content);
            setSubject(template.subject || '');
            setSendTo(template.sendToNumbers || []);
            setDLT_TE_ID(template.DLT_TE_ID || '');
        }
    };

    // Set default sender ID when config loads
    React.useEffect(() => {
        if (communicationConfig?.emailConfig?.senderId?.length > 0 && !senderId) {
            setSenderId(communicationConfig.emailConfig.senderId[0]);
        }
    }, [communicationConfig, senderId]);

    const handleSend = () => {
        if (!selectedTemplateId || sendTo.length === 0) {
            showToast('error', 'Please fill all required fields');
            return;
        }

        // Map data strictly matching Angular implementation
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
                onSuccess?.(); // Clear selection
                onClose();
                // Reset form
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Mail size={18} className="text-blue-600" />
                        Send Multiple Admission Reminder Email
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {/* Template Select */}
                        <div>
                            <SelectInput
                                label="Select Template"
                                value={selectedTemplateId}
                                onChange={handleTemplateChange}
                                options={templates?.map((t: any) => ({ label: t.name, value: t._id })) || []}
                                placeholder="Select Template"
                            />
                        </div>

                        {/* Send To MultiSelect */}
                        <div>
                           <MultiSelect
                                label="Send to Email of"
                                options={SEND_TO_OPTIONS}
                                value={sendTo}
                                onChange={setSendTo}
                                placeholder="Send to Email of"
                           />
                        </div>

                        {/* Sender ID Select */}
                        <div>
                            <SelectInput
                                label="Select Sender ID"
                                value={senderId}
                                onChange={(e) => setSenderId(e.target.value)}
                                options={communicationConfig?.emailConfig?.senderId?.map((id: string) => ({ label: id, value: id })) || []}
                                placeholder="Select Sender ID"
                            />
                        </div>

                        {/* DLT_TE_ID Display */}
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">DLT_TE_ID</label>
                            <div className="flex items-center h-10 px-3 border border-gray-300 rounded-md bg-gray-50">
                                <span className="text-sm font-semibold text-gray-800">{DLT_TE_ID || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Subject */}
                    {subject && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 font-medium"
                                value={subject}
                                readOnly
                            />
                        </div>
                    )}

                    {/* Content Preview */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[120px] bg-gray-50 font-medium disabled:opacity-75"
                            placeholder="Content"
                            value={content}
                            readOnly
                            disabled
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                            Sending to {selectedStudents.length} students
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSend}
                        disabled={isSending || !selectedTemplateId}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                        {isSending ? 'Sending...' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SendEmailModal;
