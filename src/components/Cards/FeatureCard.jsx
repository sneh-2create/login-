import React from "react";

export default function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  bgClass,
  hoverBgClass,
  iconBgClass = "bg-slate-50",
  iconColorClass = "text-slate-700"
}) {
  return (
    <div
      className={`group flex cursor-pointer items-center gap-4 rounded-[12px] px-5 py-4 shadow-sm transition-transform transition-colors duration-300 ${bgClass} ${hoverBgClass} hover:shadow-lg hover:-translate-y-2 hover:scale-[1.05]`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-125 ${iconBgClass}`}
        >
          {Icon && <Icon className={`h-4 w-4 ${iconColorClass}`} />}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[14px] font-semibold leading-[20px] text-[#1f2937]">
          {title}
        </p>
        <p className="text-[12px] leading-[16px] text-[#6b7280]">{subtitle}</p>
      </div>
    </div>
  );
}
