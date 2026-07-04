import React, { useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Scissors,
  Download,
  Film
} from 'lucide-react';
import { VideoState } from '../types';

interface VideoTimelineProps {
  videoState: VideoState;
  onChangeVideoState: (state: Partial<VideoState>) => void;
  onStepFrame: (dir: 'forward' | 'backward') => void;
  onExportVideo: () => void;
  isRecording: boolean;
  recordingProgress: number; // 0 to 100
}

export default function VideoTimeline({
  videoState,
  onChangeVideoState,
  onStepFrame,
  onExportVideo,
  isRecording,
  recordingProgress,
}: VideoTimelineProps) {
  const { playing, currentTime, duration, startTime, endTime } = videoState;

  // Formatting time into mm:ss.cc (minutes, seconds, centiseconds)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00.00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const c = Math.floor((time % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${c.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    onChangeVideoState({ playing: !playing });
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChangeVideoState({ currentTime: val });
  };

  const handleStartTrimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(parseFloat(e.target.value), endTime - 0.2);
    onChangeVideoState({ startTime: val });
    if (currentTime < val) {
      onChangeVideoState({ currentTime: val });
    }
  };

  const handleEndTrimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(parseFloat(e.target.value), startTime + 0.2);
    onChangeVideoState({ endTime: val });
    if (currentTime > val) {
      onChangeVideoState({ currentTime: val });
    }
  };

  // Safe division guard
  const getPercentage = (value: number) => {
    if (!duration) return 0;
    return (value / duration) * 100;
  };

  return (
    <footer className="bg-[#111113]/95 backdrop-blur-xl border-t border-[#222226] text-gray-200 p-4.5 select-none relative z-40 font-sans rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Timeline representation (Track + Scrubbers) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 px-1">
            <span>Trim In: <strong className="text-gray-300">{formatTime(startTime)}</strong></span>
            <span>Current Playhead: <strong className="text-[#f98435]">{formatTime(currentTime)}</strong></span>
            <span>Trim Out: <strong className="text-gray-300">{formatTime(endTime)}</strong></span>
          </div>

          <div className="relative h-7 flex items-center">
            {/* Visual background track representing trim area */}
            <div className="absolute inset-x-0 h-2 bg-[#1f1f23] rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-[#e25c24]/20 border-l border-r border-[#e25c24]/40"
                style={{
                  left: `${getPercentage(startTime)}%`,
                  width: `${getPercentage(endTime - startTime)}%`
                }}
              />
            </div>

            {/* Playhead Indicator bar */}
            <div 
              className="absolute w-0.5 h-6 bg-[#f98435] pointer-events-none z-20"
              style={{ left: `${getPercentage(currentTime)}%` }}
            >
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#f98435] rounded-full border border-black shadow" />
            </div>

            {/* Hidden native inputs overlaying the timeline for double-slider trim + playhead scrubbing */}
            <div className="absolute inset-x-0 w-full h-full flex items-center z-10 pointer-events-none">
              {/* Scrubbing Playhead Slider */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.01}
                value={currentTime}
                onChange={handleScrub}
                className="absolute w-full h-2 opacity-0 cursor-pointer pointer-events-auto"
                title="Playhead Location"
              />
            </div>
          </div>

          {/* Precision Trim Sliders */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                <span>Start Trim Marker (In Point)</span>
                <span>{Math.round(getPercentage(startTime))}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.05}
                value={startTime}
                onChange={handleStartTrimChange}
                className="w-full accent-orange-500 bg-zinc-800 h-1 rounded cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                <span>End Trim Marker (Out Point)</span>
                <span>{Math.round(getPercentage(endTime))}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.05}
                value={endTime}
                onChange={handleEndTrimChange}
                className="w-full accent-orange-500 bg-zinc-800 h-1 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Video Control Center */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#1a1a1c]">
          
          {/* Playback step-buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onChangeVideoState({ currentTime: startTime })}
              className="p-2 rounded-xl hover:bg-[#1a1a1c] text-gray-400 hover:text-white transition-all"
              title="Return to Trim Start"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => onStepFrame('backward')}
              className="p-2 rounded-xl hover:bg-[#1a1a1c] text-gray-400 hover:text-white transition-all"
              title="Previous Frame (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#e25c24] to-[#f98435] hover:from-[#f98435] hover:to-[#ff945b] text-white flex items-center justify-center shadow-lg shadow-[#e25c24]/25 transition-all duration-150 active:scale-95"
              title={playing ? 'Pause Spacebar' : 'Play Spacebar'}
            >
              {playing ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current translate-x-0.5" />}
            </button>

            <button
              onClick={() => onStepFrame('forward')}
              className="p-2 rounded-xl hover:bg-[#1a1a1c] text-gray-400 hover:text-white transition-all"
              title="Next Frame (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Timing indicators */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="bg-[#17171a] border border-[#222226] px-3.5 py-1.5 rounded-xl flex items-center space-x-2 text-gray-300 shadow-inner">
              <Film className="w-3.5 h-3.5 text-orange-400" />
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="text-gray-500 hidden md:block">
              Trimmed Duration: <strong className="text-emerald-400">{formatTime(endTime - startTime)}</strong>
            </div>
          </div>

          {/* Export video with recording visual overlay */}
          <div>
            {isRecording ? (
              <div className="flex items-center space-x-3 bg-red-950/40 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="font-mono text-red-200">Processing Render: {recordingProgress}%</span>
              </div>
            ) : (
              <button
                onClick={onExportVideo}
                className="bg-[#1c1c1f] hover:bg-zinc-800 border border-[#2e2e33] text-gray-200 font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-2 transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
                title="Saves video with active filters applied locally"
              >
                <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                <span>Render & Export Trimmed Clip</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </footer>
  );
}
