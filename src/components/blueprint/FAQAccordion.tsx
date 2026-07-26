import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
}

/**
 * Clean, borderless accordion for FAQs.
 */
export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-3xl space-y-2">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="border-b border-slate-200  print:border-slate-300">
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between py-5 text-left transition-colors hover:text-indigo-600 :text-indigo-400"
            >
              <span className="font-semibold text-lg text-slate-900  print:text-black pr-8">
                {faq.question}
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 print:hidden ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} 
              />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'} print:max-h-none print:opacity-100 print:mb-6`}
            >
              <p className="text-slate-600  leading-relaxed print:text-slate-800">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
