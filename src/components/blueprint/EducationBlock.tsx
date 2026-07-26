import React from 'react';
import { BookOpen } from 'lucide-react';

interface EducationBlockProps {
  title: string;
  content: string;
}

/**
 * Editorial block for educational content.
 */
export function EducationBlock({ title, content }: EducationBlockProps) {
  return (
    <article className="max-w-3xl prose prose-slate  prose-lg print:prose-p:text-black">
      <div className="flex items-center gap-3 mb-6 text-indigo-500">
        <BookOpen className="w-5 h-5" />
        <span className="text-sm font-semibold uppercase tracking-widest">Financial Concept</span>
      </div>
      <h3 className="font-serif text-3xl font-medium mb-4 text-slate-900  print:text-black">
        {title}
      </h3>
      <p className="text-slate-600  leading-relaxed print:text-slate-800">
        {content}
      </p>
    </article>
  );
}
