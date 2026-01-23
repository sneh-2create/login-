import React from "react";

export default function Input({
  label,
  icon,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[14px] font-semibold text-[#374151]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {icon}
          </span>
        )}
        <input
          className={`h-[54px] w-full rounded-[12px] border border-[#e5e7eb] bg-white px-3 text-[16px] text-[#111827] outline-none transition focus:border-[#e95028] focus:ring-2 focus:ring-[#e95028]/10 ${
            icon ? "pl-10" : ""
          } ${error ? "border-red-500" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
    </div>
  );
}
