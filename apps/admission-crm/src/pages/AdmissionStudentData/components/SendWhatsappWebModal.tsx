import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Button, SelectInput, useToast } from '@od-erp/ui';
import { useCommunicationTemplates, useSendAdmissionWhatsappWeb } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { AdmissionLead } from '@od-erp/types';
import MultiSelect from '../../AdmissionLeads/components/MultiSelect';

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

    // State
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [sendTo, setSendTo] = useState<string[]>([]);
    const [content, setContent] = useState('');

    // Queries
    const { data: templates } = useCommunicationTemplates(entityId, 'admissionReminder', 'whatsApp');
    const { mutate: sendWhatsappWeb, isPending: isSending } = useSendAdmissionWhatsappWeb();

    // Handle Template Selection
    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
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

        // Map data strictly matching Angular implementation
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
                onSuccess?.(); // Clear selection
                onClose();
                // Reset form
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <MessageCircle size={18} className="text-green-600" />
                        Send Multiple Admission Reminder WhatsApp Web
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                    </div>

                    {/* Content Preview */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none min-h-[120px] bg-gray-50 font-medium disabled:opacity-75"
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
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                        {isSending ? 'Sending...' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SendWhatsappWebModal;
