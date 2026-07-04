import React, { useState } from 'react';
import { 
  History, 
  Settings, 
  Sliders, 
  Sparkles, 
  Image, 
  Layers, 
  RefreshCw,
  Scale,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FilterAdjustments, ScaleSettings, HistoryItem, VideoState } from '../types';

interface ControlPanelProps {
  adjustments: FilterAdjustments;
  onChangeAdjustments: (adjustments: Partial<FilterAdjustments>) => void;
  scaleSettings: ScaleSettings;
  onChangeScaleSettings: (settings: Partial<ScaleSettings>) => void;
  onApplyScale: () => void;
  historyStack: HistoryItem[];
  currentHistoryIndex: number;
  onJumpToHistory: (index: number) => void;
  hasFile: boolean;
  imageDimensions: { width: number; height: number } | null;
  fileType?: 'image' | 'video' | null;
  videoState?: VideoState;
  onChangeVideoState?: (state: Partial<VideoState>) => void;
}

export default function ControlPanel({
  adjustments,
  onChangeAdjustments,
  scaleSettings,
  onChangeScaleSettings,
  onApplyScale,
  historyStack,
  currentHistoryIndex,
  onJumpToHistory,
  hasFile,
  imageDimensions,
  fileType = 'image',
  videoState,
  onChangeVideoState,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'adjust' | 'scale' | 'history'>('adjust');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`w-full bg-[#111113]/95 backdrop-blur-xl border-t border-[#222226] rounded-t-3xl flex flex-col select-none text-gray-200 font-sans z-40 relative shadow-[0_-8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 ease-in-out ${
        isCollapsed ? 'h-12 overflow-hidden' : 'h-[55vh] sm:h-[45vh] md:h-80'
      }`}
    >
      {/* Header / Tab Bar / Collapse Control */}
      <div className="flex items-center justify-between border-b border-[#222226]/55 bg-[#09090b]/80 px-3 sm:px-6 h-12 flex-shrink-0 select-none rounded-t-3xl">
        <div className="flex items-center space-x-1 sm:space-x-1.5 h-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveTab('adjust');
              setIsCollapsed(false);
            }}
            className={`px-2.5 sm:px-4.5 text-xs font-mono font-bold tracking-wider uppercase border-b-2 flex items-center justify-center space-x-1.5 sm:space-x-2 h-full transition-all duration-200 ${
              activeTab === 'adjust' && !isCollapsed
                ? 'border-[#e25c24] text-white bg-[#111113]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-800/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#e25c24]" />
            <span className="hidden xs:inline">Forge sliders</span>
            <span className="inline xs:hidden">Sliders</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('scale');
              setIsCollapsed(false);
            }}
            className={`px-2.5 sm:px-4.5 text-xs font-mono font-bold tracking-wider uppercase border-b-2 flex items-center justify-center space-x-1.5 sm:space-x-2 h-full transition-all duration-200 ${
              activeTab === 'scale' && !isCollapsed
                ? 'border-[#e25c24] text-white bg-[#111113]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-800/10'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden xs:inline">Resolution scaling</span>
            <span className="inline xs:hidden">Scaling</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setIsCollapsed(false);
            }}
            className={`px-2.5 sm:px-4.5 text-xs font-mono font-bold tracking-wider uppercase border-b-2 flex items-center justify-center space-x-1.5 sm:space-x-2 h-full transition-all duration-200 ${
              activeTab === 'history' && !isCollapsed
                ? 'border-[#e25c24] text-white bg-[#111113]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-800/10'
            }`}
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden xs:inline">{fileType === 'video' ? 'Pipeline status' : 'History logs'}</span>
            <span className="inline xs:hidden">{fileType === 'video' ? 'Pipeline' : 'History'}</span>
            {fileType !== 'video' && historyStack.length > 0 && (
              <span className="text-[9px] bg-[#e25c24]/20 text-[#ff8d55] px-1.5 py-0.5 rounded-full border border-[#e25c24]/30 font-sans font-bold ml-1 sm:ml-1.5 shadow-sm">
                {historyStack.length}
              </span>
            )}
          </button>
        </div>

        {/* Collapse Toggle Button on the Right */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono text-gray-400 hover:text-white hover:bg-zinc-800/80 transition-all border border-zinc-800/50"
          title={isCollapsed ? "Expand Adjustments" : "Collapse Adjustments"}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-4 h-4 text-[#e25c24] animate-bounce" />
              <span className="text-[10px] uppercase font-bold text-[#f98435] hidden sm:inline">Expand Settings</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
              <span className="text-[10px] uppercase hidden sm:inline">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container Content */}
      <div 
        className={`flex-1 overflow-y-auto p-4 space-y-5 transition-opacity duration-200 ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {!hasFile ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-6">
            <Settings className="w-8 h-8 opacity-20 mb-2 animate-spin duration-3000" />
            <p className="text-xs font-mono">No active media loaded.</p>
            <p className="text-[10px] mt-1 text-gray-600">Import an image or video to calibrate settings.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Active Tab: Forge / Adjustments */}
            {activeTab === 'adjust' && (
              <motion.div
                key="adjust"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-4"
              >
                
                {/* Column 1: Asset Details, Presets & Color depth */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-[#f98435] uppercase tracking-widest border-b border-[#222226] pb-1">
                    <Image className="w-3 h-3" />
                    <span>{fileType === 'video' ? 'Video properties' : 'Metadata & Color depth'}</span>
                  </div>

                  {imageDimensions && (
                    <div className="bg-[#17171a] border border-[#222226] rounded-2xl p-3.5 space-y-2 text-xs font-mono shadow-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>Resolution:</span>
                        <span className="text-gray-200 font-semibold">
                          {imageDimensions.width} × {imageDimensions.height} px
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Total Pixels:</span>
                        <span className="text-gray-200">
                          {((imageDimensions.width * imageDimensions.height) / 1000000).toFixed(2)} MP
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Type:</span>
                        <span className="text-[#f98435] capitalize font-bold">{fileType}</span>
                      </div>
                      {fileType === 'video' && videoState && (
                        <div className="flex justify-between text-gray-400 border-t border-[#222226]/50 pt-1.5 mt-1.5">
                          <span>FPS / Duration:</span>
                          <span className="text-gray-200">
                            {videoState.fps} FPS / {videoState.duration.toFixed(1)}s
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Playback speed for Video OR Presets for Image */}
                  {fileType === 'video' && videoState && onChangeVideoState ? (
                    <div className="bg-[#17171a]/55 border border-[#222226] rounded-2xl p-3.5 space-y-2">
                      <label className="text-[11px] text-[#f98435] font-mono font-bold uppercase tracking-wider block">Playback Speed</label>
                      <div className="grid grid-cols-5 gap-1 font-mono">
                        {[0.25, 0.5, 1.0, 1.5, 2.0].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => onChangeVideoState({ playbackRate: speed })}
                            className={`py-1.5 text-center text-[10px] rounded-lg transition-all ${
                              (videoState.playbackRate || 1.0) === speed
                                ? 'bg-gradient-to-r from-[#e25c24] to-[#f98435] text-white font-bold shadow-md shadow-[#e25c24]/20'
                                : 'bg-[#1c1c1f] border border-[#2e2e33] text-gray-400 hover:text-white'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Image Preset Filters quick select */
                    <div className="bg-[#17171a]/55 border border-[#222226] rounded-2xl p-3.5 space-y-2">
                      <label className="text-[11px] text-[#f98435] font-mono font-bold uppercase tracking-wider block">Quick Presets</label>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                        {[
                          { name: 'Original', vals: { contrast: 0, brightness: 0, hue: 0, saturation: 0, sharpen: 0, blur: 0, noiseReduction: 0, colorDepth: 'original', dither: 'none', redChannel: 0, greenChannel: 0, blueChannel: 0 } },
                          { name: 'Monochrome', vals: { contrast: 15, brightness: 5, hue: 0, saturation: -100, sharpen: 10, blur: 0, noiseReduction: 0, colorDepth: 'original', dither: 'none', redChannel: 0, greenChannel: 0, blueChannel: 0 } },
                          { name: 'Vintage Sepia', vals: { contrast: 10, brightness: -5, hue: 10, saturation: -25, sharpen: 5, blur: 0, noiseReduction: 0, colorDepth: 'original', dither: 'none', redChannel: 25, greenChannel: 10, blueChannel: -15 } },
                          { name: 'Warm Amber', vals: { contrast: 5, brightness: 0, hue: 0, saturation: 15, sharpen: 0, blur: 0, noiseReduction: 0, colorDepth: 'original', dither: 'none', redChannel: 20, greenChannel: 5, blueChannel: -10 } },
                          { name: 'Cool Cinematic', vals: { contrast: 15, brightness: -5, hue: 140, saturation: 30, sharpen: 15, blur: 0, noiseReduction: 0, colorDepth: 'original', dither: 'none', redChannel: -15, greenChannel: 10, blueChannel: 25 } },
                          { name: 'Emerald Aurora', vals: { contrast: 10, brightness: 5, hue: 60, saturation: 20, sharpen: 5, blur: 0, noiseReduction: 0, colorDepth: 'original', dither: 'none', redChannel: -15, greenChannel: 30, blueChannel: -10 } }
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => onChangeAdjustments(preset.vals as any)}
                            className="py-1 px-2.5 bg-[#1c1c1f] hover:bg-zinc-800 border border-[#2e2e33] rounded-xl hover:border-[#e25c24] text-gray-300 hover:text-white transition-all text-[10px] font-semibold truncate"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Depth / Upgrades */}
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 font-mono">Target Bit Depth</label>
                      <select
                        value={adjustments.colorDepth}
                        onChange={(e) => onChangeAdjustments({ colorDepth: e.target.value as any })}
                        className="w-full bg-[#1c1c1f] border border-[#2e2e33] text-gray-200 text-xs px-2.5 py-1.5 rounded-xl focus:border-[#e25c24] focus:outline-none font-mono"
                      >
                        <option value="original">Original (24-bit TrueColor)</option>
                        <option value="16bit">16-bit HighColor (RGB 565)</option>
                        <option value="8bit">8-bit WebColor (RGB 332)</option>
                        <option value="4bit">4-bit LowColor (16 colors)</option>
                        <option value="2bit">2-bit GameBoy (4 colors)</option>
                        <option value="1bit">1-bit Monochrome (2 colors)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 font-mono">Dithering Pattern</label>
                      <select
                        value={adjustments.dither}
                        onChange={(e) => onChangeAdjustments({ dither: e.target.value as any })}
                        className="w-full bg-[#1c1c1f] border border-[#2e2e33] text-gray-200 text-xs px-2.5 py-1.5 rounded-xl focus:border-[#e25c24] focus:outline-none font-mono"
                      >
                        <option value="none">No Dither (Quantize Only)</option>
                        <option value="floyd-steinberg">Floyd-Steinberg (Diffusion)</option>
                        <option value="ordered">Ordered Bayer Matrix (Dither)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Column 2: Color & Lighting Sliders */}
                <div className="space-y-3.5">
                  <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-[#f98435] uppercase tracking-widest border-b border-[#222226] pb-1">
                    <Sliders className="w-3 h-3" />
                    <span>Color & Lighting</span>
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-xs text-gray-400">
                      <span>Contrast</span>
                      <span className="text-white font-medium">{adjustments.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={adjustments.contrast}
                      onChange={(e) => onChangeAdjustments({ contrast: parseInt(e.target.value) })}
                      className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                    />
                  </div>

                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-xs text-gray-400">
                      <span>Brightness</span>
                      <span className="text-white font-medium">{adjustments.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={adjustments.brightness}
                      onChange={(e) => onChangeAdjustments({ brightness: parseInt(e.target.value) })}
                      className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                    />
                  </div>

                  {/* Hue */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-xs text-gray-400">
                      <span>Hue Rotation</span>
                      <span className="text-white font-medium">{adjustments.hue}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={adjustments.hue}
                      onChange={(e) => onChangeAdjustments({ hue: parseInt(e.target.value) })}
                      className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-xs text-gray-400">
                      <span>Saturation</span>
                      <span className="text-white font-medium">{adjustments.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={adjustments.saturation}
                      onChange={(e) => onChangeAdjustments({ saturation: parseInt(e.target.value) })}
                      className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                    />
                  </div>

                  {/* RGB Color Balance Section */}
                  <div className="pt-2 border-t border-[#222226]/50 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                      Color Channel Gains
                    </span>
                    
                    {/* Red Gain */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-red-400">
                        <span>Red Channel Gain</span>
                        <span className="font-medium">{(adjustments.redChannel ?? 0) > 0 ? '+' : ''}{adjustments.redChannel ?? 0}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustments.redChannel ?? 0}
                        onChange={(e) => onChangeAdjustments({ redChannel: parseInt(e.target.value) })}
                        className="w-full accent-red-500 bg-zinc-800 h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* Green Gain */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-emerald-400">
                        <span>Green Channel Gain</span>
                        <span className="font-medium">{(adjustments.greenChannel ?? 0) > 0 ? '+' : ''}{adjustments.greenChannel ?? 0}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustments.greenChannel ?? 0}
                        onChange={(e) => onChangeAdjustments({ greenChannel: parseInt(e.target.value) })}
                        className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* Blue Gain */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-cyan-400">
                        <span>Blue Channel Gain</span>
                        <span className="font-medium">{(adjustments.blueChannel ?? 0) > 0 ? '+' : ''}{adjustments.blueChannel ?? 0}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustments.blueChannel ?? 0}
                        onChange={(e) => onChangeAdjustments({ blueChannel: parseInt(e.target.value) })}
                        className="w-full accent-cyan-500 bg-zinc-800 h-1 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Gamma & Inversion */}
                  <div className="pt-2 border-t border-[#222226]/50 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                      Exotic Luminance & Palette
                    </span>

                    {/* Gamma Correction */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-orange-400">
                        <span>Gamma Curvature</span>
                        <span className="font-medium">{(adjustments.gamma / 100).toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="300"
                        value={adjustments.gamma}
                        onChange={(e) => onChangeAdjustments({ gamma: parseInt(e.target.value) })}
                        className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* Invert Colors Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-semibold">Invert Color Palette</span>
                      <button
                        onClick={() => onChangeAdjustments({ invert: !adjustments.invert })}
                        className={`w-8 h-4 rounded-full transition-colors relative ${
                          adjustments.invert ? 'bg-[#e25c24]' : 'bg-zinc-800'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                          adjustments.invert ? 'left-4.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 3: Restoration & Detail */}
                <div className="space-y-3.5">
                  <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-[#f98435] uppercase tracking-widest border-b border-[#222226] pb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Restoration & Detail</span>
                  </div>

                  {/* Sharpen */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-xs text-gray-400">
                      <span>Sharpen Details</span>
                      <span className="text-white font-medium">{adjustments.sharpen}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adjustments.sharpen}
                      onChange={(e) => onChangeAdjustments({ sharpen: parseInt(e.target.value) })}
                      className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                    />
                  </div>

                  {/* Noise Reduction (Median Blur) */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-xs text-gray-400">
                      <span>Noise Reduction (Median)</span>
                      <span className="text-white font-medium">Radius {adjustments.noiseReduction}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={adjustments.noiseReduction}
                      onChange={(e) => onChangeAdjustments({ noiseReduction: parseInt(e.target.value) })}
                      className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                    />
                  </div>

                  {/* Box Blur Radius */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-xs text-gray-400">
                      <span>Box Blur Radius</span>
                      <span className="text-white font-medium">{adjustments.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={adjustments.blur}
                      onChange={(e) => onChangeAdjustments({ blur: parseInt(e.target.value) })}
                      className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                    />
                  </div>

                  {/* Aesthetic FX & Stylization */}
                  <div className="pt-2 border-t border-[#222226]/50 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                      Aesthetic FX & Stylization
                    </span>

                    {/* Vignette */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-orange-400">
                        <span>Vignette Falloff</span>
                        <span className="font-medium">{adjustments.vignette}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={adjustments.vignette}
                        onChange={(e) => onChangeAdjustments({ vignette: parseInt(e.target.value) })}
                        className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* Pixelate */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-orange-400">
                        <span>Pixelate / Mosaic</span>
                        <span className="font-medium">
                          {adjustments.pixelate <= 1 ? 'Off' : `${adjustments.pixelate}px`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={adjustments.pixelate}
                        onChange={(e) => onChangeAdjustments({ pixelate: parseInt(e.target.value) })}
                        className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* Active Tab: Resolution Scaling */}
            {activeTab === 'scale' && (
              <motion.div
                key="scale"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pb-4"
              >
                {fileType === 'video' && videoState && onChangeVideoState ? (
                  <>
                    {/* Left Column: Info card and general upscale settings */}
                    <div className="space-y-3">
                      <div className="bg-[#17171a] border border-[#e25c24]/20 rounded-2xl p-4 space-y-2.5 relative overflow-hidden shadow-md">
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#e25c24] via-[#f98435] to-[#e25c24]" />
                        <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wide flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#f98435]" />
                          <span>Video Quality Upgrade</span>
                        </h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          Scale video frame grids, recover detail, and apply temporal filters to upgrade resolution.
                        </p>
                      </div>

                      <div className="space-y-3 bg-[#17171a]/40 border border-[#222226] rounded-2xl p-4">
                        <div className="text-[11px] font-mono font-bold text-gray-300">
                          1. Super Resolution Grid
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-mono">Upscale Multiplier</label>
                          <div className="grid grid-cols-4 gap-1.5 font-mono">
                            {[1.0, 1.5, 2.0, 4.0].map((f) => (
                              <button
                                key={f}
                                onClick={() => onChangeVideoState({ upscaleFactor: f })}
                                className={`py-1 text-center text-xs rounded-lg transition-all ${
                                  (videoState.upscaleFactor || 1.0) === f
                                    ? 'bg-gradient-to-r from-[#e25c24] to-[#f98435] text-white font-bold shadow-md shadow-[#e25c24]/10'
                                    : 'bg-[#1c1c1f] border border-[#2e2e33] text-gray-400 hover:text-white'
                                }`}
                              >
                                {f === 1.0 ? 'Off' : `${f}x`}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-mono">Interpolation Method</label>
                          <select
                            value={videoState.upscaleMethod || 'bilinear'}
                            onChange={(e) => onChangeVideoState({ upscaleMethod: e.target.value as any })}
                            className="w-full bg-[#1c1c1f] border border-[#2e2e33] text-gray-200 text-xs px-2.5 py-1.5 rounded-xl focus:border-[#e25c24] focus:outline-none font-mono"
                          >
                            <option value="nearest">Nearest Neighbor (Crisp Pixels)</option>
                            <option value="bilinear">Bilinear (Smooth Anti-Aliasing)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Frame Quality Tuner sliders */}
                    <div className="space-y-3 bg-[#17171a]/40 border border-[#222226] rounded-2xl p-4">
                      <div className="text-xs font-mono font-bold text-gray-300">
                        2. Frame Quality Tuner
                      </div>

                      {/* Super Sharpening */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-gray-400">
                          <span>Super Sharpen:</span>
                          <span className="text-[#f98435] font-semibold">{videoState.enhanceSharpen || 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={videoState.enhanceSharpen || 0}
                          onChange={(e) => onChangeVideoState({ enhanceSharpen: parseInt(e.target.value) })}
                          className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                        />
                      </div>

                      {/* Temporal Denoise */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-gray-400">
                          <span>Temporal Denoise (Grain):</span>
                          <span className="text-[#f98435] font-semibold">{videoState.enhanceDenoise || 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={videoState.enhanceDenoise || 0}
                          onChange={(e) => onChangeVideoState({ enhanceDenoise: parseInt(e.target.value) })}
                          className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                        />
                      </div>

                      {/* HBR Contrast Enhancer Toggle */}
                      <label className="flex items-center justify-between p-2 rounded-xl bg-[#121214] border border-[#222226] cursor-pointer hover:border-zinc-700 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-gray-300">HBR Color & Contrast</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={videoState.enhanceContrast || false}
                          onChange={(e) => onChangeVideoState({ enhanceContrast: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-700 text-[#e25c24] focus:ring-[#e25c24] bg-zinc-900"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left Column: Image scaling algorithm select */}
                    <div className="space-y-3">
                      <div className="bg-[#17171a] border border-[#222226] rounded-2xl p-4 space-y-2">
                        <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wide">
                          Manual Resolution Scaling
                        </h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          Rescales the underlying pixel buffer directly. Nearest-Neighbor maintains crisp pixel perfection, while Bilinear averages values.
                        </p>
                      </div>

                      <div className="space-y-1.5 bg-[#17171a]/30 border border-[#222226]/50 rounded-2xl p-3">
                        <label className="text-xs text-gray-400 font-mono">Interpolation Algorithm</label>
                        <select
                          value={scaleSettings.interpolation}
                          onChange={(e) => onChangeScaleSettings({ interpolation: e.target.value as any })}
                          className="w-full bg-[#1c1c1f] border border-[#2e2e33] text-gray-200 text-xs px-2.5 py-1.5 rounded-xl focus:border-[#e25c24] focus:outline-none font-mono"
                        >
                          <option value="nearest">Nearest Neighbor (Crisp Pixels)</option>
                          <option value="bilinear">Bilinear (Smooth Anti-Aliasing)</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column: Image scale multiplier and action */}
                    <div className="space-y-3 bg-[#17171a]/40 border border-[#222226] rounded-2xl p-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 font-mono block">Scale Multiplier</label>
                        <div className="grid grid-cols-5 gap-1 font-mono">
                          {[0.25, 0.5, 1.0, 2.0, 4.0].map((f) => (
                            <button
                              key={f}
                              onClick={() => onChangeScaleSettings({ factor: f })}
                              className={`py-1.5 text-center text-xs rounded-lg transition-colors ${
                                scaleSettings.factor === f
                                  ? 'bg-[#e25c24] text-white font-bold'
                                  : 'bg-[#1c1c1f] border border-[#2e2e33] text-gray-400 hover:text-white'
                              }`}
                            >
                              {f}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-gray-400">
                          <span>Fine Scale Factor:</span>
                          <span className="text-white font-medium">{Math.round(scaleSettings.factor * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="4.0"
                          step="0.05"
                          value={scaleSettings.factor}
                          onChange={(e) => onChangeScaleSettings({ factor: parseFloat(e.target.value) })}
                          className="w-full accent-[#e25c24] bg-zinc-800 h-1 rounded cursor-pointer"
                        />
                      </div>

                      <button
                        onClick={onApplyScale}
                        className="w-full bg-gradient-to-tr from-[#e25c24] to-[#f98435] hover:from-[#d24c14] hover:to-[#ea7425] text-white font-bold py-2.5 rounded-xl text-xs font-mono tracking-wide uppercase shadow-lg shadow-[#e25c24]/10 active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Apply Resolution Scale</span>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Active Tab: History (Video Pipeline) */}
            {activeTab === 'history' && fileType === 'video' && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-3.5 flex flex-col h-full pb-4"
              >
                <div className="flex items-center justify-between border-b border-[#222226]/50 pb-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Video Processing Pipeline & Status Diagnostics
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="bg-[#17171a] border border-[#222226] rounded-2xl p-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#f98435] uppercase tracking-wider block">Playback Metrics</span>
                    <div className="flex justify-between text-gray-400">
                      <span>Status:</span>
                      <span className={videoState?.playing ? "text-emerald-400 font-bold animate-pulse" : "text-amber-500"}>
                        {videoState?.playing ? "● PLAYING" : "■ PAUSED"}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Time:</span>
                      <span className="text-gray-200">
                        {videoState ? `${videoState.currentTime.toFixed(2)}s / ${videoState.duration.toFixed(2)}s` : '0s / 0s'}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Speed:</span>
                      <span className="text-[#f98435] font-semibold">{(videoState?.playbackRate || 1.0).toFixed(2)}x</span>
                    </div>
                  </div>

                  <div className="bg-[#17171a] border border-[#222226] rounded-2xl p-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#f98435] uppercase tracking-wider block">Super Resolution</span>
                    <div className="flex justify-between text-gray-400">
                      <span>Upscale Grid:</span>
                      <span className="text-gray-200 font-semibold">
                        {videoState?.upscaleFactor && videoState.upscaleFactor > 1.0 ? `${videoState.upscaleFactor}x` : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Algorithm:</span>
                      <span className="text-gray-200 capitalize">{videoState?.upscaleMethod || 'bilinear'}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>HBR Contrast:</span>
                      <span className={videoState?.enhanceContrast ? "text-emerald-400" : "text-gray-500"}>
                        {videoState?.enhanceContrast ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#17171a] border border-[#222226] rounded-2xl p-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#f98435] uppercase tracking-wider block">Frame Enhancer Status</span>
                    <div className="flex justify-between text-gray-400">
                      <span>Boost Sharpen:</span>
                      <span className="text-gray-200 font-semibold">{videoState?.enhanceSharpen || 0}%</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Boost Denoise:</span>
                      <span className="text-gray-200 font-semibold">{videoState?.enhanceDenoise || 0}%</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Pipeline Mode:</span>
                      <span className="text-emerald-400 font-bold">REAL-TIME</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-[#0e0e10]/80 rounded-2xl border border-[#222226] text-[10px] text-gray-400 font-mono leading-relaxed shadow-inner">
                  <span className="text-gray-200 font-semibold">Pipeline Note:</span> Video frame rendering uses high-performance hardware-accelerated loops. In-flight canvas adjustments and resolution scaling are processed frame-by-frame non-destructively. Adjust slider gains in real-time to preview dynamic color calibration.
                </div>
              </motion.div>
            )}

            {/* Active Tab: History (Image Filmstrip) */}
            {activeTab === 'history' && fileType !== 'video' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-2.5 flex flex-col h-full pb-4"
              >
                <div className="flex items-center justify-between border-b border-[#222226]/50 pb-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Base Image History Stack (Film Strip View)
                  </span>
                </div>

                <div className="flex items-center space-x-3 overflow-x-auto pb-2 pt-1 px-0.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {historyStack.map((item, index) => {
                    const isActive = index === currentHistoryIndex;
                    const isFuture = index > currentHistoryIndex;
                    
                    return (
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={item.id}
                        onClick={() => onJumpToHistory(index)}
                        className={`flex-shrink-0 w-44 p-2.5 rounded-2xl border transition-all flex flex-col space-y-2 text-left group text-xs ${
                          isActive
                            ? 'bg-[#2a2a2f]/75 border-[#e25c24] text-white shadow-md ring-1 ring-[#e25c24]/30'
                            : isFuture
                            ? 'bg-[#151518]/25 border-transparent text-zinc-600 hover:text-zinc-500 hover:bg-[#151518]/40'
                            : 'bg-[#18181b]/70 border-[#222226] text-gray-300 hover:bg-[#202024] hover:text-white'
                        }`}
                      >
                        {/* History point thumbnail */}
                        <div className="w-full h-14 rounded-xl border border-zinc-800 bg-[#0e0e10] flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                          {item.imageDataURL ? (
                            <img
                              src={item.imageDataURL}
                              alt="thumb"
                              referrerPolicy="no-referrer"
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <Image className="w-4 h-4 opacity-20" />
                          )}
                          {isActive && (
                            <span className="absolute bottom-1 right-1 text-[8px] text-[#f98435] font-bold bg-[#121214] px-1.5 py-0.5 rounded-md border border-[#e25c24]/30">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="font-mono truncate font-semibold text-[11px]">
                            {item.name}
                          </div>
                          <div className="text-[9px] text-zinc-500 font-mono mt-0.5 flex justify-between">
                            <span>{item.width} × {item.height}</span>
                            <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}
