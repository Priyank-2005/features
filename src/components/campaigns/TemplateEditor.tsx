"use client";

import React, { useState, useEffect } from "react";
import { 
  Type, Image as ImageIcon, Minus, Link as LinkIcon, 
  ArrowUp, ArrowDown, Trash2, AlignLeft, AlignCenter, AlignRight, Settings,
  Monitor, Smartphone, Moon, Sun
} from "lucide-react";
import { MergeTagSelector } from "./MergeTagSelector";
import { motion, AnimatePresence } from "framer-motion";

export interface TemplateEditorProps {
  initialContent?: string;
  onChange: (htmlContent: string, jsonContent: string) => void;
}

type BlockType = 'heading' | 'paragraph' | 'image' | 'button' | 'divider';

interface Block {
  id: string;
  type: BlockType;
  content: any;
}

const FONTS = [
  { name: 'Sans Serif (System)', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Monospace', value: 'monospace' },
];

const defaultBlocks: Block[] = [
  { id: '1', type: 'heading', content: { text: 'Welcome to Knowith Capital', level: 'h1', textAlign: 'center', color: '#000000', fontFamily: FONTS[0].value } },
  { id: '2', type: 'paragraph', content: { text: 'Hello {{firstName}}, we are excited to share our latest opportunities.', textAlign: 'left', color: '#333333', fontFamily: FONTS[0].value } },
  { id: '3', type: 'button', content: { text: 'View Opportunities', url: 'https://knowith.com', color: '#4f46e5', textColor: '#ffffff' } },
];

export function TemplateEditor({ initialContent, onChange }: TemplateEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [globalSettings, setGlobalSettings] = useState({ bg: '#ffffff', text: '#000000', fontFamily: FONTS[0].value });
  
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (initialContent && !activeBlock) {
      try {
        const parsed = JSON.parse(initialContent);
        if (parsed.blocks) setBlocks(parsed.blocks);
        if (parsed.settings) setGlobalSettings(parsed.settings);
      } catch (e) {
        console.error("Failed to parse initial content");
      }
    }
  }, []); // Only run once on mount

  // Generate HTML on changes
  useEffect(() => {
    const html = generateHtml(blocks, globalSettings);
    const json = JSON.stringify({ blocks, settings: globalSettings });
    onChange(html, json);
  }, [blocks, globalSettings]);

  const generateHtml = (currentBlocks: Block[], settings: any) => {
    const blocksHtml = currentBlocks.map(b => {
      const align = b.content.textAlign || 'left';
      const color = b.content.color || settings.text;
      const font = b.content.fontFamily || settings.fontFamily;
      const bgColor = b.content.bgColor ? `background-color: ${b.content.bgColor};` : '';
      
      switch (b.type) {
        case 'heading':
          const Tag = b.content.level || 'h2';
          return `<${Tag} style="color: ${color}; font-family: ${font}; margin-bottom: 16px; text-align: ${align}; margin-top: 0; ${bgColor} padding: ${b.content.bgColor ? '12px' : '0'}; border-radius: 4px;">${b.content.text}</${Tag}>`;
        case 'paragraph':
          return `<p style="color: ${color}; font-family: ${font}; font-size: 16px; line-height: 1.5; margin-bottom: 16px; text-align: ${align}; margin-top: 0; white-space: pre-wrap; ${bgColor} padding: ${b.content.bgColor ? '12px' : '0'}; border-radius: 4px;">${b.content.text}</p>`;
        case 'image':
          const width = b.content.width || '100';
          return b.content.url 
            ? `<div style="text-align: ${align}; margin-bottom: 16px;"><img src="${b.content.url}" alt="" style="width: ${width}%; max-width: 100%; height: auto; border-radius: 8px; display: inline-block;" /></div>` 
            : '';
        case 'button':
          return `<div style="text-align: ${align}; margin: 24px 0;"><a href="${b.content.url}" style="background-color: ${b.content.color || '#4f46e5'}; color: ${b.content.textColor || '#ffffff'}; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: ${font}; display: inline-block;">${b.content.text}</a></div>`;
        case 'divider':
          return `<hr style="border: none; border-top: 1px solid ${b.content.color || '#e5e7eb'}; margin: 24px 0;" />`;
        default:
          return '';
      }
    }).join('\n');

    return `
      <div style="background-color: ${settings.bg}; padding: 40px 20px; font-family: ${settings.fontFamily}; min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; background-color: ${settings.bg === '#ffffff' ? '#fcfcfc' : '#ffffff'}; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          ${blocksHtml}
        </div>
      </div>
    `;
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: {}
    };
    
    switch(type) {
      case 'heading': newBlock.content = { text: 'New Heading', level: 'h2', textAlign: 'left', color: globalSettings.text, fontFamily: globalSettings.fontFamily, bgColor: '' }; break;
      case 'paragraph': newBlock.content = { text: 'Enter text here...', textAlign: 'left', color: globalSettings.text, fontFamily: globalSettings.fontFamily, bgColor: '' }; break;
      case 'button': newBlock.content = { text: 'Click Here', url: '#', color: '#4f46e5', textColor: '#ffffff', textAlign: 'center' }; break;
      case 'image': newBlock.content = { url: '', textAlign: 'center', width: '100' }; break;
      case 'divider': newBlock.content = { color: '#e5e7eb' }; break;
    }
    
    setBlocks([...blocks, newBlock]);
    setActiveBlock(newBlock.id);
  };

  const updateBlockContent = (id: string, newContent: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (activeBlock === id) setActiveBlock(null);
  };

  const handleInsertTag = (tag: string) => {
    if (!activeBlock) return;
    const block = blocks.find(b => b.id === activeBlock);
    if (block && (block.type === 'heading' || block.type === 'paragraph')) {
      updateBlockContent(activeBlock, { text: block.content.text + ' ' + tag });
    }
  };

  return (
    <div className="flex h-[750px] border border-[#2E2E3E]/50 rounded-xl overflow-hidden glass-panel">
      {/* Sidebar Tools */}
      <div className="w-80 bg-[#151515] border-r border-[#2E2E3E]/50 flex flex-col z-20 shadow-xl">
        <div className="p-4 border-b border-[#2E2E3E]/50 flex justify-between items-center bg-[#1E1E2E]/30">
          <h3 className="font-playfair font-medium text-white">Add Block</h3>
          <button 
            onClick={() => setActiveBlock(null)}
            className={`p-1.5 rounded transition-colors ${!activeBlock ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="Global Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 border-b border-[#2E2E3E]/50">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addBlock('heading')} className="p-2 bg-[#1A1A24] border border-[#2E2E3E] rounded hover:border-blue-500/50 text-xs text-gray-300 flex flex-col items-center gap-2 transition-colors">
              <Type className="w-4 h-4" /> Heading
            </button>
            <button onClick={() => addBlock('paragraph')} className="p-2 bg-[#1A1A24] border border-[#2E2E3E] rounded hover:border-blue-500/50 text-xs text-gray-300 flex flex-col items-center gap-2 transition-colors">
              <Type className="w-4 h-4" /> Text
            </button>
            <button onClick={() => addBlock('image')} className="p-2 bg-[#1A1A24] border border-[#2E2E3E] rounded hover:border-blue-500/50 text-xs text-gray-300 flex flex-col items-center gap-2 transition-colors">
              <ImageIcon className="w-4 h-4" /> Image
            </button>
            <button onClick={() => addBlock('button')} className="p-2 bg-[#1A1A24] border border-[#2E2E3E] rounded hover:border-blue-500/50 text-xs text-gray-300 flex flex-col items-center gap-2 transition-colors">
              <LinkIcon className="w-4 h-4" /> Button
            </button>
            <button onClick={() => addBlock('divider')} className="p-2 bg-[#1A1A24] border border-[#2E2E3E] rounded hover:border-blue-500/50 text-xs text-gray-300 flex flex-col items-center gap-2 col-span-2 transition-colors">
              <Minus className="w-4 h-4" /> Divider
            </button>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {!activeBlock ? (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="font-medium text-white text-sm border-b border-[#2E2E3E]/50 pb-2">Global Settings</h3>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Background Color</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <input 
                      type="color" 
                      value={globalSettings.bg}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, bg: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded border border-[#2E2E3E] flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full" style={{ backgroundColor: globalSettings.bg }}></div>
                    </div>
                  </div>
                  <input 
                    type="text"
                    value={globalSettings.bg}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, bg: e.target.value })}
                    className="flex-1 bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400">Default Text Color</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <input 
                      type="color" 
                      value={globalSettings.text}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, text: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded border border-[#2E2E3E] flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full" style={{ backgroundColor: globalSettings.text }}></div>
                    </div>
                  </div>
                  <input 
                    type="text"
                    value={globalSettings.text}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, text: e.target.value })}
                    className="flex-1 bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1 text-sm text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Global Font</label>
                <select 
                  value={globalSettings.fontFamily}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, fontFamily: e.target.value })}
                  className="w-full bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1.5 text-sm text-white"
                >
                  {FONTS.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#2E2E3E]/50 pb-2">
                <h3 className="font-medium text-white text-sm capitalize">Edit {blocks.find(b => b.id === activeBlock)?.type}</h3>
                {(blocks.find(b => b.id === activeBlock)?.type === 'heading' || blocks.find(b => b.id === activeBlock)?.type === 'paragraph') && (
                  <MergeTagSelector onInsert={handleInsertTag} />
                )}
              </div>
              
              {/* Heading Specific Settings */}
              {blocks.find(b => b.id === activeBlock)?.type === 'heading' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Heading Level</label>
                    <select 
                      value={blocks.find(b => b.id === activeBlock)?.content.level}
                      onChange={(e) => updateBlockContent(activeBlock, { level: e.target.value })}
                      className="w-full bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1.5 text-sm text-white"
                    >
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                      <option value="h4">Heading 4</option>
                    </select>
                  </div>
                </>
              )}

              {/* Text, Heading common settings */}
              {(blocks.find(b => b.id === activeBlock)?.type === 'heading' || blocks.find(b => b.id === activeBlock)?.type === 'paragraph') && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Background Color</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={blocks.find(b => b.id === activeBlock)?.content.bgColor || '#ffffff'}
                          onChange={(e) => updateBlockContent(activeBlock, { bgColor: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-8 h-8 rounded border border-[#2E2E3E] flex items-center justify-center overflow-hidden">
                          {blocks.find(b => b.id === activeBlock)?.content.bgColor ? (
                            <div className="w-full h-full" style={{ backgroundColor: blocks.find(b => b.id === activeBlock)?.content.bgColor }}></div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[8px] text-gray-400">None</div>
                          )}
                        </div>
                      </div>
                      <input 
                        type="text"
                        value={blocks.find(b => b.id === activeBlock)?.content.bgColor || ''}
                        onChange={(e) => updateBlockContent(activeBlock, { bgColor: e.target.value })}
                        placeholder="Transparent"
                        className="flex-1 bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1 text-sm text-white"
                      />
                      <button 
                        onClick={() => updateBlockContent(activeBlock, { bgColor: '' })}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                        title="Clear background"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Text Color</label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={blocks.find(b => b.id === activeBlock)?.content.color || globalSettings.text}
                          onChange={(e) => updateBlockContent(activeBlock, { color: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-8 h-8 rounded border border-[#2E2E3E] flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full" style={{ backgroundColor: blocks.find(b => b.id === activeBlock)?.content.color || globalSettings.text }}></div>
                        </div>
                      </div>
                      <input 
                        type="text"
                        value={blocks.find(b => b.id === activeBlock)?.content.color || globalSettings.text}
                        onChange={(e) => updateBlockContent(activeBlock, { color: e.target.value })}
                        className="flex-1 bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1 text-sm text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Font</label>
                    <select 
                      value={blocks.find(b => b.id === activeBlock)?.content.fontFamily || globalSettings.fontFamily}
                      onChange={(e) => updateBlockContent(activeBlock, { fontFamily: e.target.value })}
                      className="w-full bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1.5 text-sm text-white"
                    >
                      {FONTS.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              
              {/* Alignment setting (Heading, Paragraph, Button, Image) */}
              {['heading', 'paragraph', 'button', 'image'].includes(blocks.find(b => b.id === activeBlock)?.type || '') && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Alignment</label>
                  <div className="flex bg-[#1A1A24] border border-[#2E2E3E] rounded p-1 gap-1">
                    <button 
                      onClick={() => updateBlockContent(activeBlock, { textAlign: 'left' })}
                      className={`flex-1 flex justify-center p-1.5 rounded ${blocks.find(b => b.id === activeBlock)?.content.textAlign === 'left' ? 'bg-[#2E2E3E] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateBlockContent(activeBlock, { textAlign: 'center' })}
                      className={`flex-1 flex justify-center p-1.5 rounded ${blocks.find(b => b.id === activeBlock)?.content.textAlign === 'center' ? 'bg-[#2E2E3E] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateBlockContent(activeBlock, { textAlign: 'right' })}
                      className={`flex-1 flex justify-center p-1.5 rounded ${blocks.find(b => b.id === activeBlock)?.content.textAlign === 'right' ? 'bg-[#2E2E3E] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Image Specific Settings */}
              {blocks.find(b => b.id === activeBlock)?.type === 'image' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Image Size (Width %)</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={blocks.find(b => b.id === activeBlock)?.content.width || '100'}
                        onChange={(e) => updateBlockContent(activeBlock, { width: e.target.value })}
                        className="flex-1"
                      />
                      <span className="text-xs text-white w-8">{blocks.find(b => b.id === activeBlock)?.content.width || '100'}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Image URL</label>
                    <input 
                      type="text" 
                      value={blocks.find(b => b.id === activeBlock)?.content.url || ''}
                      onChange={(e) => updateBlockContent(activeBlock, { url: e.target.value })}
                      className="w-full bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1 text-sm text-white"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Or Upload Local Image</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateBlockContent(activeBlock, { url: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[#2E2E3E] file:text-white hover:file:bg-[#3A3A4A] cursor-pointer"
                    />
                  </div>
                </div>
              )}
              
              {/* Button Specific Settings */}
              {blocks.find(b => b.id === activeBlock)?.type === 'button' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Button Text</label>
                    <input 
                      type="text" 
                      value={blocks.find(b => b.id === activeBlock)?.content.text || ''}
                      onChange={(e) => updateBlockContent(activeBlock, { text: e.target.value })}
                      className="w-full bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Link URL</label>
                    <input 
                      type="text" 
                      value={blocks.find(b => b.id === activeBlock)?.content.url || ''}
                      onChange={(e) => updateBlockContent(activeBlock, { url: e.target.value })}
                      className="w-full bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1.5 text-sm text-white"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Button Color</label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={blocks.find(b => b.id === activeBlock)?.content.color || '#4f46e5'}
                          onChange={(e) => updateBlockContent(activeBlock, { color: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-8 h-8 rounded border border-[#2E2E3E] flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full" style={{ backgroundColor: blocks.find(b => b.id === activeBlock)?.content.color || '#4f46e5' }}></div>
                        </div>
                      </div>
                      <input 
                        type="text"
                        value={blocks.find(b => b.id === activeBlock)?.content.color || '#4f46e5'}
                        onChange={(e) => updateBlockContent(activeBlock, { color: e.target.value })}
                        className="flex-1 bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1.5 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Text Color</label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={blocks.find(b => b.id === activeBlock)?.content.textColor || '#ffffff'}
                          onChange={(e) => updateBlockContent(activeBlock, { textColor: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-8 h-8 rounded border border-[#2E2E3E] flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full" style={{ backgroundColor: blocks.find(b => b.id === activeBlock)?.content.textColor || '#ffffff' }}></div>
                        </div>
                      </div>
                      <input 
                        type="text"
                        value={blocks.find(b => b.id === activeBlock)?.content.textColor || '#ffffff'}
                        onChange={(e) => updateBlockContent(activeBlock, { textColor: e.target.value })}
                        className="flex-1 bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1.5 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Divider Specific Settings */}
              {blocks.find(b => b.id === activeBlock)?.type === 'divider' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Divider Color</label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <input 
                        type="color" 
                        value={blocks.find(b => b.id === activeBlock)?.content.color || '#e5e7eb'}
                        onChange={(e) => updateBlockContent(activeBlock, { color: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-8 h-8 rounded border border-[#2E2E3E] flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full" style={{ backgroundColor: blocks.find(b => b.id === activeBlock)?.content.color || '#e5e7eb' }}></div>
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={blocks.find(b => b.id === activeBlock)?.content.color || '#e5e7eb'}
                      onChange={(e) => updateBlockContent(activeBlock, { color: e.target.value })}
                      className="flex-1 bg-[#1A1A24] border border-[#2E2E3E] rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden" onClick={() => setActiveBlock(null)}>
        {/* Device Toggle Header */}
        <div className="flex items-center justify-center gap-4 p-3 border-b border-[#2E2E3E]/50 bg-[#151515] z-10 shrink-0">
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
            className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors border ${
              darkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/5"
            }`}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"} Mode</span>
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={device}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className={`w-full text-black min-h-[500px] h-max p-8 shadow-2xl relative border border-gray-200/20 mb-32 transition-all duration-300 ${device === 'mobile' ? 'max-w-[375px]' : 'max-w-2xl'}`} 
              style={{ 
                backgroundColor: globalSettings.bg === '#ffffff' ? '#ffffff' : globalSettings.bg,
                filter: darkMode ? 'invert(1) hue-rotate(180deg)' : 'none'
              }}
            >
              {blocks.map((block, index) => {
                const align = block.content.textAlign || 'left';
                const color = block.content.color || globalSettings.text;
                const font = block.content.fontFamily || globalSettings.fontFamily;
                
                return (
                  <div 
                    key={block.id}
                    onClick={(e) => { e.stopPropagation(); setActiveBlock(block.id); }}
                    className={`relative group p-2 -mx-2 rounded border-2 border-transparent transition-colors ${
                      activeBlock === block.id ? 'border-blue-500 bg-blue-50/10' : 'hover:border-gray-400/50 hover:bg-gray-50/10'
                    }`}
                  >
                    {/* Block Actions */}
                    <div className={`absolute -right-12 top-0 flex-col gap-1 bg-[#1E1E2E] rounded-md border border-[#2E2E3E] p-1 shadow-lg z-10 ${activeBlock === block.id ? 'flex' : 'hidden group-hover:flex'}`}>
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <div className="w-full h-[1px] bg-[#2E2E3E] my-0.5"></div>
                      <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="p-1 hover:bg-red-500/20 rounded text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>

                    {/* Block Content */}
                    <div className="min-h-[20px] rounded" style={{ textAlign: align, backgroundColor: block.content.bgColor || 'transparent', padding: block.content.bgColor ? '12px' : '0' }}>
                      {block.type === 'heading' && (
                        <input
                          value={block.content.text}
                          onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                          className={`w-full bg-transparent border-none outline-none font-bold`}
                          style={{ 
                            color, 
                            fontFamily: font,
                            textAlign: align,
                            fontSize: block.content.level === 'h1' ? '32px' : block.content.level === 'h3' ? '20px' : block.content.level === 'h4' ? '16px' : '24px'
                          }}
                        />
                      )}
                      {block.type === 'paragraph' && (
                        <textarea
                          value={block.content.text}
                          onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                          className="w-full bg-transparent border-none outline-none resize-none overflow-hidden"
                          rows={block.content.text.split('\n').length || 1}
                          style={{ fontSize: '16px', lineHeight: '1.5', color, fontFamily: font, textAlign: align }}
                        />
                      )}
                      {block.type === 'image' && (
                        <div className="w-full min-h-[100px] bg-gray-50/5 rounded flex flex-col items-center justify-center overflow-hidden relative">
                          {block.content.url ? (
                            <img src={block.content.url} alt="Block" style={{ width: `${block.content.width || '100'}%` }} className="max-w-full height-auto object-contain rounded" />
                          ) : (
                            <span className="text-gray-400 text-sm flex items-center gap-2 py-8"><ImageIcon className="w-4 h-4" /> Image placeholder</span>
                          )}
                        </div>
                      )}
                      {block.type === 'button' && (
                        <div className="py-4">
                          <span 
                            className="inline-block px-6 py-3 rounded-md font-bold cursor-pointer transition-opacity hover:opacity-90"
                            style={{ 
                              backgroundColor: block.content.color || '#4f46e5',
                              color: block.content.textColor || '#ffffff',
                              fontFamily: font
                            }}
                          >
                            {block.content.text}
                          </span>
                        </div>
                      )}
                      {block.type === 'divider' && (
                        <hr className="my-6 border-0" style={{ borderTop: `1px solid ${block.content.color || '#e5e7eb'}` }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
