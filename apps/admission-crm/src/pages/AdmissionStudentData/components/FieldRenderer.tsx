import React from 'react';
import { Input, Dropdown } from '@od-erp/ui';
import type { StudentField } from '@od-erp/constants';

interface FieldRendererProps {
    field: StudentField;
    value: any;
    onChange: (_value: any) => void;
    error?: string;
    canViewPhone?: boolean;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
    field,
    value,
    onChange,
    error,
    canViewPhone = false,
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    switch (field.fieldType) {
        case 'text':
            return (
                <Input
                    label={field.name}
                    value={value || ''}
                    onChange={handleInputChange}
                    error={error}
                    required={field.required}
                />
            );

        case 'phone':
            return (
                <Input
                    label={field.name}
                    type={canViewPhone ? 'tel' : 'password'}
                    value={value || ''}
                    onChange={handleInputChange}
                    error={error}
                    required={field.required}
                />
            );

        case 'email':
            return (
                <Input
                    label={field.name}
                    type="email"
                    value={value || ''}
                    onChange={handleInputChange}
                    error={error}
                    required={field.required}
                />
            );

        case 'date':
            return (
                <Input
                    label={field.name}
                    type="date"
                    value={value || ''}
                    onChange={handleInputChange}
                    error={error}
                    required={field.required}
                />
            );

        case 'number':
            return (
                <Input
                    label={field.name}
                    type="number"
                    value={value || ''}
                    onChange={handleInputChange}
                    error={error}
                    required={field.required}
                />
            );

        case 'select':
        case 'dropdown':
            return (
                <Dropdown
                    label={field.name}
                    options={
                        field.options?.map((opt) => ({
                            label: opt,
                            value: opt,
                        })) || []
                    }
                    value={value || ''}
                    onChange={onChange}
                    error={error}
                    placeholder={`Select ${field.name}`}
                    searchable
                />
            );

        case 'checkbox':
            return (
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={value || false}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4"
                    />
                    <label className="text-sm">{field.name}</label>
                </div>
            );

        default:
            return null;
    }
};
