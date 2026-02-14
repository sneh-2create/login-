import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { authService } from '@od-erp/api-client';
import { useAppDispatch } from '@od-erp/store';
import { setCredentials, setAcademicSession, setEntity } from '@od-erp/store';
import { Users, CreditCard, CalendarCheck2, BarChart3, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@od-erp/query';
import { FeatureCard, AuthToggle, LoginInput, LoginButton, useTypingText } from '@od-erp/ui';
import { LOGIN_HEADING_PHRASES, OTP_COUNTDOWN_SECONDS } from '@od-erp/constants';

// Import Assets
import logo from '../assets/images/logo.png';

// ============================================================================
// UTILITY: Validation Functions (Keep local as they're specific to login)
// ============================================================================
const sanitizePhone = (value: string = ''): string => {
    return String(value).replace(/\D/g, '').slice(0, 10);
};

const phoneErrorMessage = (value: string = ''): string => {
    const digits = sanitizePhone(value);
    if (!digits) return '';
    if (digits.length < 10) return 'Please enter 10 digit phone number';
    return '';
};

const sanitizePassword = (raw: string = ''): string => {
    return String(raw).replace(/[()[\]{}<>\s+\-=]/g, '');
};

const passwordErrorMessage = (password: string = '', attemptedInvalid: boolean = false): string => {
    if (!password && !attemptedInvalid) return '';
    if (attemptedInvalid) return "Spaces, brackets, '+', '-' and '=' are not allowed";
    if (String(password).trim().length < 3) return 'Password must be at least 3 characters';
    return '';
};

const isPhoneValid = (value: string = ''): boolean => {
    return sanitizePhone(value).length === 10;
};

const isPasswordValid = (password: string = ''): boolean => {
    return String(password).trim().length >= 3;
};

// ============================================================================
// MAIN LOGIN COMPONENT
// ============================================================================
export const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Typing Animation
    const typed = useTypingText([...LOGIN_HEADING_PHRASES], {
        typingSpeed: 100,
        deletingSpeed: 50,
        pauseTime: 2000
    });

    // UI State
    const [authMode, setAuthMode] = useState<'OTP' | 'PASSWORD'>('OTP');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordInvalidAttempt, setPasswordInvalidAttempt] = useState(false);

    // Form Data
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));

    // OTP Input Refs
    const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // OTP Countdown
    const [countdown, setCountdown] = useState(OTP_COUNTDOWN_SECONDS);

    // Countdown Effect
    useEffect(() => {
        if (!otpSent || countdown <= 0) return;
        const timer = setInterval(() => setCountdown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [otpSent, countdown]);

    // ========================================================================
    // MUTATIONS (Existing Auth Logic)
    // ========================================================================
    const sendOtpMutation = useMutation({
        mutationFn: (mobile: string) => authService.sendOtp(mobile),
        onSuccess: () => {
            setOtpSent(true);
            setCountdown(OTP_COUNTDOWN_SECONDS);
            setOtp(Array(6).fill(''));
            setError(null);
            setTimeout(() => {
                otpInputsRef.current[0]?.focus();
            }, 50);
        },
        onError: (err: any) => {
            console.error('Send OTP failed', err);
            setError(err.response?.data?.message || 'Failed to send OTP');
        }
    });

    const fetchSessionMutation = useMutation({
        mutationFn: ({ entityId, sessionName }: { entityId: string; sessionName: string }) =>
            authService.fetchSession(entityId, sessionName),
        onSuccess: (data) => {
            dispatch(setAcademicSession(data.name));
        }
    });

    const handleAuthSuccess = async (response: any) => {
        // 1. Extract Entity Details & Theme
        let entityDetails: any = undefined;
        if (response.entity) {
            let primaryColour: string | undefined;
            let secondaryColour: string | undefined;

            if (response.entity.entityPreferences) {
                const prefPrimary = response.entity.entityPreferences.primaryColour;
                if (prefPrimary && prefPrimary !== '#ffffff' && prefPrimary !== '#fff') {
                    primaryColour = prefPrimary;
                }
                if (response.entity.entityPreferences.secondaryColour) {
                    secondaryColour = response.entity.entityPreferences.secondaryColour;
                }
            }

            entityDetails = {
                id: response.entity._id,
                logo: response.entity.logo,
                displayName: response.entity.displayName || response.entity.name,
                primaryColour,
                secondaryColour,
                qac: response.entity.qac,
                activeSession: response.entity.activeSession,
                entityPreferences: response.entity.entityPreferences,
                type: response.entity.entityType
            };
        }

        // 2. Dispatch Initial Credentials with Entity Details
        dispatch(setCredentials({
            user: {
                id: response.userId || response._id,
                name: response.name,
                email: response.email || '',
                role: response.userType,
                userType: response.userType,
                employeeId: response.employee || response.employeeId,
                mobile: response.mobile || mobile,
                myOperatorId: response.myOperatorId,
                permissions: response.permissions ? (Array.isArray(response.permissions) ? response.permissions : []) : [],
                entityGroup: response.entityGroup || [],
            },
            token: response.token,
            preferences: response.userPreferences || null,
            entityDetails: entityDetails
        }));

        // WORKAROUND: Store credentials for micro-frontends to re-login
        const isSecure = window.location.protocol === 'https:';
        const hostname = window.location.hostname;
        const domain = hostname.includes('oderp.in') ? '.oderp.in' : undefined;

        if (mobile) Cookies.set('login_mobile', mobile, { path: '/', secure: isSecure, sameSite: 'Lax', domain });
        if (password) Cookies.set('login_password', password, { path: '/', secure: isSecure, sameSite: 'Lax', domain });

        if (response.entity) {
            dispatch(setEntity({
                id: response.entity._id,
                name: response.entity.displayName || response.entity.name,
                type: response.entity.entityType
            }));

            if (response.entity.activeSession) {
                dispatch(setAcademicSession(response.entity.activeSession.name));
            }
        }

        // 3. Navigation & Redirect Logic
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect');

        if (redirectUrl) {
            console.log('Redirecting to origin:', redirectUrl);
            window.location.href = redirectUrl;
            return;
        }

        // 4. Default Navigation Logic
        switch (response.userType) {
            case 'od1':
                navigate('/dashboard');
                break;
            case 'od2':
            case 'od3':
                if (response.entity) {
                    if (!response.entity.activeSession) {
                        navigate('/schoolSetup/academicSession');
                        return;
                    }

                    if (response.userPreferences && response.userPreferences.session) {
                        try {
                            const sessionData = await fetchSessionMutation.mutateAsync({
                                entityId: response.entity._id,
                                sessionName: response.userPreferences.session
                            });
                            dispatch(setAcademicSession(sessionData.name));
                            navigate('/entity/dashboard');
                        } catch (err) {
                            console.warn('Preferred session fetch failed, sticking to active session');
                            navigate('/entity/dashboard');
                        }
                    } else {
                        navigate('/entity/dashboard');
                    }
                } else {
                    navigate('/');
                }
                break;
            case 'od4':
                navigate('/');
                break;
            default:
                navigate('/');
                break;
        }
    };

    const loginMutation = useMutation({
        mutationFn: (credentials: any) => authService.login(credentials),
        onSuccess: handleAuthSuccess,
        onError: (err: any) => {
            console.error('Login failed', err);
            setError(err.response?.data?.message || 'Invalid Credentials');
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: ({ mobile, otp }: { mobile: string; otp: string }) => authService.verifyOtp(mobile, otp, 'erp'),
        onSuccess: handleAuthSuccess,
        onError: (err: any) => {
            console.error('Verify OTP failed', err);
            setError(err.response?.data?.message || 'Invalid OTP');
        }
    });

    const isLoading = sendOtpMutation.isPending || loginMutation.isPending || verifyOtpMutation.isPending || fetchSessionMutation.isPending;

    // ========================================================================
    // HANDLERS
    // ========================================================================
    const handleGetOtp = () => {
        if (!isPhoneValid(mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        sendOtpMutation.mutate(mobile);
    };

    const handleVerifyOtp = () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        verifyOtpMutation.mutate({ mobile, otp: otpCode });
    };

    const handlePasswordLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPhoneValid(mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        if (!isPasswordValid(password)) {
            setError('Password must be at least 3 characters');
            return;
        }
        loginMutation.mutate({ mobile, password });
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 5) {
            otpInputsRef.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, event: React.KeyboardEvent) => {
        if (event.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputsRef.current[index - 1]?.focus();
        }
    };

    const handleModeChange = (newMode: 'OTP' | 'PASSWORD') => {
        setAuthMode(newMode);
        setOtpSent(false);
        setError(null);
        setOtp(Array(6).fill(''));
    };

    const handleResendOtp = () => {
        if (countdown > 0) return;
        sendOtpMutation.mutate(mobile);
    };

    const getMobileError = () => phoneErrorMessage(mobile);
    const getPasswordError = () => passwordErrorMessage(password, passwordInvalidAttempt);

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="min-h-screen animate-fade-in bg-[linear-gradient(144.583deg,var(--login-bg-gradient-start)_0%,var(--login-bg-gradient-end)_70.711%)] font-sans flex items-center justify-center">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">

                    {/* Left: Feature Panel - Hidden on mobile */}
                    <div className="hidden md:block md:w-1/2 md:pl-6 md:transform md:translate-x-4">
                        <div className="max-w-lg">
                            {/* Logo */}
                            <div className="mb-6">
                                <img src={logo} alt="Okie Dokie logo" className="h-14 w-auto object-contain" />
                            </div>

                            {/* Typing Headline */}
                            <div className="mb-6">
                                <h1 className="text-4xl md:text-5xl font-bold text-[var(--login-text-primary)] leading-tight">Transform Your</h1>
                                <p className="text-4xl md:text-5xl font-bold text-[var(--login-primary)] leading-tight">{typed || '\u00A0'}</p>
                            </div>

                            {/* Tagline */}
                            <p className="text-lg text-[var(--login-text-secondary)] mb-6">
                                Streamline admissions, track attendance, manage fees — all in one powerful platform.
                            </p>

                            {/* Feature Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <FeatureCard
                                    icon={Users}
                                    title="1000+ Students"
                                    subtitle="Manage efficiently"
                                    bgClass="bg-[var(--login-feature-purple-bg)]"
                                    hoverBgClass="hover:bg-[var(--login-feature-purple-hover)]"
                                    iconBgClass="bg-[var(--login-feature-purple-icon-bg)]"
                                    iconColorClass="text-[var(--login-feature-purple-icon)]"
                                />
                                <FeatureCard
                                    icon={CreditCard}
                                    title="Fee Management"
                                    subtitle="Automated"
                                    bgClass="bg-[var(--login-feature-green-bg)]"
                                    hoverBgClass="hover:bg-[var(--login-feature-green-hover)]"
                                    iconBgClass="bg-[var(--login-feature-green-icon-bg)]"
                                    iconColorClass="text-[var(--login-feature-green-icon)]"
                                />
                                <FeatureCard
                                    icon={CalendarCheck2}
                                    title="Attendance"
                                    subtitle="Real-time"
                                    bgClass="bg-[var(--login-feature-red-bg)]"
                                    hoverBgClass="hover:bg-[var(--login-feature-red-hover)]"
                                    iconBgClass="bg-[var(--login-feature-red-icon-bg)]"
                                    iconColorClass="text-[var(--login-feature-red-icon)]"
                                />
                                <FeatureCard
                                    icon={BarChart3}
                                    title="Analytics"
                                    subtitle="Data insights"
                                    bgClass="bg-[var(--login-feature-yellow-bg)]"
                                    hoverBgClass="hover:bg-[var(--login-feature-yellow-hover)]"
                                    iconBgClass="bg-[var(--login-feature-yellow-icon-bg)]"
                                    iconColorClass="text-[var(--login-feature-yellow-icon)]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Auth Card */}
                    <div className="w-full md:w-1/2 flex justify-center">
                        <div className="w-full max-w-[480px] rounded-[24px] bg-white p-10 shadow-[0px_25px_50px_var(--login-card-shadow)]">

                            {/* Logo & Welcome */}
                            <div className="mb-6 flex flex-col items-center gap-2">
                                <img src={logo} alt="Okie Dokie logo" className="h-10 w-auto object-contain" />
                                <p className="text-[30px] font-bold leading-[36px] tracking-[-0.5px] text-[var(--login-text-primary)]">
                                    Welcome!
                                </p>
                                <p className="text-center text-[16px] leading-[24px] text-[var(--login-text-secondary)]">
                                    Sign in to access your campus management portal
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border-l-4 border-red-500">
                                    {error}
                                </div>
                            )}

                            {/* Auth Toggle */}
                            {!otpSent && <AuthToggle mode={authMode} onChange={handleModeChange} />}

                            {/* OTP MODE */}
                            {authMode === 'OTP' && (
                                <>
                                    {!otpSent ? (
                                        <div className="mt-2 space-y-4">
                                            <LoginInput
                                                label="Mobile Number"
                                                type="tel"
                                                value={mobile}
                                                maxLength={10}
                                                inputMode="numeric"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(sanitizePhone(e.target.value))}
                                                placeholder="Enter mobile number"
                                                error={getMobileError()}
                                                disabled={isLoading}
                                            />
                                            <LoginButton
                                                type="button"
                                                onClick={handleGetOtp}
                                                disabled={!isPhoneValid(mobile)}
                                                isLoading={isLoading}
                                            >
                                                Send OTP
                                            </LoginButton>
                                        </div>
                                    ) : (
                                        <div className="mt-4 space-y-4">
                                            {/* OTP Header */}
                                            <div className="space-y-1">
                                                <p className="text-[16px] font-semibold text-[var(--ui-gray-900)]">Enter OTP</p>
                                                <p className="text-[12px] text-[var(--login-text-muted)]">
                                                    We&apos;ve sent a 6-digit code to {mobile}
                                                </p>
                                            </div>

                                            {/* OTP Input Boxes */}
                                            <div className="flex justify-between gap-2">
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        ref={(el) => {
                                                            otpInputsRef.current[index] = el;
                                                        }}
                                                        type="tel"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                        className="h-12 w-10 flex-1 rounded-[8px] border border-[var(--login-border)] text-center text-[18px] font-semibold text-[var(--ui-gray-900)] outline-none transition focus:border-[var(--login-primary)] focus:ring-2 focus:ring-[var(--login-primary)]/20"
                                                        disabled={isLoading}
                                                    />
                                                ))}
                                            </div>

                                            {/* Countdown */}
                                            <div className="flex items-center justify-between text-[12px] text-[var(--login-text-muted)]">
                                                <span>
                                                    Time remaining:{' '}
                                                    <span className="font-semibold text-[var(--ui-gray-900)]">
                                                        00:{String(countdown).padStart(2, '0')}
                                                    </span>
                                                </span>
                                                {countdown === 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleResendOtp}
                                                        className="font-semibold text-[var(--login-primary)] hover:underline"
                                                    >
                                                        Resend OTP
                                                    </button>
                                                )}
                                            </div>

                                            <LoginButton type="button" onClick={handleVerifyOtp} isLoading={isLoading}>
                                                Verify OTP
                                            </LoginButton>

                                            {/* Change Mobile */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOtpSent(false);
                                                    setOtp(Array(6).fill(''));
                                                    setError(null);
                                                }}
                                                className="w-full text-center text-[12px] font-medium text-[var(--login-text-muted)] transition-colors hover:text-[var(--ui-gray-900)] hover:underline"
                                            >
                                                Change Mobile Number
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* PASSWORD MODE */}
                            {authMode === 'PASSWORD' && (
                                <form onSubmit={handlePasswordLogin} className="mt-2 space-y-4">
                                    <LoginInput
                                        label="Mobile Number"
                                        type="tel"
                                        value={mobile}
                                        maxLength={10}
                                        inputMode="numeric"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(sanitizePhone(e.target.value))}
                                        placeholder="Enter mobile number"
                                        error={getMobileError()}
                                        disabled={isLoading}
                                    />

                                    {/* Password Input with Toggle */}
                                    <div className="space-y-2">
                                        <label className="text-[14px] font-semibold text-[var(--ui-gray-700)]">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => {
                                                    const raw = e.target.value || '';
                                                    const sanitized = sanitizePassword(raw);
                                                    if (sanitized !== raw) {
                                                        setPasswordInvalidAttempt(true);
                                                        setTimeout(() => setPasswordInvalidAttempt(false), 2000);
                                                    }
                                                    setPassword(sanitized);
                                                }}
                                                placeholder="Enter password"
                                                className="h-[54px] w-full rounded-[12px] border border-[var(--login-border)] bg-white px-3 pr-10 text-[16px] text-[var(--ui-gray-900)] outline-none transition focus:border-[var(--login-primary)] focus:ring-2 focus:ring-[var(--login-primary)]/10"
                                                disabled={isLoading}
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ui-gray-400)] transition-colors hover:text-[var(--ui-gray-600)]"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {getPasswordError() && (
                                            <p className="text-[12px] text-red-500">{getPasswordError()}</p>
                                        )}
                                    </div>

                                    {/* Forgot Password */}
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="text-[12px] font-medium text-[var(--login-text-muted)] transition-colors hover:text-[var(--ui-gray-900)] hover:underline"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <LoginButton
                                        type="submit"
                                        disabled={!isPhoneValid(mobile) || !isPasswordValid(password)}
                                        isLoading={isLoading}
                                    >
                                        Sign In
                                    </LoginButton>
                                </form>
                            )}

                            {/* Footer */}
                            <div className="mt-10 border-t border-[var(--ui-gray-50)] pt-4">
                                <p className="text-center text-[12px] text-[var(--ui-gray-400)]">
                                    © {new Date().getFullYear()} Okie Dokie
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
