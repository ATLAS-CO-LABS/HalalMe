"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { merchantService } from "@/services/merchantService";
import { Settings, HelpCircle, LogOut, Store } from "lucide-react";
import OverviewTab from "./OverviewTab";
import RewardsTab from "./RewardsTab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "rewards",  label: "Rewards" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function DashboardPage() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMerchant, setIsMerchant] = useState(false);
  const { user } = useAuth();

  const activeTab: TabId = searchParams.get("tab") === "rewards" ? "rewards" : "overview";

  function setTab(tab: TabId) {
    router.push(tab === "overview" ? "/dashboard" : `/dashboard?tab=${tab}`, { scroll: false });
  }

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    merchantService
      .getMyMerchant()
      .then((m) => { if (active) setIsMerchant(!!m); })
      .catch(() => {});
    return () => { active = false; };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[#102C26] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #F7E7CE 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">
        <nav className="border-b border-[#F7E7CE]/8 bg-[#0A1C19]/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span style={{ position: "relative", display: "inline-flex", width: 26, height: 26, flexShrink: 0 }}>
                <span style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
                <Image src="/logo/logo.png" alt="HalalMe" width={26} height={26} className="object-contain relative z-10" />
              </span>
              <span
                className="text-lg font-black text-[#F7E7CE] tracking-tight"
                style={{ fontFamily: "var(--font-logo)" }}
              >
                HalalMe
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {isMerchant && (
                <Link
                  href="/merchant"
                  className="flex items-center gap-1.5 px-3 py-2 text-[#F7E7CE]/45 hover:text-[#F7E7CE]/80 hover:bg-[#F7E7CE]/6 transition-colors text-xs font-bold uppercase tracking-wide"
                  title="Switch to your restaurant dashboard"
                >
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">Restaurant</span>
                </Link>
              )}
              <Link
                href="/profile"
                className="p-2.5 text-[#F7E7CE]/40 hover:text-[#F7E7CE]/80 hover:bg-[#F7E7CE]/6 transition-colors"
              >
                <Settings className="w-4.5 h-4.5" />
              </Link>
              <Link
                href="/help"
                className="p-2.5 text-[#F7E7CE]/40 hover:text-[#F7E7CE]/80 hover:bg-[#F7E7CE]/6 transition-colors"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </Link>
              <button
                onClick={() => logout()}
                className="p-2.5 text-[#F7E7CE]/40 hover:text-red-400 hover:bg-[#F7E7CE]/6 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </nav>

        {/* Tab switcher */}
        <div className="border-b border-[#F7E7CE]/8 bg-[#0A1C19]/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="relative px-5 py-4 text-xs font-bold uppercase tracking-wider transition-colors"
                  style={{ color: activeTab === t.id ? "#F7E7CE" : "#F7E7CE50" }}
                >
                  {t.label}
                  {activeTab === t.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14B8A6]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            {activeTab === "overview" ? <OverviewTab isMerchant={isMerchant} /> : <RewardsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
