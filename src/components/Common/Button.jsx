import React from "react";

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}) {
  const baseStyles =
    "h-[52px] w-full rounded-[12px] text-[16px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantStyles = {
    primary:
      "bg-[#e95028] text-white shadow-[0px_4px_6px_rgba(249,115,22,0.2),0px_10px_15px_rgba(249,115,22,0.2)] hover:bg-[#d04320] focus:ring-[#e95028]/20",
    secondary:
      "bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] focus:ring-[#6b7280]/20"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
