import React from "react";
import logo from "../../assets/icons/logo.png";
import AuthToggle from "../Auth/AuthToggle.jsx";
import OtpForm from "../Auth/OtpForm.jsx";
import LoginForm from "../Auth/LoginForm.jsx";

export default function AuthLayout({ mode, onModeChange }) {
  return (
    <div className="w-full max-w-[480px] animate-fade-in rounded-[24px] bg-white p-10 shadow-[0px_25px_50px_rgba(0,0,0,0.15)]">
      <div className="mb-6 flex flex-col items-center gap-2">
        <img
          src={logo}
          alt="Okie Dokie logo"
          className="h-10 w-auto object-contain"
        />
        <p className="text-[30px] font-bold leading-[36px] tracking-[-0.5px] text-[#333333]">
          Welcome!
        </p>
        <p className="text-center text-[16px] leading-[24px] text-[#666666]">
          Sign in to access your campus management portal
        </p>
      </div>

      <AuthToggle mode={mode} onChange={onModeChange} />

      {mode === "otp" ? <OtpForm /> : <LoginForm />}

      <div className="mt-10 border-t border-[#f9fafb] pt-4">
        <p className="text-center text-[12px] text-[#9ca3af]">
          © 2026 Okie Dokie
        </p>
      </div>
    </div>
  );
}
