import React, { useState } from "react";
import { Users, CreditCard, CalendarCheck2, BarChart3 } from "lucide-react";
import logo from "../assets/icons/logo.png";
import { useTypingText } from "../hooks/useTypingText.js";
import FeatureCard from "../components/Cards/FeatureCard.jsx";
import AuthLayout from "../components/Layout/AuthLayout.jsx";

const HEADING_PHRASES = [
  "Campus Automation",
  "Fees  Management",
  "Campus Management",
  "Staff Portal",
  "Academic Portal"
];

export default function Login() {
  const [mode, setMode] = useState("otp");
  const typed = useTypingText(HEADING_PHRASES, {
    typingSpeed: 100,
    deletingSpeed: 50,
    pauseTime: 2000
  });

  return (
    <div className="min-h-screen animate-fade-in bg-[linear-gradient(144.583deg,#e8f4f8_0%,#d4e8f0_70.711%)] font-sans flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">

          {/* Left: Feature panel - hidden on small, visible on md+ */}
          <div className="hidden md:block md:w-1/2 md:pl-6 md:transform md:translate-x-4">
            <div className="max-w-lg">
              <div className="mb-6">
                <img src={logo} alt="Okie Dokie logo" className="h-14 w-auto object-contain" />
              </div>

              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-[#333333] leading-tight">Transform Your</h1>
                <p className="text-4xl md:text-5xl font-bold text-[#e95028] leading-tight">{typed || "\u00A0"}</p>
              </div>

              <p className="text-lg text-[#666666] mb-6">Streamline admissions, track attendance, manage fees — all in one powerful platform.</p>

              <div className="grid grid-cols-2 gap-4">
                <FeatureCard
                  icon={Users}
                  title="1000+ Students"
                  subtitle="Manage efficiently"
                  bgClass="bg-[#f3f0ff]"
                  hoverBgClass="hover:bg-[#e6ddff]"
                  iconBgClass="bg-[#e5ddff]"
                  iconColorClass="text-[#7c3aed]"
                />
                <FeatureCard
                  icon={CreditCard}
                  title="Fee Management"
                  subtitle="Automated"
                  bgClass="bg-[#effcf6]"
                  hoverBgClass="hover:bg-[#d9f8ea]"
                  iconBgClass="bg-[#dcfce7]"
                  iconColorClass="text-[#16a34a]"
                />
                <FeatureCard
                  icon={CalendarCheck2}
                  title="Attendance"
                  subtitle="Real-time"
                  bgClass="bg-[#fff5f5]"
                  hoverBgClass="hover:bg-[#ffe1e1]"
                  iconBgClass="bg-[#fee2e2]"
                  iconColorClass="text-[#e11d48]"
                />
                <FeatureCard
                  icon={BarChart3}
                  title="Analytics"
                  subtitle="Data insights"
                  bgClass="bg-[#fff8ed]"
                  hoverBgClass="hover:bg-[#ffeed3]"
                  iconBgClass="bg-[#fef3c7]"
                  iconColorClass="text-[#f59e0b]"
                />
              </div>
            </div>
          </div>

          {/* Right: Auth card - full width on mobile */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-full max-w-md">
              <AuthLayout mode={mode} onModeChange={setMode} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
