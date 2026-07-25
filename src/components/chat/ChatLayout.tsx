import React from 'react';
import { ProfileSidebar } from './ProfileSidebar';
import { FieldMetadata } from '@/lib/config/types';
import { ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface ChatLayoutProps {
  children: React.ReactNode;
  sidebarFields: FieldMetadata[];
  profileData: Record<string, any>;
  featureTitle: string;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ 
  children, 
  sidebarFields, 
  profileData, 
  featureTitle 
}) => {
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      
      {/* Top Navigation Bar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <ShieldCheck size={16} />
            </div>
            <h1 className="font-semibold text-slate-800 hidden sm:block">Knowith Capital</h1>
            <span className="text-slate-300 hidden sm:block">/</span>
            <h2 className="font-medium text-indigo-900">{featureTitle}</h2>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible print:block">
        
        {/* Main Chat View */}
        <main className="flex-1 flex flex-col relative h-full print:h-auto print:block">
          {children}
        </main>

        {/* Dynamic Sidebar (Hidden on mobile and print) */}
        {sidebarFields && sidebarFields.length > 0 && (
          <div className="print:hidden">
            <ProfileSidebar 
              fields={sidebarFields} 
              profileData={profileData} 
            />
          </div>
        )}
      </div>

    </div>
  );
};
