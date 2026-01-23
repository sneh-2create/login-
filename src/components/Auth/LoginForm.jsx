import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "../Common/Input.jsx";
import Button from "../Common/Button.jsx";
import {
  sanitizePhone,
  phoneErrorMessage,
  sanitizePassword,
  passwordErrorMessage,
  isPhoneValid,
  isPasswordValid,
} from "../../utils/validation.js";

export default function LoginForm() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [passwordInvalidAttempt, setPasswordInvalidAttempt] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isMobileValid = isPhoneValid(mobile);
  const isPasswordValidLocal = isPasswordValid(password);
  const isFormValid = isMobileValid && isPasswordValidLocal;
  
  const getMobileError = () => phoneErrorMessage(mobile);

  const getPasswordError = () => passwordErrorMessage(password, passwordInvalidAttempt);

  const handleSignIn = () => {
    if (!isMobileValid || !isPasswordValid) return;
    window.alert("Mock sign-in. Connect real auth later.");
  };

  return (
    <div className="mt-2 space-y-4">
        <Input
        label="Mobile Number"
        type="tel"
        value={mobile}
        maxLength={10}
        inputMode="numeric"
        pattern="[0-9]*"
        onPaste={(e) => {
          const paste = (e.clipboardData || window.clipboardData).getData("text") || "";
          const newVal = sanitizePhone(mobile + paste);
          e.preventDefault();
          setMobile(newVal);
        }}
        onChange={(e) => {
          setMobile(sanitizePhone(e.target.value));
        }}
        placeholder="Enter mobile number"
        error={getMobileError()}
      />

      <div className="space-y-2">
        <label className="text-[14px] font-semibold text-[#374151]">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              const raw = e.target.value || "";
              const sanitized = sanitizePassword(raw);
              if (sanitized !== raw) {
                setPasswordInvalidAttempt(true);
                setTimeout(() => setPasswordInvalidAttempt(false), 2000);
              }
              setPassword(sanitized);
            }}
            placeholder="Enter password"
            className="h-[54px] w-full rounded-[12px] border border-[#e5e7eb] bg-white px-3 pr-10 text-[16px] text-[#111827] outline-none transition focus:border-[#e95028] focus:ring-2 focus:ring-[#e95028]/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9ca3af] transition-colors hover:text-[#4b5563]"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {getPasswordError() && (
          <p className="text-[12px] text-red-500">{getPasswordError()}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="text-[12px] font-medium text-[#6b7280] transition-colors hover:text-[#111827] hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="button"
        onClick={handleSignIn}
        disabled={!isFormValid}
        className="disabled:cursor-not-allowed disabled:opacity-60"
      >
        Sign In
      </Button>
    </div>
  );
}
