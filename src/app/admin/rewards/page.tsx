"use client";

import { useState } from "react";
import { Heart, Receipt, ShieldAlert, Coins } from "lucide-react";
import { display } from "../_fonts";
import CharitiesTab from "./CharitiesTab";
import DonationsTab from "./DonationsTab";
import FraudTab from "./FraudTab";
import RulesTab from "./RulesTab";

// NOTE: charity applications intake is deferred — admins register charities
// directly via the Charity Directory tab ("Add charity"). The application
// review tab + its API routes exist but are intentionally not surfaced yet.
type TabKey = "charities" | "donations" | "fraud" | "rules";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "charities", label: "Charity Directory", icon: Heart },
  { key: "donations", label: "Donations", icon: Receipt },
  { key: "fraud", label: "Fraud Queue", icon: ShieldAlert },
  { key: "rules", label: "Reward Rules", icon: Coins },
];

export default function RewardsPage() {
  const [tab, setTab] = useState<TabKey>("charities");

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 pt-4 sm:pt-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-5 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">Rewards &amp; Charity</span>
        </div>
        <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>Rewards &amp; Charity</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Register charities, manage the directory, monitor donations and fraud.</p>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 mt-4 -mb-px overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  active ? "border-[#F03E9E] text-[#102C26]" : "border-transparent text-gray-500 hover:text-[#102C26]"
                }`}>
                <Icon size={15} className={active ? "text-[#F03E9E]" : ""} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active tab */}
      <div className="px-4 sm:px-8 py-5">
        {tab === "charities" && <CharitiesTab />}
        {tab === "donations" && <DonationsTab />}
        {tab === "fraud" && <FraudTab />}
        {tab === "rules" && <RulesTab />}
      </div>
    </div>
  );
}
