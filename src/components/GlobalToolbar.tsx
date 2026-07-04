import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileImage, 
  FolderOpen, 
  Save, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Maximize, 
  Minimize, 
  HelpCircle, 
  Info,
  Layers,
  ChevronDown,
  MonitorPlay,
  RotateCw,
  Scissors,
  Sun,
  Moon,
  Smartphone,
  Library,
  Archive,
  Upload,
  Download,
  Menu
} from 'lucide-react';
import { FilterAdjustments } from '../types';

interface GlobalToolbarProps {
  onOpenFile: () => void;
  onSaveFile: () => void;
  onExportFrame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onResetAdjustments: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
  onRotate: (deg: number) => void;
  onFlip: (dir: 'h' | 'v') => void;
  hasFile: boolean;
  fileType: 'image' | 'video' | null;
  onCloseFile: () => void;
  onCommitCrop: () => void;
  canCommitCrop: boolean;
  theme: 'light' | 'dark' | 'phone';
  onThemeChange: (theme: 'light' | 'dark' | 'phone') => void;
  showGallery: boolean;
  onToggleGallery: () => void;
  onSaveWorkspaceState: () => void;
  onLoadWorkspaceState: () => void;
}

export default function GlobalToolbar({
  onOpenFile,
  onSaveFile,
  onExportFrame,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onResetAdjustments,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  onRotate,
  onFlip,
  hasFile,
  fileType,
  onCloseFile,
  onCommitCrop,
  canCommitCrop,
  theme,
  onThemeChange,
  showGallery,
  onToggleGallery,
  onSaveWorkspaceState,
  onLoadWorkspaceState,
}: GlobalToolbarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menuName: string) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
    }
  };

  const handleMenuHover = (menuName: string) => {
    if (activeMenu !== null) {
      setActiveMenu(menuName);
    }
  };

  const executeAction = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  return (
    <header className="h-14 bg-custom-secondary/95 backdrop-blur-xl border-b border-custom-color text-custom-primary flex items-center justify-between px-3 sm:px-6 select-none relative z-50 font-sans shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="flex items-center space-x-2 sm:space-x-6" ref={menuRef}>
        {/* Brand/Logo */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Stylized Anvil Icon */}
          <div className="w-6.5 h-6.5 bg-gradient-to-tr from-[#e25c24] to-[#f98435] rounded-xl flex items-center justify-center shadow-lg shadow-[#e25c24]/35 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4px_4px]" />
            <svg className="w-4 h-4 text-white font-bold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,5.5H13V7H11V5.5H5C3.34,5.5 2,6.84 2,8.5V11C2,12.66 3.34,14 5,14H7V18H17V14H19C20.66,14 22,12.66 22,11V8.5C22,6.84 20.66,5.5 19,5.5M16,13H8V9H16V13Z" />
            </svg>
          </div>
          <span className="hidden xs:inline font-serif text-sm tracking-[0.18em] font-bold uppercase bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            HEPHAESTUS
          </span>
        </div>

        {/* Mobile menu dropdown */}
        <div className="flex md:hidden relative">
          <button
            onClick={() => toggleMenu('mobile_menu')}
            className={`px-3 py-1.5 text-xs rounded-xl transition-all flex items-center space-x-1 ${
              activeMenu === 'mobile_menu' 
                ? 'bg-[#2a2a32] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                : 'bg-custom-tertiary border border-custom-color hover:bg-[#1a1a20]/80 text-gray-300'
            }`}
          >
            <Menu className="w-3.5 h-3.5 mr-1" />
            <span className="font-bold font-mono text-[11px] tracking-wider">MENU</span>
            <ChevronDown className="w-3 h-3 opacity-60 transition-transform duration-200" style={{ transform: activeMenu === 'mobile_menu' ? 'rotate(180deg)' : 'rotate(0)' }} />
          </button>
          
          <AnimatePresence>
            {activeMenu === 'mobile_menu' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 mt-2 w-56 max-h-[75vh] overflow-y-auto bg-[#141417]/98 backdrop-blur-2xl border border-[#31313a] rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5)] p-2 z-50 text-xs text-gray-300"
              >
              <div className="px-3.5 py-1 text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-[#2e2e33]/50 mb-1">
                FILE OPERATIONS
              </div>
              <button
                onClick={() => executeAction(onOpenFile)}
                className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
              >
                <FolderOpen className="w-4 h-4 text-orange-400" />
                <span className="flex-1 font-medium">Open File...</span>
              </button>
              <button
                onClick={() => executeAction(onLoadWorkspaceState)}
                className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span className="flex-1 font-medium">Load State (.json)</span>
              </button>
              {hasFile && (
                <>
                  <button
                    onClick={() => executeAction(onSaveWorkspaceState)}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span className="flex-1 font-medium">Save State (.json)</span>
                  </button>
                  <button
                    onClick={() => executeAction(onSaveFile)}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                  >
                    <Save className="w-4 h-4 text-blue-400" />
                    <span className="flex-1 font-medium">Save Asset</span>
                  </button>
                  {fileType === 'video' && (
                    <button
                      onClick={() => executeAction(onExportFrame)}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                    >
                      <FileImage className="w-4 h-4 text-purple-400" />
                      <span className="flex-1 font-medium">Export Current Frame</span>
                    </button>
                  )}
                </>
              )}

              <div className="px-3.5 py-1 text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-[#2e2e33]/50 my-2">
                EDIT & TRANSFORMS
              </div>
              <button
                onClick={() => executeAction(onUndo)}
                disabled={!canUndo}
                className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
              >
                <Undo2 className="w-4 h-4 text-amber-400" />
                <span className="flex-1 font-medium">Undo</span>
              </button>
              <button
                onClick={() => executeAction(onRedo)}
                disabled={!canRedo}
                className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
              >
                <Redo2 className="w-4 h-4 text-amber-400" />
                <span className="flex-1 font-medium">Redo</span>
              </button>
              {hasFile && (
                <>
                  <button
                    onClick={() => executeAction(() => onRotate(90))}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                  >
                    <RotateCw className="w-4 h-4 text-orange-400" />
                    <span className="font-medium">Rotate 90° CW</span>
                  </button>
                  <button
                    onClick={() => executeAction(() => onFlip('h'))}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                  >
                    <Layers className="w-4 h-4 rotate-90 text-cyan-400" />
                    <span className="font-medium">Flip Horizontal</span>
                  </button>
                  <button
                    onClick={() => executeAction(() => onFlip('v'))}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium">Flip Vertical</span>
                  </button>
                  <button
                    onClick={() => executeAction(onResetAdjustments)}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-950/30 hover:text-red-200 text-gray-400 rounded-xl flex items-center space-x-2.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Reset Sliders</span>
                  </button>
                </>
              )}

              <div className="px-3.5 py-1 text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-[#2e2e33]/50 my-2">
                VIEWPORT
              </div>
              <button
                onClick={() => executeAction(onZoomIn)}
                disabled={!hasFile}
                className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
              >
                <Maximize className="w-4 h-4" />
                <span className="flex-1 font-medium">Zoom In</span>
              </button>
              <button
                onClick={() => executeAction(onZoomOut)}
                disabled={!hasFile}
                className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
              >
                <Minimize className="w-4 h-4" />
                <span className="flex-1 font-medium">Zoom Out</span>
              </button>
              <button
                onClick={() => executeAction(onZoomFit)}
                disabled={!hasFile}
                className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
              >
                <Maximize className="w-4 h-4 rotate-45" />
                <span className="flex-1 font-medium">Fit Canvas</span>
              </button>

              <div className="px-3.5 py-1 text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-[#2e2e33]/50 my-2">
                HELP
              </div>
              <button
                onClick={() => { executeAction(() => {}); setShowManual(true); }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span className="font-medium">Hephaestus Manual</span>
              </button>
              
              {hasFile && (
                <>
                  <div className="border-t border-[#2e2e33]/70 my-1.5" />
                  <button
                    onClick={() => executeAction(onCloseFile)}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-950/40 hover:text-red-200 text-red-400 rounded-xl flex items-center space-x-2.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-red-400" />
                    <span className="font-medium">Close File</span>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Desktop Menus */}
        <div className="hidden md:flex items-center space-x-1.5">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('file')}
              onMouseEnter={() => handleMenuHover('file')}
              className={`px-3.5 py-1.5 text-xs rounded-xl transition-all duration-250 flex items-center space-x-1.5 ${
                activeMenu === 'file' 
                  ? 'bg-[#2a2a32] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                  : 'hover:bg-[#1a1a20]/80 text-gray-300'
              }`}
            >
              <span className="font-medium">File</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-200" style={{ transform: activeMenu === 'file' ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            <AnimatePresence>
              {activeMenu === 'file' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 mt-2 w-54 bg-[#141417]/96 backdrop-blur-2xl border border-[#31313a] rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5)] p-1.5 z-50 text-xs text-gray-300"
                >
                  <button
                    onClick={() => executeAction(onOpenFile)}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4 text-orange-400" />
                    <span className="flex-1 font-medium">Open File...</span>
                    <span className="text-[9px] text-gray-500 font-mono">⌘O</span>
                  </button>
                  <button
                    onClick={() => executeAction(onLoadWorkspaceState)}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                    title="Load a saved workspace .json state file"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span className="flex-1 font-medium">Load State (.json)</span>
                  </button>
                  {hasFile && (
                    <>
                      <div className="border-t border-[#2e2e33]/70 my-1.5" />
                      <button
                        onClick={() => executeAction(onSaveWorkspaceState)}
                        className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                        title="Save current workspace adjustments and settings to a .json file"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                        <span className="flex-1 font-medium">Save State (.json)</span>
                      </button>
                      <button
                        onClick={() => executeAction(onSaveFile)}
                        className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                      >
                        <Save className="w-4 h-4 text-blue-400" />
                        <span className="flex-1 font-medium">Save Asset</span>
                        <span className="text-[9px] text-gray-500 font-mono">⌘S</span>
                      </button>
                      {fileType === 'video' && (
                        <button
                          onClick={() => executeAction(onExportFrame)}
                          className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                        >
                          <FileImage className="w-4 h-4 text-purple-400" />
                          <span className="flex-1 font-medium">Export Current Frame</span>
                          <span className="text-[9px] text-gray-500 font-mono">⌥F</span>
                        </button>
                      )}
                      <div className="border-t border-[#2e2e33]/70 my-1.5" />
                      <button
                        onClick={() => executeAction(onCloseFile)}
                        className="w-full text-left px-3.5 py-2 hover:bg-red-950/40 hover:text-red-200 text-red-400 rounded-xl flex items-center space-x-2.5 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 text-red-400" />
                        <span className="font-medium">Close File</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('edit')}
              onMouseEnter={() => handleMenuHover('edit')}
              className={`px-3.5 py-1.5 text-xs rounded-xl transition-all duration-250 flex items-center space-x-1.5 ${
                activeMenu === 'edit' 
                  ? 'bg-[#2a2a32] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                  : 'hover:bg-[#1a1a20]/80 text-gray-300'
              }`}
            >
              <span className="font-medium">Edit</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-200" style={{ transform: activeMenu === 'edit' ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            <AnimatePresence>
              {activeMenu === 'edit' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 mt-2 w-58 bg-[#141417]/96 backdrop-blur-2xl border border-[#31313a] rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5)] p-1.5 z-50 text-xs text-gray-300"
                >
                  <button
                    onClick={() => executeAction(onUndo)}
                    disabled={!canUndo}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <Undo2 className="w-4 h-4" />
                    <span className="flex-1 font-medium">Undo</span>
                    <span className="text-[9px] text-gray-500 font-mono">⌘Z</span>
                  </button>
                  <button
                    onClick={() => executeAction(onRedo)}
                    disabled={!canRedo}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <Redo2 className="w-4 h-4" />
                    <span className="flex-1 font-medium">Redo</span>
                    <span className="text-[9px] text-gray-500 font-mono">⌘Y</span>
                  </button>
                  <div className="border-t border-[#2e2e33]/70 my-1.5" />
                  <button
                    onClick={() => executeAction(onCommitCrop)}
                    disabled={!canCommitCrop}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <Scissors className="w-4 h-4 text-emerald-400" />
                    <span className="flex-1 font-medium">Commit Crop</span>
                    <span className="text-[9px] text-gray-500 font-mono">Enter</span>
                  </button>
                  <div className="border-t border-[#2e2e33]/70 my-1.5" />
                  <button
                    onClick={() => executeAction(() => onRotate(90))}
                    disabled={!hasFile}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
                  >
                    <RotateCw className="w-4 h-4 text-orange-400" />
                    <span className="font-medium">Rotate 90° Clockwise</span>
                  </button>
                  <button
                    onClick={() => executeAction(() => onRotate(-90))}
                    disabled={!hasFile}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
                  >
                    <RotateCcw className="w-4 h-4 text-orange-400" />
                    <span className="font-medium">Rotate 90° CCW</span>
                  </button>
                  <button
                    onClick={() => executeAction(() => onFlip('h'))}
                    disabled={!hasFile}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
                  >
                    <Layers className="w-4 h-4 rotate-90 text-cyan-400" />
                    <span className="font-medium">Flip Horizontal</span>
                  </button>
                  <button
                    onClick={() => executeAction(() => onFlip('v'))}
                    disabled={!hasFile}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
                  >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium">Flip Vertical</span>
                  </button>
                  <div className="border-t border-[#2e2e33]/70 my-1.5" />
                  <button
                    onClick={() => executeAction(onResetAdjustments)}
                    disabled={!hasFile}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-950/30 hover:text-red-200 text-gray-400 rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
                  >
                    <RotateCcw className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Reset Sliders</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('view')}
              onMouseEnter={() => handleMenuHover('view')}
              className={`px-3.5 py-1.5 text-xs rounded-xl transition-all duration-250 flex items-center space-x-1.5 ${
                activeMenu === 'view' 
                  ? 'bg-[#2a2a32] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                  : 'hover:bg-[#1a1a20]/80 text-gray-300'
              }`}
            >
              <span className="font-medium">View</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-200" style={{ transform: activeMenu === 'view' ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            <AnimatePresence>
              {activeMenu === 'view' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 mt-2 w-50 bg-[#141417]/96 backdrop-blur-2xl border border-[#31313a] rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5)] p-1.5 z-50 text-xs text-gray-300"
                >
                  <button
                    onClick={() => executeAction(onZoomIn)}
                    disabled={!hasFile}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
                  >
                    <Maximize className="w-4 h-4" />
                    <span className="flex-1 font-medium">Zoom In</span>
                    <span className="text-[9px] text-gray-500 font-mono">+</span>
                  </button>
                  <button
                    onClick={() => executeAction(onZoomOut)}
                    disabled={!hasFile}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
                  >
                    <Minimize className="w-4 h-4" />
                    <span className="flex-1 font-medium">Zoom Out</span>
                    <span className="text-[9px] text-gray-500 font-mono">-</span>
                  </button>
                  <button
                    onClick={() => executeAction(onZoomReset)}
                    disabled={!hasFile}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
                  >
                    <Maximize className="w-4 h-4 scale-75" />
                    <span className="flex-1 font-medium">Actual Size (100%)</span>
                    <span className="text-[9px] text-gray-500 font-mono">0</span>
                  </button>
                  <button
                    onClick={() => executeAction(onZoomFit)}
                    disabled={!hasFile}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors disabled:opacity-20"
                  >
                    <Maximize className="w-4 h-4 rotate-45" />
                    <span className="flex-1 font-medium">Fit Canvas</span>
                    <span className="text-[9px] text-gray-500 font-mono">F</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('help')}
              onMouseEnter={() => handleMenuHover('help')}
              className={`px-3.5 py-1.5 text-xs rounded-xl transition-all duration-250 flex items-center space-x-1.5 ${
                activeMenu === 'help' 
                  ? 'bg-[#2a2a32] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                  : 'hover:bg-[#1a1a20]/80 text-gray-300'
              }`}
            >
              <span className="font-medium">Help</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-200" style={{ transform: activeMenu === 'help' ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            <AnimatePresence>
              {activeMenu === 'help' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 mt-2 w-50 bg-[#141417]/96 backdrop-blur-2xl border border-[#31313a] rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5)] p-1.5 z-50 text-xs text-gray-300"
                >
                  <button
                    onClick={() => { setShowManual(true); setActiveMenu(null); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#e25c24]/10 hover:text-white rounded-xl flex items-center space-x-2.5 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-sky-400" />
                    <span className="font-medium">Hephaestus Manual</span>
                  </button>
                  <div className="border-t border-[#2e2e33]/70 my-1.5" />
                  <div className="px-3.5 py-2 text-[10px] text-gray-500 leading-relaxed font-mono">
                    v1.0.0 (Local-Only)<br />
                    Zero AI • True Manual Control
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Center status indicators */}
      <div className="hidden md:flex items-center space-x-3 text-[11px] font-mono text-gray-500">
        <span className="flex items-center space-x-2 bg-[#141417]/90 px-3 py-1 rounded-full border border-[#222226]/80 shadow-sm">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-300 font-bold tracking-wider">SANDBOX ENVIROMENT: CLIENT SECURE</span>
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 text-xs text-gray-300">
        {/* Greek Theme Toggle Segmented Control */}
        <div className="flex items-center bg-custom-tertiary/90 border border-custom-color rounded-2xl p-0.5 space-x-0.5 sm:space-x-1" title="Theme (Ivory / Obsidian / Device Default)">
          <button
            onClick={() => onThemeChange('light')}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl transition-all duration-200 text-[10px] font-mono font-bold flex items-center space-x-1 ${
              theme === 'light' 
                ? 'bg-gradient-to-r from-[#e25c24] to-[#f98435] text-white shadow-md' 
                : 'hover:text-custom-primary text-custom-secondary'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">IVORY</span>
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl transition-all duration-200 text-[10px] font-mono font-bold flex items-center space-x-1 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-[#e25c24] to-[#f98435] text-white shadow-md' 
                : 'hover:text-custom-primary text-custom-secondary'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">OBSIDIAN</span>
          </button>
          <button
            onClick={() => onThemeChange('phone')}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl transition-all duration-200 text-[10px] font-mono font-bold flex items-center space-x-1 ${
              theme === 'phone' 
                ? 'bg-gradient-to-r from-[#e25c24] to-[#f98435] text-white shadow-md' 
                : 'hover:text-custom-primary text-custom-secondary'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">DEVICE</span>
          </button>
        </div>

        {/* Media Gallery / Vault Toggle */}
        <button
          onClick={onToggleGallery}
          className={`flex items-center space-x-1 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl border font-mono text-[10px] sm:text-[11px] font-bold tracking-wider transition-all duration-200 active:scale-95 shadow-sm ${
            showGallery 
              ? 'bg-gradient-to-r from-[#e25c24]/20 to-[#f98435]/20 border-custom-accent text-custom-accent shadow-[0_0_15px_rgba(226,92,36,0.15)]' 
              : 'bg-custom-tertiary border-custom-color text-custom-secondary hover:text-custom-primary hover:border-[#383842]'
          }`}
          title="Toggle Sacred Vault (Archival Gallery)"
        >
          <Library className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">GALLERY</span>
        </button>

        {hasFile && (
          <button
            onClick={onSaveFile}
            className="bg-gradient-to-r from-[#e25c24] to-[#ff7a3d] hover:from-[#ff7a3d] hover:to-[#ff945b] text-white font-semibold px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center space-x-1 shadow-lg shadow-[#e25c24]/20 hover:shadow-[#e25c24]/30 active:scale-[0.98] transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Export Asset</span>
          </button>
        )}
        <button
          onClick={() => setShowManual(true)}
          className="p-1.5 sm:p-2 rounded-full hover:bg-custom-tertiary text-custom-secondary hover:text-custom-primary transition-colors"
          title="Hephaestus Manual"
        >
          <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>

      {/* Manual Modal Dialog */}
      {showManual && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-[#2e2e33] max-w-2xl w-full rounded-lg shadow-2xl overflow-hidden text-gray-200 flex flex-col max-h-[85vh] font-sans">
            <div className="px-6 py-4 border-b border-[#2e2e33] flex justify-between items-center bg-[#141416]">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-[#f98435]" />
                <h2 className="text-base font-semibold tracking-wide font-mono">HEPHAESTUS MANUAL</h2>
              </div>
              <button
                onClick={() => setShowManual(false)}
                className="text-gray-400 hover:text-white bg-[#222226] hover:bg-[#2e2e33] px-2.5 py-1 rounded text-xs transition-colors"
              >
                Close
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider mb-2 text-[#f98435]">Overview</h3>
                <p>
                  Welcome to <strong>Hephaestus</strong>, the manual pixel-blacksmith forge. This application is designed to give you absolute, raw mathematical control over your visual media without any automated AI interpolation, guessing, or account tracking. Everything is processed directly inside your browser's pixel buffer.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider mb-2 text-[#f98435]">Toolbox Guide</h3>
                <ul className="space-y-3 pl-2">
                  <li>
                    <strong className="text-white">🔍 Hand / Select (H):</strong> Click and drag the workspace to pan. Use your mouse scroll-wheel to zoom in and out smoothly.
                  </li>
                  <li>
                    <strong className="text-white">✂️ Crop Tool (C):</strong> Drag a rectangle over the canvas, resize handles, and click <strong>Commit Crop</strong> in the Global Menu or toolbar to crop.
                  </li>
                  <li>
                    <strong className="text-white">🎨 Clone Stamp (S):</strong> 
                    <div className="pl-4 mt-1 border-l border-[#2e2e33] text-xs text-gray-400">
                      1. Select the tool and click the <strong>"Set Clone Source"</strong> button (or hold the <span className="px-1 bg-[#222226] rounded text-white font-mono">Alt</span> / <span className="px-1 bg-[#222226] rounded text-white font-mono">Option</span> key).<br />
                      2. Click anywhere on the canvas to lock in your source coordinate marker.<br />
                      3. Position your cursor over the destination blemish and paint. It will clone the source pattern at a constant offset!
                    </div>
                  </li>
                  <li>
                    <strong className="text-white">✨ Healing Brush (J):</strong> Works like the Clone Stamp, but uses a <strong>luminance-correction blending algorithm</strong> to seamlessly graft the texture from the source while matching the background color of the destination. Perfect for manual dust, scratch, and spot restoration!
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider mb-2 text-[#f98435]">Control Panel Features</h3>
                <ul className="space-y-2 pl-2">
                  <li>
                    <strong className="text-white">Restoration:</strong> Adjust <strong>Noise Reduction</strong> (a non-linear Median filter that strips out salt-and-pepper noise while keeping image edges clean) and <strong>Blur</strong>.
                  </li>
                  <li>
                    <strong className="text-white">Resolution Scaling (Manual Interpolation):</strong> Enter custom scale values and select <strong>Nearest Neighbor</strong> (glorious sharp pixels, perfect for retro art or crisp restoration) or <strong>Bilinear</strong> (weighted average, smooth scaling).
                  </li>
                  <li>
                    <strong className="text-white">Color Depth Quantization:</strong> Reduce the color space to 16-bit (high color), 8-bit (retro), 4-bit, 2-bit, or 1-bit (black & white). Add <strong>Floyd-Steinberg Dithering</strong> or <strong>Ordered Bayer Dithering</strong> to simulate colors through spatial patterns.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider mb-2 text-[#f98435]">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#121214] p-4 rounded border border-[#222226]">
                  <div><span className="text-[#f98435]">H</span> : Hand Tool</div>
                  <div><span className="text-[#f98435]">C</span> : Crop Tool</div>
                  <div><span className="text-[#f98435]">S</span> : Clone Stamp</div>
                  <div><span className="text-[#f98435]">J</span> : Healing Brush</div>
                  <div><span className="text-[#f98435]">Cmd/Ctrl + Z</span> : Undo</div>
                  <div><span className="text-[#f98435]">Cmd/Ctrl + Y</span> : Redo</div>
                  <div><span className="text-[#f98435]">F</span> : Fit Screen</div>
                  <div><span className="text-[#f98435]">Esc</span> : Cancel tool</div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-[#141416] border-t border-[#2e2e33] flex justify-end">
              <button
                onClick={() => setShowManual(false)}
                className="bg-[#e25c24] hover:bg-[#f98435] text-white px-5 py-1.5 rounded text-xs font-mono transition-all font-semibold uppercase tracking-wider"
              >
                Let's Forge
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
