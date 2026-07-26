import React from 'react';

interface BlueprintSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Editorial section wrapper.
 * Replaces generic cards by providing strong typographic hierarchy and generous whitespace.
 */
export function BlueprintSection({ title, subtitle, children, className = '', fullWidth = false }: BlueprintSectionProps) {
  return (
    <section className={`relative print:break-inside-avoid print:py-8 ${className}`}>
      {(title || subtitle) && (
        <header className="mb-8 print:mb-6">
          {title && (
            <h2 className="font-serif text-3xl md:text-4xl text-slate-900  font-medium tracking-tight mb-2 print:text-black">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-slate-500  font-sans print:text-slate-600">
              {subtitle}
            </p>
          )}
        </header>
      )}
      
      <div className={`${fullWidth ? 'w-[100vw] relative left-1/2 -translate-x-1/2 px-6 md:px-12 max-w-[1200px]' : ''}`}>
        {children}
      </div>
    </section>
  );
}
