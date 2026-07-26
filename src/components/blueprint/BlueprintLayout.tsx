import React from 'react';

interface BlueprintLayoutProps {
  children: React.ReactNode;
}

/**
 * The main wrapper for all Blueprints.
 * Provides the editorial grid, readable max-width, and base typography scale.
 * Optimized for both web reading and PDF printing.
 */
export function BlueprintLayout({ children }: BlueprintLayoutProps) {
  return (
    <article className="w-full bg-white  text-slate-900  min-h-screen font-sans antialiased print:bg-white print:text-black">
      {/* 
        The central reading spine.
        Max-width ensures lines don't exceed ~75 characters for optimal readability. 
      */}
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24 space-y-24 print:max-w-none print:px-0 print:py-0 print:space-y-16">
        {children}
      </div>
    </article>
  );
}
