import React from 'react';
import { 
  Move, 
  Crop, 
  Stamp, 
  Sparkles, 
  Pipette, 
  RotateCw, 
  Layers,
  ChevronRight,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import { ToolType, CloneStampSettings } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onChangeTool: (tool: ToolType) => void;
  cloneSettings: CloneStampSettings;
  onChangeCloneSettings: (settings: Partial<CloneStampSettings>) => void;
  onRotate: (deg: number) => void;
  onFlip: (dir: 'h' | 'v') => void;
  hasFile: boolean;
}

export default function Toolbar({
  activeTool,
  onChangeTool,
  cloneSettings,
  onChangeCloneSettings,
  onRotate,
  onFlip,
  hasFile,
}: ToolbarProps) {
  return (
    <aside className="w-full md:w-16 h-12 md:h-full bg-gradient-to-r md:bg-gradient-to-b from-[#18181c]/95 to-[#0b0b0d]/98 border-b md:border-b-0 md:border-r border-[#2d2d34]/75 flex flex-row md:flex-col items-center px-4 md:px-0 py-0 md:py-5 justify-between select-none relative z-40 shadow-[0_4px_24px_rgba(0,0,0,0.5)] md:shadow-[4px_0_24px_rgba(0,0,0,0.5)] flex-shrink-0">
      {/* Top tools cluster */}
      <div className="flex flex-row md:flex-col items-center space-y-0 md:space-y-3.5 space-x-2 md:space-x-0 w-auto md:w-full">
        <span className="hidden md:inline text-[9px] font-mono font-bold text-gray-500 tracking-[0.15em] uppercase mb-1">
          TOOLS
        </span>

        {/* Hand/Move tool */}
        <button
          onClick={() => onChangeTool('select')}
          disabled={!hasFile}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ease-out group relative ${
            !hasFile ? 'opacity-20 cursor-not-allowed' :
            activeTool === 'select'
              ? 'bg-gradient-to-br from-[#e25c24] to-[#ff7a3d] text-white shadow-[0_4px_15px_rgba(226,92,36,0.4)] border border-[#ff8d55]/40 scale-105'
              : 'text-gray-400 hover:text-white hover:bg-[#202026]/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-transparent hover:border-[#383842]'
          }`}
          title="Hand/Move (H)"
        >
          <Move className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="hidden md:block absolute left-15 ml-2 px-2.5 py-1.5 bg-[#18181c]/95 backdrop-blur-md border border-[#2d2d34] text-[10px] text-gray-200 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 font-mono">
            Hand Tool (H)
          </span>
        </button>

        {/* Crop tool */}
        <button
          onClick={() => onChangeTool('crop')}
          disabled={!hasFile}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ease-out group relative ${
            !hasFile ? 'opacity-20 cursor-not-allowed' :
            activeTool === 'crop'
              ? 'bg-gradient-to-br from-[#e25c24] to-[#ff7a3d] text-white shadow-[0_4px_15px_rgba(226,92,36,0.4)] border border-[#ff8d55]/40 scale-105'
              : 'text-gray-400 hover:text-white hover:bg-[#202026]/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-transparent hover:border-[#383842]'
          }`}
          title="Crop Tool (C)"
        >
          <Crop className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="hidden md:block absolute left-15 ml-2 px-2.5 py-1.5 bg-[#18181c]/95 backdrop-blur-md border border-[#2d2d34] text-[10px] text-gray-200 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 font-mono">
            Crop Tool (C)
          </span>
        </button>

        {/* Clone Stamp */}
        <button
          onClick={() => onChangeTool('clone')}
          disabled={!hasFile}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ease-out group relative ${
            !hasFile ? 'opacity-20 cursor-not-allowed' :
            activeTool === 'clone'
              ? 'bg-gradient-to-br from-[#e25c24] to-[#ff7a3d] text-white shadow-[0_4px_15px_rgba(226,92,36,0.4)] border border-[#ff8d55]/40 scale-105'
              : 'text-gray-400 hover:text-white hover:bg-[#202026]/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-transparent hover:border-[#383842]'
          }`}
          title="Clone Stamp (S)"
        >
          <Stamp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="hidden md:block absolute left-15 ml-2 px-2.5 py-1.5 bg-[#18181c]/95 backdrop-blur-md border border-[#2d2d34] text-[10px] text-gray-200 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 font-mono">
            Clone Stamp (S)
          </span>
        </button>

        {/* Healing Brush */}
        <button
          onClick={() => onChangeTool('heal')}
          disabled={!hasFile}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ease-out group relative ${
            !hasFile ? 'opacity-20 cursor-not-allowed' :
            activeTool === 'heal'
              ? 'bg-gradient-to-br from-[#e25c24] to-[#ff7a3d] text-white shadow-[0_4px_15px_rgba(226,92,36,0.4)] border border-[#ff8d55]/40 scale-105'
              : 'text-gray-400 hover:text-white hover:bg-[#202026]/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-transparent hover:border-[#383842]'
          }`}
          title="Healing Brush (J)"
        >
          <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="hidden md:block absolute left-15 ml-2 px-2.5 py-1.5 bg-[#18181c]/95 backdrop-blur-md border border-[#2d2d34] text-[10px] text-gray-200 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 font-mono">
            Healing Brush (J)
          </span>
        </button>

        {/* Color Correction Picker */}
        <button
          onClick={() => onChangeTool('color_picker')}
          disabled={!hasFile}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ease-out group relative ${
            !hasFile ? 'opacity-20 cursor-not-allowed' :
            activeTool === 'color_picker'
              ? 'bg-gradient-to-br from-[#e25c24] to-[#ff7a3d] text-white shadow-[0_4px_15px_rgba(226,92,36,0.4)] border border-[#ff8d55]/40 scale-105'
              : 'text-gray-400 hover:text-white hover:bg-[#202026]/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-transparent hover:border-[#383842]'
          }`}
          title="Color Calibration Picker"
        >
          <Pipette className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="hidden md:block absolute left-15 ml-2 px-2.5 py-1.5 bg-[#18181c]/95 backdrop-blur-md border border-[#2d2d34] text-[10px] text-gray-200 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 font-mono">
            White Balance Eyedropper
          </span>
        </button>
      </div>

      {/* Brush parameters panel for active drawing tools */}
      {hasFile && (activeTool === 'clone' || activeTool === 'heal') && (
        <div className="absolute left-1/2 -translate-x-1/2 md:left-16 md:translate-x-0 top-14 md:top-12 ml-0 md:ml-3 w-52 bg-[#18181c]/95 backdrop-blur-xl border border-[#35353d]/85 rounded-2xl shadow-3xl p-4 text-xs text-gray-300 animate-in fade-in slide-in-from-left-3 duration-200 z-50">
          <div className="font-mono font-bold text-gray-200 mb-2.5 border-b border-[#2d2d34] pb-1.5 uppercase tracking-[0.08em] flex items-center justify-between">
            <span>{activeTool === 'clone' ? 'Clone Stamp' : 'Healing Brush'}</span>
            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-full">Manual</span>
          </div>

          <div className="space-y-3.5">
            {/* Brush Size */}
            <div>
              <div className="flex justify-between font-mono mb-1 text-[10px]">
                <span>Size:</span>
                <span className="text-[#f98435] font-bold">{cloneSettings.brushSize}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={cloneSettings.brushSize}
                onChange={(e) => onChangeCloneSettings({ brushSize: parseInt(e.target.value) })}
                className="w-full accent-[#e25c24] bg-zinc-800 h-1.5 rounded-full cursor-pointer"
              />
            </div>

            {/* Opacity/Strength for Clone Stamp */}
            {activeTool === 'clone' && (
              <div>
                <div className="flex justify-between font-mono mb-1 text-[10px]">
                  <span>Strength:</span>
                  <span className="text-[#f98435] font-bold">{Math.round(cloneSettings.brushStrength * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cloneSettings.brushStrength * 100}
                  onChange={(e) => onChangeCloneSettings({ brushStrength: parseInt(e.target.value) / 100 })}
                  className="w-full accent-[#e25c24] bg-zinc-800 h-1.5 rounded-full cursor-pointer"
                />
              </div>
            )}

            {activeTool === 'clone' && (
              <div className="pt-2 border-t border-[#2d2d34] flex flex-col space-y-2">
                <button
                  onClick={() => onChangeCloneSettings({ isSettingSource: true })}
                  className={`w-full py-1.5 rounded-xl text-[10px] font-mono transition-all duration-200 border ${
                    cloneSettings.isSettingSource
                      ? 'bg-gradient-to-r from-[#e25c24]/20 to-[#f98435]/20 text-[#f98435] border-[#e25c24]/60 shadow-[0_0_12px_rgba(226,92,36,0.15)]'
                      : 'bg-[#222226] hover:bg-[#2c2c31] text-gray-300 border-[#2e2e33] hover:border-zinc-600'
                  }`}
                >
                  {cloneSettings.isSettingSource ? 'Click canvas...' : 'Set Source Anchor'}
                </button>
                <div className="text-[9px] text-gray-500 font-mono leading-tight">
                  💡 Tip: Hold <span className="text-gray-300 bg-[#222226] px-1 rounded">Alt</span> to quickly set source coordinate.
                </div>
              </div>
            )}

            {activeTool === 'heal' && (
              <div className="pt-2 border-t border-[#2d2d34] flex flex-col space-y-2">
                <button
                  onClick={() => onChangeCloneSettings({ isSettingSource: true })}
                  className={`w-full py-1.5 rounded-xl text-[10px] font-mono transition-all duration-200 border ${
                    cloneSettings.isSettingSource
                      ? 'bg-gradient-to-r from-[#e25c24]/20 to-[#f98435]/20 text-[#f98435] border-[#e25c24]/60 shadow-[0_0_12px_rgba(226,92,36,0.15)]'
                      : 'bg-[#222226] hover:bg-[#2c2c31] text-gray-300 border-[#2e2e33] hover:border-zinc-600'
                  }`}
                >
                  {cloneSettings.isSettingSource ? 'Click reference...' : 'Set Heal Target'}
                </button>
                <div className="text-[9px] text-gray-500 font-mono leading-tight">
                  Smooth feather blends textures to remove spots/scratches.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Color picker calibration instructions */}
      {hasFile && activeTool === 'color_picker' && (
        <div className="absolute left-1/2 -translate-x-1/2 md:left-16 md:translate-x-0 top-14 md:top-12 ml-0 md:ml-3 w-52 bg-[#18181c]/95 backdrop-blur-xl border border-[#35353d]/85 rounded-2xl shadow-3xl p-4 text-xs text-gray-300 animate-in fade-in slide-in-from-left-3 duration-200 z-50">
          <div className="font-mono font-bold text-gray-200 mb-2.5 border-b border-[#2d2d34] pb-1.5 uppercase tracking-[0.08em] flex items-center justify-between">
            <span>Color Calibrate</span>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded-full">Active</span>
          </div>
          <div className="space-y-2.5 font-mono text-[10px] leading-relaxed text-zinc-400">
            <p>
              Click any point in the image that should be <span className="text-zinc-200 font-bold">neutral gray</span> or white.
            </p>
            <p className="text-[9px] text-[#f98435]">
              Hephaestus will instantly calculate and adjust the RGB gains to neutralize color casts and correct white balance.
            </p>
          </div>
        </div>
      )}

      {/* Bottom transforms quick-bar */}
      <div className="flex flex-row md:flex-col items-center space-y-0 md:space-y-2.5 space-x-2 md:space-x-0 w-auto md:w-full border-t-0 md:border-t border-[#2d2d34]/60 pt-0 md:pt-4">
        <span className="hidden md:inline text-[9px] font-mono font-bold text-gray-500 tracking-[0.15em] uppercase mb-1">
          QUICK
        </span>

        {/* Rotate CW */}
        <button
          onClick={() => onRotate(90)}
          disabled={!hasFile}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#202026]/90 border border-transparent hover:border-[#383842] disabled:opacity-15 transition-all duration-300 group relative"
          title="Rotate 90 deg Clockwise"
        >
          <RotateCw className="w-4 h-4" />
          <span className="hidden md:block absolute left-15 ml-2 px-2.5 py-1.5 bg-[#18181c]/95 backdrop-blur-md border border-[#2d2d34] text-[10px] text-gray-200 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 font-mono">
            Rotate 90° CW
          </span>
        </button>

        {/* Flip Horizontal */}
        <button
          onClick={() => onFlip('h')}
          disabled={!hasFile}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#202026]/90 border border-transparent hover:border-[#383842] disabled:opacity-15 transition-all duration-300 group relative"
          title="Flip Horizontal"
        >
          <Layers className="w-4 h-4 rotate-90" />
          <span className="hidden md:block absolute left-15 ml-2 px-2.5 py-1.5 bg-[#18181c]/95 backdrop-blur-md border border-[#2d2d34] text-[10px] text-gray-200 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 font-mono">
            Flip Horizontal
          </span>
        </button>
      </div>
    </aside>
  );
}
