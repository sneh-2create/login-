import React, { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";
import Input from "../Common/Input.jsx";
import Button from "../Common/Button.jsx";

const OTP_LENGTH = 6;
const INITIAL_COUNTDOWN = 30;

export default function OtpForm() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [screen, setScreen] = useState("login"); // 'login' | 'otp'
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);
  const inputsRef = useRef([]);
  const isMobileValid = mobile.length === 10;

  const handleMobileChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setMobile(digitsOnly);
  };

  useEffect(() => {
    if (screen !== "otp" || countdown <= 0) return;
    const timer = setInterval(
      () => setCountdown((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, [screen, countdown]);

  const handleSendOtp = () => {
    if (!isMobileValid) return;
    setScreen("otp");
    setCountdown(INITIAL_COUNTDOWN);
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 50);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code === "123456") {
      window.alert("OTP verified successfully (demo).");
    } else {
      window.alert("Invalid OTP. Use 123456 for demo.");
    }
  };

  if (screen === "login") {
    return (
      <div className="mt-2 space-y-4">
        <Input
          label="Mobile Number"
          icon={<Phone className="h-5 w-5" />}
          type="tel"
          value={mobile}
          maxLength={10}
          onChange={(e) => handleMobileChange(e.target.value)}
          placeholder="Enter mobile number"
        />
        <Button
          type="button"
          onClick={handleSendOtp}
          disabled={!isMobileValid}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send OTP
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-1">
        <p className="text-[16px] font-semibold text-[#111827]">Enter OTP</p>
        <p className="text-[12px] text-[#6b7280]">
          We&apos;ve sent a 6-digit code. Use{" "}
          <span className="font-semibold text-[#e95028]">123456</span> for demo.
        </p>
      </div>

      <div className="flex justify-between gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            className="h-12 w-10 rounded-[8px] border border-[#e5e7eb] text-center text-[18px] font-semibold text-[#111827] outline-none transition focus:border-[#e95028] focus:ring-2 focus:ring-[#e95028]/20"
          />
        ))}
      </div>

      <div className="text-[12px] text-[#6b7280]">
        Time remaining:{" "}
        <span className="font-semibold text-[#111827]">
          00:{String(countdown).padStart(2, "0")}
        </span>
      </div>

      <Button type="button" onClick={handleVerify}>
        Verify OTP
      </Button>
    </div>
  );
}
