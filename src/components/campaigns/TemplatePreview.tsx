"use client";

import React, { useState, useEffect, useRef } from "react";
import { Monitor, Smartphone, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TemplatePreviewProps {
  html: string;
}

export function TemplatePreview({ html }: TemplatePreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [darkMode, setDarkMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        
        const wrapperHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  margin: 0;
                  padding: 16px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  background-color: ${darkMode ? '#151515' : '#f3f4f6'};
                  transition: filter 0.3s, background-color 0.3s;
                }
                .email-container {
                  max-width: 100%;
                  margin: 0 auto;
                  ${darkMode ? 'filter: invert(1) hue-rotate(180deg);' : ''}
                }
                .email-container img {
                  ${darkMode ? 'filter: invert(1) hue-rotate(180deg);' : ''}
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                ${html || '<div style="text-align: center; padding: 40px; color: #888;">No content available</div>'}
              </div>
            </body>
          </html>
        `;
        
        doc.write(wrapperHtml);
        doc.close();
      }
    }
  }, [html, darkMode, device]);

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-[#2E2E3E]/50 bg-[#1E1E2E]/40">
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors ${
              device === "desktop" ? "bg-[#2E2E3E] text-white shadow-sm" : "text-gray-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors ${
              device === "mobile" ? "bg-[#2E2E3E] text-white shadow-sm" : "text-gray-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"} Mode</span>
        </button>
      </div>

      <div className="flex-1 bg-[#0A0A0F] overflow-y-auto flex justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={device}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-white/10 transition-all duration-300 ${
              device === "mobile" ? "w-full max-w-[375px]" : "w-full max-w-[600px]"
            }`}
            style={{ height: "100%", minHeight: "500px" }}
          >
            <iframe
              ref={iframeRef}
              title="Email Preview"
              className="w-full h-full border-0 bg-transparent flex-1"
              sandbox="allow-same-origin"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
