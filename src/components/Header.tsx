"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Compass, BookmarkCheck, LogIn, LogOut } from "lucide-react";
import { UserSession } from "@/lib/types";

interface HeaderProps {
  onOpenAuthModal?: () => void;
}

export function Header({ onOpenAuthModal }: HeaderProps) {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.reload();
  };

  return (
    <header className="border-b border-white/[0.06] bg-[#080a0f]/85 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/5 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:border-amber-400/60 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base text-slate-100 tracking-tight group-hover:text-white transition-colors">
              The Blind Spot
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-amber-400/80 tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
              Reasoning Audit
            </span>
          </div>
        </Link>

        {/* Navigation & Personal Mode */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/#explore"
            className="text-xs sm:text-sm text-slate-300 hover:text-white font-medium transition-colors"
          >
            Audit Workspace
          </Link>

          <Link
            href="/saved"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white font-medium transition-colors"
          >
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <span>Your Decisions</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-3 border-l border-white/[0.08]">
              <span className="text-xs text-slate-300 font-medium hidden md:inline truncate max-w-[120px]">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] hover:border-amber-400/30 transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Sign-In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
