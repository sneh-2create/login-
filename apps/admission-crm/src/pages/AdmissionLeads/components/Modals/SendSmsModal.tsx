import React, { useState, useEffect, useMemo } from 'react';
import { X, Send } from 'lucide-react';
import { Button, SelectInput, useToast } from '@od-erp/ui';
import { useCommunicationTemplates, useCommunicationConfig, useSendAdmissionSms } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { AdmissionLead } from '@od-erp/types';
import MultiSelect from '../MultiSelect';

interface SendSmsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLeads: AdmissionLead[];
}

const SEND_TO_OPTIONS = [
    { value: 'primary', label: 'PRIMARY' },
    { value: 'father', label: 'FATHER' },
    { value: 'mother', label: 'MOTHER' },
    { value: 'guardian', label: 'GUARDIAN' }
];

const SendSmsModal = ({ isOpen, onClose, selectedLeads }: SendSmsModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const { showToast } = useToast();

    // State
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [senderId, setSenderId] = useState('');
    const [sendTo, setSendTo] = useState<string[]>([]);
    const [content, setContent] = useState('');
    const [dltTeId, setDltTeId] = useState('');
    const [templateType, setTemplateType] = useState('');

    // Queries
    const { data: templates } = useCommunicationTemplates(entityId, 'admissionReminder', 'sms');
    const { data: config } = useCommunicationConfig(entityId, session);
    const { mutate: sendSms, isPending: isSending } = useSendAdmissionSms();

    // Derived Data
    const senderIdList = useMemo(() => config?.smsConfig?.senderId || [], [config]);
    
    // Set default sender ID
    useEffect(() => {
        if (senderIdList.length > 0 && !senderId) {
            setSenderId(senderIdList[0]);
        }
    }, [senderIdList, senderId]);

    // Handle Template Selection
    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        
        const template = templates?.find((t: any) => t._id === templateId);
        if (template) {
            setContent(template.content);
            setDltTeId(template.DLT_TE_ID);
            setTemplateType(template.templayeType); // Note: typo in API response 'templayeType' matches Angular
            setSendTo(template.sendToNumbers || []);
        }
    };

    const handleSend = () => {
        if (!selectedTemplateId || !senderId || sendTo.length === 0) {
            showToast('error', 'Please fill all required fields');
            return;
        }

        // Map data strictly matching Angular implementation
        const dataList = selectedLeads.map(row => {
            const item: any = {};
            item.name = row.name;
            item.fatherName = row.fatherName;
            item.regNo = row.regNo;
            item.course = row.course;
            item.stream = row.stream;
            item.batch = row.batch;
            item.section = row.section; // Note: AdmissionLead type might might not have section, but we pass what we have
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

            return item;
        });

        const payload = {
            dataList,
            content,
            DLT_TE_ID: dltTeId,
            sendToNumbers: sendTo,
            senderId,
            entity: entityId,
            session,
            templateType
        };

        sendSms(payload, {
            onSuccess: () => {
                showToast('success', 'Messages initiated successfully');
                onClose();
                // Reset form
                setSelectedTemplateId('');
                setContent('');
                setSendTo([]);
            },
            onError: (err: any) => {
                showToast('error', err.response?.data?.message || err.message || 'Failed to send SMS');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Send size={18} className="text-blue-600" />
                        Send Multiple Admission Reminder SMS
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
                                label="Send to Numbers of"
                                options={SEND_TO_OPTIONS}
                                value={sendTo}
                                onChange={setSendTo}
                                placeholder="Send to Numbers of"
                           />
                        </div>

                        {/* Sender ID Select */}
                        <div>
                            <SelectInput
                                label="Select Sender ID"
                                value={senderId}
                                onChange={(e) => setSenderId(e.target.value)}
                                options={senderIdList.map((id: string) => ({ label: id, value: id }))}
                                placeholder="Select Sender ID"
                            />
                        </div>

                        {/* DLT ID Display */}
                        <div className="flex flex-col justify-center">
                            <span className="text-sm font-bold text-gray-700">DLT_TE_ID</span>
                            <span className="text-sm text-gray-600">{dltTeId || '-'}</span>
                        </div>
                    </div>

                    {/* Content Preview */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[120px] bg-gray-50 font-medium"
                            placeholder="Content preview..."
                            value={content}
                            readOnly
                        />
                         <div className="text-xs text-gray-500 mt-1 text-right">
                            Sending to {selectedLeads.length} leads
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

export default SendSmsModal;
