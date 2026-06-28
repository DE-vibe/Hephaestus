import React, { useState, useRef, useEffect } from 'react';
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
  Archive
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
    <header className="h-12 bg-custom-secondary border-b border-custom-color text-custom-primary flex items-center justify-between px-4 select-none relative z-50 font-sans transition-colors duration-200">
      <div className="flex items-center space-x-6" ref={menuRef}>
        {/* Brand/Logo */}
        <div className="flex items-center space-x-2">
          {/* Stylized Anvil Icon */}
          <div className="w-6 h-6 bg-gradient-to-tr from-[#e25c24] to-[#f98435] rounded flex items-center justify-center shadow-lg shadow-[#e25c24]/20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4px_4px]" />
            <svg className="w-4 h-4 text-white font-bold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,5.5H13V7H11V5.5H5C3.34,5.5 2,6.84 2,8.5V11C2,12.66 3.34,14 5,14H7V18H17V14H19C20.66,14 22,12.66 22,11V8.5C22,6.84 20.66,5.5 19,5.5M16,13H8V9H16V13Z" />
            </svg>
          </div>
          <span className="font-mono text-sm tracking-widest font-semibold uppercase bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            HEPHAESTUS
          </span>
        </div>

        {/* Desktop Menus */}
        <div className="flex items-center space-x-1">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('file')}
              onMouseEnter={() => handleMenuHover('file')}
              className={`px-3 py-1 text-xs rounded transition-colors duration-150 flex items-center space-x-1 ${
                activeMenu === 'file' ? 'bg-[#2a2a2f] text-white' : 'hover:bg-[#1a1a1c] text-gray-300'
              }`}
            >
              <span>File</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 mt-1 w-52 bg-[#18181b] border border-[#2e2e33] rounded shadow-2xl py-1 z-50 text-xs text-gray-300 animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  onClick={() => executeAction(onOpenFile)}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-orange-400" />
                  <span className="flex-1">Open File...</span>
                  <span className="text-[10px] text-gray-500 font-mono">⌘O</span>
                </button>
                {hasFile && (
                  <>
                    <div className="border-t border-[#2e2e33] my-1" />
                    <button
                      onClick={() => executeAction(onSaveFile)}
                      className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2"
                    >
                      <Save className="w-3.5 h-3.5 text-blue-400" />
                      <span className="flex-1">Save Asset</span>
                      <span className="text-[10px] text-gray-500 font-mono">⌘S</span>
                    </button>
                    {fileType === 'video' && (
                      <button
                        onClick={() => executeAction(onExportFrame)}
                        className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2"
                      >
                        <FileImage className="w-3.5 h-3.5 text-purple-400" />
                        <span className="flex-1">Export Current Frame</span>
                        <span className="text-[10px] text-gray-500 font-mono">⌥F</span>
                      </button>
                    )}
                    <div className="border-t border-[#2e2e33] my-1" />
                    <button
                      onClick={() => executeAction(onCloseFile)}
                      className="w-full text-left px-4 py-2 hover:bg-red-900/40 hover:text-red-200 text-red-400 flex items-center space-x-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Close File</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('edit')}
              onMouseEnter={() => handleMenuHover('edit')}
              className={`px-3 py-1 text-xs rounded transition-colors duration-150 flex items-center space-x-1 ${
                activeMenu === 'edit' ? 'bg-[#2a2a2f] text-white' : 'hover:bg-[#1a1a1c] text-gray-300'
              }`}
            >
              <span>Edit</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 mt-1 w-56 bg-[#18181b] border border-[#2e2e33] rounded shadow-2xl py-1 z-50 text-xs text-gray-300 animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  onClick={() => executeAction(onUndo)}
                  disabled={!canUndo}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="flex-1">Undo</span>
                  <span className="text-[10px] text-gray-500 font-mono">⌘Z</span>
                </button>
                <button
                  onClick={() => executeAction(onRedo)}
                  disabled={!canRedo}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                  <span className="flex-1">Redo</span>
                  <span className="text-[10px] text-gray-500 font-mono">⌘Y</span>
                </button>
                <div className="border-t border-[#2e2e33] my-1" />
                <button
                  onClick={() => executeAction(onCommitCrop)}
                  disabled={!canCommitCrop}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="flex-1">Commit Crop</span>
                  <span className="text-[10px] text-gray-500 font-mono">Enter</span>
                </button>
                <div className="border-t border-[#2e2e33] my-1" />
                <button
                  onClick={() => executeAction(() => onRotate(90))}
                  disabled={!hasFile}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90° Clockwise</span>
                </button>
                <button
                  onClick={() => executeAction(() => onRotate(-90))}
                  disabled={!hasFile}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rotate 90° Counter-Clockwise</span>
                </button>
                <button
                  onClick={() => executeAction(() => onFlip('h'))}
                  disabled={!hasFile}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30"
                >
                  <Layers className="w-3.5 h-3.5 rotate-90" />
                  <span>Flip Horizontal</span>
                </button>
                <button
                  onClick={() => executeAction(() => onFlip('v'))}
                  disabled={!hasFile}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Flip Vertical</span>
                </button>
                <div className="border-t border-[#2e2e33] my-1" />
                <button
                  onClick={() => executeAction(onResetAdjustments)}
                  disabled={!hasFile}
                  className="w-full text-left px-4 py-2 hover:bg-red-950/20 hover:text-red-200 text-gray-400 flex items-center space-x-2 disabled:opacity-30"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                  <span>Reset Sliders</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('view')}
              onMouseEnter={() => handleMenuHover('view')}
              className={`px-3 py-1 text-xs rounded transition-colors duration-150 flex items-center space-x-1 ${
                activeMenu === 'view' ? 'bg-[#2a2a2f] text-white' : 'hover:bg-[#1a1a1c] text-gray-300'
              }`}
            >
              <span>View</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {activeMenu === 'view' && (
              <div className="absolute left-0 mt-1 w-48 bg-[#18181b] border border-[#2e2e33] rounded shadow-2xl py-1 z-50 text-xs text-gray-300 animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  onClick={() => executeAction(onZoomIn)}
                  disabled={!hasFile}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30"
                >
                  <Maximize className="w-3.5 h-3.5" />
                  <span className="flex-1">Zoom In</span>
                  <span className="text-[10px] text-gray-500 font-mono">+</span>
                </button>
                <button
                  onClick={() => executeAction(onZoomOut)}
                  disabled={!hasFile}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30"
                >
                  <Minimize className="w-3.5 h-3.5" />
                  <span className="flex-1">Zoom Out</span>
                  <span className="text-[10px] text-gray-500 font-mono">-</span>
                </button>
                <button
                  onClick={() => executeAction(onZoomReset)}
                  disabled={!hasFile}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30"
                >
                  <Maximize className="w-3.5 h-3.5 scale-75" />
                  <span className="flex-1">Actual Size (100%)</span>
                  <span className="text-[10px] text-gray-500 font-mono">0</span>
                </button>
                <button
                  onClick={() => executeAction(onZoomFit)}
                  disabled={!hasFile}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2 disabled:opacity-30"
                >
                  <Maximize className="w-3.5 h-3.5 rotate-45" />
                  <span className="flex-1">Fit Canvas</span>
                  <span className="text-[10px] text-gray-500 font-mono">F</span>
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('help')}
              onMouseEnter={() => handleMenuHover('help')}
              className={`px-3 py-1 text-xs rounded transition-colors duration-150 flex items-center space-x-1 ${
                activeMenu === 'help' ? 'bg-[#2a2a2f] text-white' : 'hover:bg-[#1a1a1c] text-gray-300'
              }`}
            >
              <span>Help</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {activeMenu === 'help' && (
              <div className="absolute left-0 mt-1 w-48 bg-[#18181b] border border-[#2e2e33] rounded shadow-2xl py-1 z-50 text-xs text-gray-300 animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  onClick={() => { setShowManual(true); setActiveMenu(null); }}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2a30] hover:text-white flex items-center space-x-2"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>Hephaestus Manual</span>
                </button>
                <div className="border-t border-[#2e2e33] my-1" />
                <div className="px-4 py-2 text-[10px] text-gray-500 leading-relaxed font-mono">
                  v1.0.0 (Local-Only)<br />
                  Zero AI • True Manual Control
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center status indicators */}
      <div className="hidden md:flex items-center space-x-3 text-[11px] font-mono text-gray-500">
        <span className="flex items-center space-x-1.5 bg-[#17171a] px-2.5 py-1 rounded border border-[#222226]">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-300">SANDBOX ENVIROMENT: CLIENT SECURE</span>
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3 text-xs text-gray-300">
        {/* Greek Theme Toggle Segmented Control */}
        <div className="flex items-center bg-custom-tertiary border border-custom-color rounded p-0.5 space-x-0.5" title="Theme (Ivory / Obsidian / Device Default)">
          <button
            onClick={() => onThemeChange('light')}
            className={`px-1.5 py-1 rounded transition-colors text-[10px] font-mono font-semibold flex items-center space-x-1 ${
              theme === 'light' 
                ? 'bg-custom-accent text-white shadow-sm' 
                : 'hover:text-custom-primary text-custom-secondary'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">IVORY</span>
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={`px-1.5 py-1 rounded transition-colors text-[10px] font-mono font-semibold flex items-center space-x-1 ${
              theme === 'dark' 
                ? 'bg-custom-accent text-white shadow-sm' 
                : 'hover:text-custom-primary text-custom-secondary'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">OBSIDIAN</span>
          </button>
          <button
            onClick={() => onThemeChange('phone')}
            className={`px-1.5 py-1 rounded transition-colors text-[10px] font-mono font-semibold flex items-center space-x-1 ${
              theme === 'phone' 
                ? 'bg-custom-accent text-white shadow-sm' 
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
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-[11px] font-bold tracking-wider transition-all duration-200 active:scale-95 ${
            showGallery 
              ? 'bg-custom-accent/15 border-custom-accent text-custom-accent shadow-sm' 
              : 'bg-custom-tertiary border-custom-color text-custom-secondary hover:text-custom-primary hover:border-custom-accent/30'
          }`}
          title="Toggle Sacred Vault (Archival Gallery)"
        >
          <Library className="w-3.5 h-3.5" />
          <span>GALLERY</span>
        </button>

        {hasFile && (
          <button
            onClick={onSaveFile}
            className="bg-[#e25c24] hover:bg-[#f98435] text-white font-medium px-3 py-1.5 rounded flex items-center space-x-1.5 shadow-lg shadow-[#e25c24]/15 active:scale-[0.98] transition-all duration-100"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Export Asset</span>
          </button>
        )}
        <button
          onClick={() => setShowManual(true)}
          className="p-1.5 rounded hover:bg-custom-tertiary text-custom-secondary hover:text-custom-primary transition-colors"
          title="Hephaestus Manual"
        >
          <HelpCircle className="w-4 h-4" />
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
