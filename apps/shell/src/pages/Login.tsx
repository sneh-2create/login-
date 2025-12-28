import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@od-erp/api-client';
import { useAppDispatch } from '@od-erp/store';
import { setCredentials, setAcademicSession, setEntity } from '@od-erp/store';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@od-erp/query';

// Import Assets
import slide1 from '../assets/images/slide1.1.svg';
import slide2 from '../assets/images/slider2.svg';
import slide3 from '../assets/images/slider3.svg';
import topLogo from '../assets/images/top-logo.png';
import welcomeIcon from '../assets/images/welcomeIcon.png';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // UI State
    const [authMode, setAuthMode] = useState<'OTP' | 'PASSWORD'>('OTP');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        { img: slide1, text: "Access Daily and Annual \n Fee Collection Reports" },
        { img: slide2, text: "Effortlessly Capture Student and \n Employee Attendance Data" },
        { img: slide3, text: "Unlock the Power of Examination \n Analysis and Library Management" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [slides.length]);

    // Mutations
    const sendOtpMutation = useMutation({
        mutationFn: (mobile: string) => authService.sendOtp(mobile),
        onSuccess: () => {
            setOtpSent(true);
            setAuthMode('OTP');
            setError(null);
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
            // Update session with preferred session details
            dispatch(setAcademicSession(data.name));
            // You might want to update other session details here if added to sessionSlice (superSession, dates etc)
        }
    });

    const handleAuthSuccess = async (response: any) => {
        // 1. Dispatch Initial Credentials & Entity
        dispatch(setCredentials({
            user: {
                id: response.userId || response._id,
                name: response.name,
                email: response.email || '',
                role: response.userType,
                employeeId: response.employee || response.employeeId,
                permissions: response.permissions ? (Array.isArray(response.permissions) ? response.permissions : []) : [],
            },
            token: response.token,
            preferences: response.userPreferences || null
        }));

        if (response.entity) {
            dispatch(setEntity({
                id: response.entity._id,
                name: response.entity.displayName || response.entity.name,
                type: response.entity.entityType
            }));
            // Set default active session first
            if (response.entity.activeSession) {
                dispatch(setAcademicSession(response.entity.activeSession.name));
            }
        }

        // 2. Check for Preferred Session (The "In-Between" Step)
        if (response.userPreferences && response.userPreferences.session && response.entity) {
            try {
                // If user has a specific preferred session, fetch it
                const sessionData = await fetchSessionMutation.mutateAsync({
                    entityId: response.entity._id,
                    sessionName: response.userPreferences.session
                });
                // Update Redux with the preferred session
                dispatch(setAcademicSession(sessionData.name));
            } catch (err) {
                console.warn('Failed to fetch preferred session, sticking to active session', err);
                // Optional: Show toast or alert like legacy "Preferred session not found..."
            }
        }

        // 3. Navigate to Dashboard
        navigate('/');
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

    const handleGetOtp = () => {
        if (!mobile || mobile.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        sendOtpMutation.mutate(mobile);
    };

    const handleVerifyOtp = () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        verifyOtpMutation.mutate({ mobile, otp });
    };

    const handlePasswordLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobile || !password) {
            setError('Mobile and Password are required');
            return;
        }
        loginMutation.mutate({ mobile, password });
    };

    return (
        <div className="w-screen h-screen bg-[#f2ebf8] flex overflow-hidden lg:p-8 p-4 font-roboto">
            <div className="w-full h-full bg-[#f2ebf8] grid lg:grid-cols-[2.1fr_0.2fr_0.7fr] grid-cols-1">

                {/* Left Side: Carousel */}
                <div className="hidden lg:flex flex-col justify-between h-full">
                    <div className="flex-1 flex items-center justify-center relative">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img src={slide.img} alt="Slide" className="h-[60vh] object-contain" />
                                <h3 className="mt-8 text-3xl font-bold text-gray-800 text-center whitespace-pre-line">
                                    {slide.text}
                                </h3>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-start gap-4 mt-4 h-4 ml-12">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-[10px] rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-gray-800' : 'w-4 bg-white'}`}
                            />
                        ))}
                    </div>

                    <div className="mt-8 text-gray-600 font-bold ml-12">
                        © {new Date().getFullYear()} Okie Dokie
                    </div>
                </div>

                {/* Divider Line (Visual only) */}
                <div className="hidden lg:flex items-center justify-center">
                    <div className="w-1 h-full bg-white opacity-50 rounded-full"></div>
                </div>

                {/* Right Side: Login Card */}
                <div className="relative flex items-center justify-center h-full">
                    <div className="bg-white rounded-[28px] shadow-[0px_0px_22px_5px_rgba(0,0,0,0.03)] p-8 w-full max-w-md h-auto lg:h-[90%] flex flex-col justify-between relative overflow-hidden">

                        {/* Auth Notice Alert could go here */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border-l-4 border-red-500">
                                {error}
                            </div>
                        )}

                        {/* Top Logo */}
                        <div className="absolute top-4 right-[-20px] lg:right-4">
                            <img src={topLogo} alt="Logo" className="w-32 h-32 object-contain opacity-20 lg:opacity-100" />
                        </div>

                        {/* Welcome Message */}
                        <div className="mt-24 mb-10 flex items-center gap-4 ml-4">
                            <img src={welcomeIcon} alt="Welcome" className="w-10 h-10 object-contain" />
                            <h4 className="text-3xl font-bold text-gray-800">Welcome</h4>
                        </div>

                        {/* Form */}
                        <div className="flex-1">
                            <div className="space-y-6">
                                {/* Mobile Input */}
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Mobile"
                                        className="w-full bg-[#FAFBFB] text-gray-600 text-lg py-3 px-6 rounded-[14px] outline-none focus:ring-2 focus:ring-[#9C41ED]/20"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))} // Only numbers
                                        maxLength={10}
                                        disabled={isLoading || otpSent}
                                    />
                                </div>

                                {/* OTP Input */}
                                {authMode === 'OTP' && otpSent && (
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="OTP"
                                            className="w-full bg-[#FAFBFB] text-gray-600 text-lg py-3 px-6 rounded-[14px] outline-none focus:ring-2 focus:ring-[#9C41ED]/20"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/, ''))}
                                            maxLength={6}
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}

                                {/* Password Input */}
                                {authMode === 'PASSWORD' && (
                                    <div>
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            className="w-full bg-[#FAFBFB] text-gray-600 text-lg py-3 px-6 rounded-[14px] outline-none focus:ring-2 focus:ring-[#9C41ED]/20"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}

                            </div>

                            {/* Buttons */}
                            <div className="mt-8">
                                {authMode === 'OTP' && !otpSent && (
                                    <button
                                        onClick={handleGetOtp}
                                        disabled={isLoading}
                                        className="w-full bg-[#9C41ED] hover:bg-[#8a3bd4] text-white font-bold py-3 rounded-[14px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Get OTP'}
                                    </button>
                                )}

                                {authMode === 'OTP' && otpSent && (
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isLoading}
                                        className="w-full bg-[#9C41ED] hover:bg-[#8a3bd4] text-white font-bold py-3 rounded-[14px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                                    </button>
                                )}

                                {authMode === 'PASSWORD' && (
                                    <button
                                        onClick={handlePasswordLogin}
                                        disabled={isLoading}
                                        className="w-full bg-[#9C41ED] hover:bg-[#8a3bd4] text-white font-bold py-3 rounded-[14px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                                    </button>
                                )}
                            </div>

                            {/* Switcher */}
                            <div className="flex items-center justify-center gap-4 mt-6 text-[#9C41ED] font-semibold">
                                {authMode === 'OTP' && !otpSent && (
                                    <button onClick={() => setAuthMode('PASSWORD')} className="hover:underline">
                                        Password Login
                                    </button>
                                )}
                                {authMode === 'PASSWORD' && (
                                    <button onClick={() => setAuthMode('OTP')} className="hover:underline">
                                        OTP Login
                                    </button>
                                )}
                                {otpSent && (
                                    <button onClick={() => setOtpSent(false)} className="hover:underline text-sm">
                                        Change Mobile
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
