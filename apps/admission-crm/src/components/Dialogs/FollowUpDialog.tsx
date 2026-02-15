import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@od-erp/ui';

interface FollowUpDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (_data: FollowUpData) => void;
    isLoading?: boolean;
}

export interface FollowUpData {
    date: string;
    time: string;
    remark: string;
}

const FollowUpDialog = ({ isOpen, onClose, onSubmit, isLoading = false }: FollowUpDialogProps) => {
    const [formData, setFormData] = useState<FollowUpData>({
        date: '',
        time: '',
        remark: ''
    });
    
    const [errors, setErrors] = useState<Partial<FollowUpData>>({});
    
    // Initialize with current date and time
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;
            
            setFormData({
                date: dateStr,
                time: timeStr,
                remark: ''
            });
            setErrors({});
        }
    }, [isOpen]);
    
    // Validate that time is in the future
    const validateTime = (date: string, time: string): boolean => {
        if (!date || !time) return false;
        
        const [hours, minutes] = time.split(':').map(Number);
        const selectedDateTime = new Date(date);
        selectedDateTime.setHours(hours, minutes, 0, 0);
        
        const now = new Date();
        
        return selectedDateTime > now;
    };
    
    const handleTimeChange = (newTime: string) => {
        setFormData(prev => ({ ...prev, time: newTime }));
        
        if (formData.date && !validateTime(formData.date, newTime)) {
            setErrors(prev => ({ ...prev, time: "Can't set time before current time" }));
        } else {
            setErrors(prev => ({ ...prev, time: undefined }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Partial<FollowUpData> = {};
        
        if (!formData.date) {
            newErrors.date = 'Field required';
        }
        
        if (!formData.time) {
            newErrors.time = 'Field required';
        } else if (formData.date && !validateTime(formData.date, formData.time)) {
            newErrors.time = "Can't set time before current time";
        }
        
        if (!formData.remark || formData.remark.trim().length === 0) {
            newErrors.remark = 'Field required';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        onSubmit(formData);
    };
    
    const handleCancel = () => {
        setFormData({ date: '', time: '', remark: '' });
        setErrors({});
        onClose();
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Select Date</h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Date and Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Date Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                                        errors.date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                                )}
                            </div>
                            
                            {/* Time Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                                        errors.time ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.time && (
                                    <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Remark Textarea */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remark
                            </label>
                            <textarea
                                rows={8}
                                value={formData.remark}
                                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                                placeholder="Remark"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
                                    errors.remark ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.remark && (
                                <p className="mt-1 text-sm text-red-600">{errors.remark}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2"
                        >
                            {isLoading ? 'Updating...' : 'Update'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FollowUpDialog;
