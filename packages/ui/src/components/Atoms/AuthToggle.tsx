import React from 'react';
import { AuthToggleProps } from '@od-erp/types';

export const AuthToggle: React.FC<AuthToggleProps> = ({ mode, onChange }) => {
    const isOtp = mode === 'OTP';

    return (
        <div className="mb-6 mt-6 flex h-[52px] w-full rounded-[12px] bg-[var(--login-bg-gray)] p-1">
            <button
                type="button"
                onClick={() => onChange('OTP')}
                className={`flex-1 rounded-[8px] text-[14px] font-semibold transition-colors ${isOtp
                    ? 'bg-[var(--login-primary)] text-white shadow-sm'
                    : 'text-[var(--login-text-muted)] hover:text-[var(--ui-gray-700)]'
                    }`}
            >
                OTP Login
            </button>
            <button
                type="button"
                onClick={() => onChange('PASSWORD')}
                className={`flex-1 rounded-[8px] text-[14px] font-semibold transition-colors ${!isOtp
                    ? 'bg-[var(--login-primary)] text-white shadow-sm'
                    : 'text-[var(--login-text-muted)] hover:text-[var(--ui-gray-700)]'
                    }`}
            >
                Password
            </button>
        </div>
    );
};
