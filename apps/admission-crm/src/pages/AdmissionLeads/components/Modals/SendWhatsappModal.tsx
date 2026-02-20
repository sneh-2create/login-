import React, { useState, useEffect, useMemo } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Button, SelectSingle, MultiSelect, TextArea, useToast } from '@od-erp/ui';
import { useCommunicationTemplates, useCommunicationConfig, useSendAdmissionWhatsapp } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { AdmissionLead } from '@od-erp/types';

interface SendWhatsappModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLeads: AdmissionLead[];
    onSuccess?: () => void;
}

const SEND_TO_OPTIONS = [
    { value: 'primary', label: 'PRIMARY' },
    { value: 'father', label: 'FATHER' },
    { value: 'mother', label: 'MOTHER' },
    { value: 'guardian', label: 'GUARDIAN' }
];

const SendWhatsappModal = ({ isOpen, onClose, selectedLeads, onSuccess }: SendWhatsappModalProps) => {
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
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    // Queries
    const { data: templates } = useCommunicationTemplates(entityId, 'admissionReminder', 'whatsApp');
    const { data: config } = useCommunicationConfig(entityId, session);
    const { mutate: sendWhatsapp, isPending: isSending } = useSendAdmissionWhatsapp();

    // Derived Data
    const senderIdList = useMemo(() => config?.smsConfig?.senderId || [], [config]);
    
    // Set default sender ID (Internal logic, not shown in UI per Angular parity)
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
            setSelectedTemplate(template);
            setContent(template.content);
            setDltTeId(template.DLT_TE_ID);
            setTemplateType(template.templateType || template.templayeType); // Handle potential typo from API
            setSendTo(template.sendToNumbers || []);
        } else {
            setSelectedTemplate(null);
            setContent('');
            setDltTeId('');
            setTemplateType('');
            setSendTo([]);
        }
    };

    const handleSend = () => {
        if (!selectedTemplateId || sendTo.length === 0) {
            showToast('error', 'Please fill all required fields');
            return;
        }

        if (!senderId) {
             if(senderIdList.length === 0) {
                 showToast('error', 'Communication Config not found. Please contact admin.');
                 return;
             }
        }

        // Map data strictly matching Angular implementation
        const dataList = selectedLeads.map(row => {
            const item: any = { ...row }; // Start with all row data
            
            // Explicit mappings from Angular sendWhatsappSms()
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
            DLT_TE_ID: dltTeId,
            sendToNumbers: sendTo,
            senderId,
            entity: entityId,
            session,
            templateType,
            ...selectedTemplate // Spread remaining template props as per Angular
        };

        sendWhatsapp(payload, {
            onSuccess: () => {
                showToast('success', 'WhatsApp messages will be initiated');
                onSuccess?.(); // Call the provided onSuccess callback
                onClose();
                // Reset form
                setSelectedTemplateId('');
                setContent('');
                setSendTo([]);
                setSelectedTemplate(null);
            },
            onError: (err: any) => {
                showToast('error', err.response?.data?.message || err.message || 'Failed to send WhatsApp');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col">
                <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <MessageCircle size={18} className="text-primary" />
                        Send Multiple Admission Reminder Whatsapp SMS
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-3 py-2">
                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Template Select */}
                        <div>
                            <SelectSingle
                                label="Select Template"
                                options={templates?.map((t: any) => ({ label: t.name, value: t._id })) || []}
                                value={selectedTemplateId}
                                onChange={(val) => {
                                    const e = { target: { value: val as string } } as React.ChangeEvent<HTMLSelectElement>;
                                    handleTemplateChange(e);
                                }}
                                placeholder="Select Template"
                            />
                        </div>

                        {/* Send To MultiSelect */}
                        <div>
                           <MultiSelect
                                label="Send to Numbers of"
                                options={SEND_TO_OPTIONS}
                                value={sendTo}
                                onChange={(val) => setSendTo(val as string[])}
                                placeholder="Send to Numbers of"
                           />
                        </div>
                    </div>

                    {/* Content Preview */}
                    <div>
                        <TextArea
                            label="Content"
                            placeholder="Content"
                            value={content}
                            disabled
                            rows={5}
                        />
                    </div>
                </div>

                <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSend}
                        disabled={isSending || !selectedTemplateId}
                        className="flex items-center gap-2"
                    >
                        {isSending ? 'Sending...' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SendWhatsappModal;
