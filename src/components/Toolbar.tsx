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
    <aside className="w-16 bg-[#121214] border-r border-[#222226] flex flex-col items-center py-4 justify-between select-none relative z-40">
      {/* Top tools cluster */}
      <div className="flex flex-col items-center space-y-3 w-full">
        <span className="text-[9px] font-mono font-semibold text-gray-600 tracking-wider uppercase mb-1">
          Tools
        </span>

        {/* Hand/Move tool */}
        <button
          onClick={() => onChangeTool('select')}
          disabled={!hasFile}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 group relative ${
            !hasFile ? 'opacity-25 cursor-not-allowed' :
            activeTool === 'select'
              ? 'bg-[#e25c24] text-white shadow-lg shadow-[#e25c24]/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1c]'
          }`}
          title="Hand/Move (H)"
        >
          <Move className="w-4 h-4" />
          <span className="absolute left-14 ml-1 px-2 py-1 bg-[#1a1a1c] border border-[#2e2e33] text-[10px] text-gray-300 rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 font-mono">
            Hand Tool (H)
          </span>
        </button>

        {/* Crop tool */}
        <button
          onClick={() => onChangeTool('crop')}
          disabled={!hasFile}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 group relative ${
            !hasFile ? 'opacity-25 cursor-not-allowed' :
            activeTool === 'crop'
              ? 'bg-[#e25c24] text-white shadow-lg shadow-[#e25c24]/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1c]'
          }`}
          title="Crop Tool (C)"
        >
          <Crop className="w-4 h-4" />
          <span className="absolute left-14 ml-1 px-2 py-1 bg-[#1a1a1c] border border-[#2e2e33] text-[10px] text-gray-300 rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 font-mono">
            Crop Tool (C)
          </span>
        </button>

        {/* Clone Stamp */}
        <button
          onClick={() => onChangeTool('clone')}
          disabled={!hasFile}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 group relative ${
            !hasFile ? 'opacity-25 cursor-not-allowed' :
            activeTool === 'clone'
              ? 'bg-[#e25c24] text-white shadow-lg shadow-[#e25c24]/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1c]'
          }`}
          title="Clone Stamp (S)"
        >
          <Stamp className="w-4 h-4" />
          <span className="absolute left-14 ml-1 px-2 py-1 bg-[#1a1a1c] border border-[#2e2e33] text-[10px] text-gray-300 rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 font-mono">
            Clone Stamp (S)
          </span>
        </button>

        {/* Healing Brush */}
        <button
          onClick={() => onChangeTool('heal')}
          disabled={!hasFile}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 group relative ${
            !hasFile ? 'opacity-25 cursor-not-allowed' :
            activeTool === 'heal'
              ? 'bg-[#e25c24] text-white shadow-lg shadow-[#e25c24]/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1c]'
          }`}
          title="Healing Brush (J)"
        >
          <Sparkles className="w-4 h-4" />
          <span className="absolute left-14 ml-1 px-2 py-1 bg-[#1a1a1c] border border-[#2e2e33] text-[10px] text-gray-300 rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 font-mono">
            Healing Brush (J)
          </span>
        </button>

        {/* Color Correction Picker */}
        <button
          onClick={() => onChangeTool('color_picker')}
          disabled={!hasFile}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 group relative ${
            !hasFile ? 'opacity-25 cursor-not-allowed' :
            activeTool === 'color_picker'
              ? 'bg-[#e25c24] text-white shadow-lg shadow-[#e25c24]/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1c]'
          }`}
          title="Color Calibration Picker"
        >
          <Pipette className="w-4 h-4" />
          <span className="absolute left-14 ml-1 px-2 py-1 bg-[#1a1a1c] border border-[#2e2e33] text-[10px] text-gray-300 rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 font-mono">
            White Balance Eyedropper
          </span>
        </button>
      </div>

      {/* Brush parameters panel for active drawing tools */}
      {hasFile && (activeTool === 'clone' || activeTool === 'heal') && (
        <div className="absolute left-16 top-12 ml-2 w-48 bg-[#18181b] border border-[#2e2e33] rounded-lg shadow-2xl p-3 text-xs text-gray-300 animate-in fade-in slide-in-from-left-2 duration-150 z-50">
          <div className="font-mono font-bold text-gray-400 mb-2 border-b border-[#222226] pb-1 uppercase tracking-wider flex items-center justify-between">
            <span>{activeTool === 'clone' ? 'Clone Stamp' : 'Healing Brush'}</span>
            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1 rounded">Manual</span>
          </div>

          <div className="space-y-3">
            {/* Brush Size */}
            <div>
              <div className="flex justify-between font-mono mb-1 text-[10px]">
                <span>Size:</span>
                <span className="text-[#f98435]">{cloneSettings.brushSize}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={cloneSettings.brushSize}
                onChange={(e) => onChangeCloneSettings({ brushSize: parseInt(e.target.value) })}
                className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded"
              />
            </div>

            {/* Opacity/Strength for Clone Stamp */}
            {activeTool === 'clone' && (
              <div>
                <div className="flex justify-between font-mono mb-1 text-[10px]">
                  <span>Strength:</span>
                  <span className="text-[#f98435]">{Math.round(cloneSettings.brushStrength * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cloneSettings.brushStrength * 100}
                  onChange={(e) => onChangeCloneSettings({ brushStrength: parseInt(e.target.value) / 100 })}
                  className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded"
                />
              </div>
            )}

            {activeTool === 'clone' && (
              <div className="pt-1.5 border-t border-[#222226] flex flex-col space-y-1.5">
                <button
                  onClick={() => onChangeCloneSettings({ isSettingSource: true })}
                  className={`w-full py-1 rounded text-[10px] font-mono transition-colors border ${
                    cloneSettings.isSettingSource
                      ? 'bg-[#e25c24]/20 text-[#f98435] border-[#e25c24]/50'
                      : 'bg-[#222226] hover:bg-[#2c2c31] text-gray-300 border-[#2e2e33]'
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
              <div className="pt-1.5 border-t border-[#222226] flex flex-col space-y-1.5">
                <button
                  onClick={() => onChangeCloneSettings({ isSettingSource: true })}
                  className={`w-full py-1 rounded text-[10px] font-mono transition-colors border ${
                    cloneSettings.isSettingSource
                      ? 'bg-[#e25c24]/20 text-[#f98435] border-[#e25c24]/50'
                      : 'bg-[#222226] hover:bg-[#2c2c31] text-gray-300 border-[#2e2e33]'
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

      {/* Bottom transforms quick-bar */}
      <div className="flex flex-col items-center space-y-2 w-full border-t border-[#1e1e21] pt-3">
        <span className="text-[9px] font-mono font-semibold text-gray-600 tracking-wider uppercase mb-1">
          Quick
        </span>

        {/* Rotate CW */}
        <button
          onClick={() => onRotate(90)}
          disabled={!hasFile}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1c] disabled:opacity-20 transition-all duration-150 group relative"
          title="Rotate 90 deg Clockwise"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="absolute left-14 ml-1 px-2 py-1 bg-[#1a1a1c] border border-[#2e2e33] text-[10px] text-gray-300 rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 font-mono">
            Rotate 90° CW
          </span>
        </button>

        {/* Flip Horizontal */}
        <button
          onClick={() => onFlip('h')}
          disabled={!hasFile}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1c] disabled:opacity-20 transition-all duration-150 group relative"
          title="Flip Horizontal"
        >
          <Layers className="w-3.5 h-3.5 rotate-90" />
          <span className="absolute left-14 ml-1 px-2 py-1 bg-[#1a1a1c] border border-[#2e2e33] text-[10px] text-gray-300 rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 font-mono">
            Flip Horizontal
          </span>
        </button>
      </div>
    </aside>
  );
}
