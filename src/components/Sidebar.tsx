"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Activity, 
  PieChart, 
  Target, 
  ShieldCheck, 
  MessageSquare, 
  Newspaper 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Investment Advisor', href: '/advisor', icon: TrendingUp },
  { name: 'Financial Health', href: '/health', icon: Activity },
  { name: 'Portfolio Analyzer', href: '/portfolio', icon: PieChart },
  { name: 'SIP Calculator', href: '/sip', icon: Target },
  { name: 'Tax Advisor', href: '/tax', icon: ShieldCheck },
  { name: 'Support Assistant', href: '/support', icon: MessageSquare },
  { name: 'Market News', href: '/news', icon: Newspaper },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-[#0A0A0A] border-r border-[#1F1F1F] text-white print:hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Knowith AI
        </h1>
        <p className="text-xs text-gray-400 mt-1">Capital Intelligence</p>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-[#1E1E2E] text-blue-400 border border-[#2E2E3E]" 
                  : "text-gray-400 hover:text-white hover:bg-[#151515]"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-gray-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1F1F1F]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#151515] border border-[#1F1F1F]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
            KC
          </div>
          <div>
            <p className="text-sm font-medium">Advisor Pro</p>
            <p className="text-xs text-gray-500">Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
