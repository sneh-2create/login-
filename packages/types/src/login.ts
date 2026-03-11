import React from 'react';

export interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    bgClass: string;
    hoverBgClass: string;
    iconBgClass?: string;
    iconColorClass?: string;
}

export interface AuthToggleProps {
    mode: 'OTP' | 'PASSWORD';
    onChange: (_mode: 'OTP' | 'PASSWORD') => void;
}

export interface LoginInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    error?: string;
}

export interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
}

export interface UseTypingTextOptions {
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseTime?: number;
}
