import React from "react";

export default function AuthToggle({ mode, onChange }) {
  const isOtp = mode === "otp";

  return (
    <div className="mb-6 mt-6 flex h-[52px] w-full rounded-[12px] bg-[#f3f4f6] p-1">
      <button
        type="button"
        onClick={() => onChange("otp")}
        className={`flex-1 rounded-[8px] text-[14px] font-semibold transition-colors ${
          isOtp
            ? "bg-[#e95028] text-white shadow-sm"
            : "text-[#6b7280] hover:text-[#374151]"
        }`}
      >
        OTP Login
      </button>
      <button
        type="button"
        onClick={() => onChange("password")}
        className={`flex-1 rounded-[8px] text-[14px] font-semibold transition-colors ${
          !isOtp
            ? "bg-[#e95028] text-white shadow-sm"
            : "text-[#6b7280] hover:text-[#374151]"
        }`}
      >
        Password
      </button>
    </div>
  );
}
