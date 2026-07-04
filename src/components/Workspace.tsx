import React, { useRef, useEffect, useState } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Crop, 
  Stamp, 
  Sparkles, 
  Move,
  Check,
  X,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Activity,
  Columns,
  Grid,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolType, CloneStampSettings, FilterAdjustments, VideoState } from '../types';
import { 
  applyAdjustments, 
  applyBoxBlur, 
  applySharpen, 
  applyMedianFilter, 
  applyColorDepth,
  applyHealBrush
} from '../utils/imageFilters';

interface WorkspaceProps {
  activeTool: ToolType;
  adjustments: FilterAdjustments;
  cloneSettings: CloneStampSettings;
  onChangeCloneSettings: (settings: Partial<CloneStampSettings>) => void;
  videoState: VideoState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  baseCanvasRef: React.RefObject<HTMLCanvasElement | null>; // Source image buffer
  onCommitCrop: (cropBox: { x: number; y: number; w: number; h: number }) => void;
  onModifyBaseImage: (actionName: string) => void;
  onColorPick: (gains: { r: number; g: number; b: number }) => void;
  zoom: number;
  setZoom: (z: number) => void;
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number }) => void;
  imageDimensions: { width: number; height: number } | null;
  setImageDimensions: (dims: { width: number; height: number }) => void;
  fileName?: string;
  videoCrop?: { x: number; y: number; w: number; h: number } | null;
}

export default function Workspace({
  activeTool,
  adjustments,
  cloneSettings,
  onChangeCloneSettings,
  videoState,
  videoRef,
  baseCanvasRef,
  onCommitCrop,
  onModifyBaseImage,
  onColorPick,
  zoom,
  setZoom,
  pan,
  setPan,
  imageDimensions,
  setImageDimensions,
  fileName,
  videoCrop,
}: WorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null); // Screen filtered render
  
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Screen coords
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastDrawPoint, setLastDrawPoint] = useState<{ x: number; y: number } | null>(null);
  const [strokeStartSourcePoint, setStrokeStartSourcePoint] = useState<{ x: number; y: number } | null>(null);

  // Live Compare States
  const [isComparing, setIsComparing] = useState(false);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isPressingCompare, setIsPressingCompare] = useState(false);

  const [isChangesTrackerCollapsed, setIsChangesTrackerCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Keep track of the last loaded file name to fit only on new selection
  const lastFileRef = useRef<string | null>(null);

  // Grid Overlay States
  const [showGridSettings, setShowGridSettings] = useState(false);
  const [gridSettings, setGridSettings] = useState({
    type: 'none' as 'none' | 'thirds' | 'custom' | 'pixels',
    spacing: 50, // default custom spacing (in image pixels)
    opacity: 0.4,
    color: '#ffffff',
    showPixelBoundary: true,
  });

  // Helper to extract non-default, currently active modifications
  const getActiveChanges = () => {
    const list: { key: string; label: string; value: string; color: string }[] = [];
    
    if (adjustments.brightness !== 0) {
      list.push({ key: 'brightness', label: 'Brightness', value: `${adjustments.brightness > 0 ? '+' : ''}${adjustments.brightness}%`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' });
    }
    if (adjustments.contrast !== 0) {
      list.push({ key: 'contrast', label: 'Contrast', value: `${adjustments.contrast > 0 ? '+' : ''}${adjustments.contrast}%`, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' });
    }
    if (adjustments.saturation !== 0) {
      list.push({ key: 'saturation', label: 'Saturation', value: `${adjustments.saturation > 0 ? '+' : ''}${adjustments.saturation}%`, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' });
    }
    if (adjustments.hue !== 0) {
      list.push({ key: 'hue', label: 'Hue Rotate', value: `${adjustments.hue > 0 ? '+' : ''}${adjustments.hue}°`, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' });
    }
    if (adjustments.sharpen > 0) {
      list.push({ key: 'sharpen', label: 'Detail Sharpen', value: `+${adjustments.sharpen}%`, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' });
    }
    if (adjustments.noiseReduction > 0) {
      list.push({ key: 'noiseReduction', label: 'Median Denoise', value: `+${adjustments.noiseReduction}%`, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' });
    }
    if (adjustments.blur > 0) {
      list.push({ key: 'blur', label: 'Box Blur', value: `+${adjustments.blur}px`, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' });
    }
    if (adjustments.colorDepth !== 'original') {
      list.push({ key: 'colorDepth', label: 'Color Bit Depth', value: adjustments.colorDepth, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' });
    }
    if (adjustments.dither !== 'none') {
      list.push({ key: 'dither', label: 'Dithering Pattern', value: adjustments.dither, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' });
    }
    if (adjustments.redChannel !== 0 || adjustments.greenChannel !== 0 || adjustments.blueChannel !== 0) {
      list.push({ 
        key: 'rgbChannel', 
        label: 'RGB Gains', 
        value: `R:${adjustments.redChannel > 0 ? '+' : ''}${adjustments.redChannel} G:${adjustments.greenChannel > 0 ? '+' : ''}${adjustments.greenChannel} B:${adjustments.blueChannel > 0 ? '+' : ''}${adjustments.blueChannel}`, 
        color: 'text-red-400 bg-red-500/10 border-red-500/20' 
      });
    }
    if (adjustments.gamma !== 100) {
      list.push({
        key: 'gamma',
        label: 'Gamma Curvature',
        value: `${(adjustments.gamma / 100).toFixed(2)}x`,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      });
    }
    if (adjustments.vignette > 0) {
      list.push({
        key: 'vignette',
        label: 'Vignette Falloff',
        value: `${adjustments.vignette}%`,
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
      });
    }
    if (adjustments.pixelate > 0) {
      list.push({
        key: 'pixelate',
        label: 'Pixelate Mosaic',
        value: `${adjustments.pixelate}px`,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      });
    }
    if (adjustments.invert) {
      list.push({
        key: 'invert',
        label: 'Invert Palette',
        value: 'Enabled',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      });
    }

    // Video enhancements
    if (videoState?.upscaleFactor && videoState.upscaleFactor > 1.0) {
      list.push({ key: 'upscale', label: 'Super Resolution', value: `${videoState.upscaleFactor.toFixed(1)}x`, color: 'text-red-400 bg-red-500/10 border-red-500/20' });
    }
    if (videoState?.enhanceContrast) {
      list.push({ key: 'enhanceContrast', label: 'HBR Contrast', value: 'Enabled', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' });
    }
    if (videoState?.enhanceSharpen && videoState.enhanceSharpen > 0) {
      list.push({ key: 'enhanceSharpen', label: 'Boost Sharpen', value: `+${videoState.enhanceSharpen}%`, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' });
    }
    if (videoState?.enhanceDenoise && videoState.enhanceDenoise > 0) {
      list.push({ key: 'enhanceDenoise', label: 'Boost Denoise', value: `+${videoState.enhanceDenoise}%`, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' });
    }

    return list;
  };

  // Crop State
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 }); // Percentages of canvas
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<string>('free');

  const setCropAspectRatio = (ratioStr: string) => {
    setSelectedRatio(ratioStr);

    if (ratioStr === 'free') return;
    if (!imageDimensions) return;

    const [wRatio, hRatio] = ratioStr.split(':').map(Number);
    const R = wRatio / hRatio; // Target ratio (W/H)
    const imgW = imageDimensions.width;
    const imgH = imageDimensions.height;

    const K = R * (imgH / imgW); // Ratio of percentage widths (w_pct / h_pct)

    let w, h;
    if (K <= 1) {
      h = 80;
      w = 80 * K;
    } else {
      w = 80;
      h = 80 / K;
    }

    const x = (100 - w) / 2;
    const y = (100 - h) / 2;

    setCropBox({ x, y, w, h });
  };

  // Listen to mouse position globally for smooth document-wide dragging
  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - startPan.x;
        const dy = e.clientY - startPan.y;
        setPan({ x: pan.x + dx, y: pan.y + dy });
        setStartPan({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUpGlobal = () => {
      setIsPanning(false);
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isPanning, startPan, pan, setPan]);

  // Convert screen coordinate to base canvas image coordinate
  const screenToImageCoords = (screenX: number, screenY: number) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const xOnCanvas = screenX - rect.left;
    const yOnCanvas = screenY - rect.top;

    // Scale to base image coordinates based on displayed resolution vs natural resolution
    const x = Math.round((xOnCanvas / rect.width) * canvas.width);
    const y = Math.round((yOnCanvas / rect.height) * canvas.height);

    return { x, y };
  };

  // Render the current baseCanvas state + apply live adjustments -> displayCanvas
  const renderDisplay = () => {
    const baseCanvas = baseCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    if (!baseCanvas || !displayCanvas) return;

    const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true });
    const displayCtx = displayCanvas.getContext('2d');
    if (!baseCtx || !displayCtx) return;

    const w = baseCanvas.width;
    const h = baseCanvas.height;

    // Match dimensions
    if (displayCanvas.width !== w || displayCanvas.height !== h) {
      displayCanvas.width = w;
      displayCanvas.height = h;
    }

    // Get base pixels
    let srcData: ImageData;
    try {
      srcData = baseCtx.getImageData(0, 0, w, h);
    } catch (e) {
      // Handle security or initialization exceptions
      return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // We can chain filters sequentially to displayCtx
    // 1. Color/Brightness/Contrast/Channels
    let adjustedData = tempCtx.createImageData(w, h);
    const extraContrast = videoState?.enhanceContrast ? 18 : 0;
    const finalContrast = Math.min(100, Math.max(-100, adjustments.contrast + extraContrast));

    applyAdjustments(
      srcData,
      adjustedData,
      adjustments.brightness,
      finalContrast,
      adjustments.hue,
      adjustments.saturation,
      adjustments.redChannel,
      adjustments.greenChannel,
      adjustments.blueChannel,
      adjustments.gamma,
      adjustments.vignette,
      adjustments.pixelate,
      adjustments.invert
    );

    // 2. Sharpen Detail
    let sharpenedData = tempCtx.createImageData(w, h);
    const totalSharpen = Math.min(100, adjustments.sharpen + (videoState?.enhanceSharpen || 0));
    if (totalSharpen > 0) {
      applySharpen(adjustedData, sharpenedData, totalSharpen);
    } else {
      sharpenedData.data.set(adjustedData.data);
    }

    // 3. Noise Reduction (Median)
    let denoisedData = tempCtx.createImageData(w, h);
    const totalDenoise = Math.min(100, adjustments.noiseReduction + (videoState?.enhanceDenoise || 0));
    if (totalDenoise > 0) {
      applyMedianFilter(sharpenedData, denoisedData, totalDenoise);
    } else {
      denoisedData.data.set(sharpenedData.data);
    }

    // 4. Box Blur
    let blurredData = tempCtx.createImageData(w, h);
    if (adjustments.blur > 0) {
      applyBoxBlur(denoisedData, blurredData, adjustments.blur);
    } else {
      blurredData.data.set(denoisedData.data);
    }

    // 5. Color Depth & Dithering
    let finalData = tempCtx.createImageData(w, h);
    if (adjustments.colorDepth !== 'original') {
      applyColorDepth(blurredData, finalData, adjustments.colorDepth, adjustments.dither);
    } else {
      finalData.data.set(blurredData.data);
    }

    // Draw final adjusted pixels onto display canvas
    if (isPressingCompare) {
      displayCtx.putImageData(srcData, 0, 0);
    } else if (isComparing) {
      const splitCol = Math.round(w * splitRatio);
      const combinedData = displayCtx.createImageData(w, h);
      const srcBytes = srcData.data;
      const finalBytes = finalData.data;
      const combinedBytes = combinedData.data;
      
      for (let y = 0; y < h; y++) {
        const rowOffset = y * w * 4;
        for (let x = 0; x < w; x++) {
          const idx = rowOffset + x * 4;
          if (x < splitCol) {
            combinedBytes[idx] = srcBytes[idx];
            combinedBytes[idx+1] = srcBytes[idx+1];
            combinedBytes[idx+2] = srcBytes[idx+2];
            combinedBytes[idx+3] = srcBytes[idx+3];
          } else {
            combinedBytes[idx] = finalBytes[idx];
            combinedBytes[idx+1] = finalBytes[idx+1];
            combinedBytes[idx+2] = finalBytes[idx+2];
            combinedBytes[idx+3] = finalBytes[idx+3];
          }
        }
      }
      displayCtx.putImageData(combinedData, 0, 0);

      // Draw a sleek vertical divider line representing the comparison split
      displayCtx.strokeStyle = '#f98435';
      displayCtx.lineWidth = Math.max(2, Math.round(2 / zoom));
      displayCtx.beginPath();
      displayCtx.moveTo(splitCol, 0);
      displayCtx.lineTo(splitCol, h);
      displayCtx.stroke();
    } else {
      displayCtx.putImageData(finalData, 0, 0);
    }
  };

  // Run render display when adjustments change, video quality boosts change, or base canvas is painted
  useEffect(() => {
    renderDisplay();
  }, [
    adjustments, 
    imageDimensions, 
    videoState?.enhanceContrast, 
    videoState?.enhanceSharpen, 
    videoState?.enhanceDenoise,
    isComparing,
    splitRatio,
    isPressingCompare,
    zoom
  ]);

  // Handle continuous video frame drawing when video is active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animFrameId: number;

    const updateFrame = () => {
      const baseCanvas = baseCanvasRef.current;
      if (baseCanvas && video && !video.paused) {
        const baseCtx = baseCanvas.getContext('2d')!;
        
        const upscale = videoState.upscaleFactor || 1.0;
        let targetW = Math.round(video.videoWidth * upscale);
        let targetH = Math.round(video.videoHeight * upscale);

        if (videoCrop) {
          targetW = videoCrop.w;
          targetH = videoCrop.h;
        }

        // Make sure base canvas matches video sizing
        if (baseCanvas.width !== targetW || baseCanvas.height !== targetH) {
          baseCanvas.width = targetW;
          baseCanvas.height = targetH;
          setImageDimensions({ width: targetW, height: targetH });
        }
        
        baseCtx.clearRect(0, 0, targetW, targetH);
        baseCtx.imageSmoothingEnabled = (videoState.upscaleMethod !== 'nearest');
        baseCtx.imageSmoothingQuality = 'high';
        
        if (videoCrop) {
          const sx = videoCrop.x / upscale;
          const sy = videoCrop.y / upscale;
          const sw = videoCrop.w / upscale;
          const sh = videoCrop.h / upscale;
          baseCtx.drawImage(video, sx, sy, sw, sh, 0, 0, videoCrop.w, videoCrop.h);
        } else {
          baseCtx.drawImage(video, 0, 0, targetW, targetH);
        }
        renderDisplay();
      }
      animFrameId = requestAnimationFrame(updateFrame);
    };

    // Listen to manual timeline scrubs too
    const handleSeek = () => {
      const baseCanvas = baseCanvasRef.current;
      if (baseCanvas && video) {
        const baseCtx = baseCanvas.getContext('2d')!;
        
        const upscale = videoState.upscaleFactor || 1.0;
        let targetW = Math.round(video.videoWidth * upscale);
        let targetH = Math.round(video.videoHeight * upscale);

        if (videoCrop) {
          targetW = videoCrop.w;
          targetH = videoCrop.h;
        }

        if (baseCanvas.width !== targetW || baseCanvas.height !== targetH) {
          baseCanvas.width = targetW;
          baseCanvas.height = targetH;
          setImageDimensions({ width: targetW, height: targetH });
        }
        
        baseCtx.clearRect(0, 0, targetW, targetH);
        baseCtx.imageSmoothingEnabled = (videoState.upscaleMethod !== 'nearest');
        baseCtx.imageSmoothingQuality = 'high';
        
        if (videoCrop) {
          const sx = videoCrop.x / upscale;
          const sy = videoCrop.y / upscale;
          const sw = videoCrop.w / upscale;
          const sh = videoCrop.h / upscale;
          baseCtx.drawImage(video, sx, sy, sw, sh, 0, 0, videoCrop.w, videoCrop.h);
        } else {
          baseCtx.drawImage(video, 0, 0, targetW, targetH);
        }
        renderDisplay();
      }
    };

    video.addEventListener('seeked', handleSeek);
    video.addEventListener('timeupdate', handleSeek);

    if (videoState.playing) {
      animFrameId = requestAnimationFrame(updateFrame);
    } else {
      handleSeek(); // Update visual frame on load or pause
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      if (video) {
        video.removeEventListener('seeked', handleSeek);
        video.removeEventListener('timeupdate', handleSeek);
      }
    };
  }, [videoState.playing, videoState.upscaleFactor, videoState.upscaleMethod, adjustments, videoCrop]);

  // Center & Fit Canvas inside workspace initially
  const fitToScreen = () => {
    const container = containerRef.current;
    const canvas = displayCanvasRef.current;
    if (!container || !canvas) return;

    const scale = 0.41; // Scale should be at 41 percent
    setZoom(scale);
    setPan({
      x: (container.clientWidth - canvas.width * scale) / 2,
      y: (container.clientHeight - canvas.height * scale) / 2,
    });
  };

  // Reset Zoom back to 100% actual pixel size
  const resetZoom = () => {
    setZoom(1.0);
  };

  // Trigger Fit on first file load, on container resize when first mounting/animating, or whenever a new picture or video is selected
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imageDimensions) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          // If it's a newly selected file/video, or if it hasn't been fitted in the settled layout yet
          const currentFile = fileName || '';
          if (lastFileRef.current !== currentFile) {
            fitToScreen();
            lastFileRef.current = currentFile;
          }
        }
      }
    });

    resizeObserver.observe(container);

    // Initial backup trigger
    const timer = setTimeout(() => {
      const currentFile = fileName || '';
      if (lastFileRef.current !== currentFile) {
        fitToScreen();
        lastFileRef.current = currentFile;
      }
    }, 80);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [imageDimensions, fileName]);

  // Listen for special zoom value 0.99 which signals "Zoom to Fit" from parent controls
  useEffect(() => {
    if (zoom === 0.99 && imageDimensions) {
      fitToScreen();
    }
  }, [zoom, imageDimensions]);

  // Zoom on wheel scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.12;
    const container = containerRef.current;
    if (!container) return;

    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = Math.exp(wheel * zoomIntensity);

    const nextZoom = Math.min(Math.max(zoom * zoomFactor, 0.05), 16.0); // 5% to 1600%

    setZoom(nextZoom);
  };

  // Drawing brush-stroke interpolator (Bresenham / DDA step circle painting)
  const drawBrushStroke = (p1: { x: number; y: number }, p2: { x: number; y: number }, offset: { x: number; y: number }) => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext('2d')!;

    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.max(1, Math.floor(dist / (cloneSettings.brushSize / 15))); // Overlap spacing

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;

      const srcX = x + offset.x;
      const srcY = y + offset.y;

      if (activeTool === 'clone') {
        const radius = cloneSettings.brushSize / 2;
        const w = baseCanvas.width;
        const h = baseCanvas.height;

        // Bounding box of source in canvas space
        const sx = srcX - radius;
        const sy = srcY - radius;
        const sw = cloneSettings.brushSize;
        const sh = cloneSettings.brushSize;

        // Bounding box of destination in canvas space
        const dx = x - radius;
        const dy = y - radius;

        // Intersect source box with [0, 0, w, h]
        const clipX0 = Math.max(0, sx);
        const clipY0 = Math.max(0, sy);
        const clipX1 = Math.min(w, sx + sw);
        const clipY1 = Math.min(h, sy + sh);

        const clipW = clipX1 - clipX0;
        const clipH = clipY1 - clipY0;

        if (clipW > 0 && clipH > 0) {
          // Adjust destination box proportionally to match clipped source offset
          const shiftX = clipX0 - sx;
          const shiftY = clipY0 - sy;

          const targetX = dx + shiftX;
          const targetY = dy + shiftY;

          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = cloneSettings.brushStrength;
          ctx.drawImage(
            baseCanvas,
            clipX0,
            clipY0,
            clipW,
            clipH,
            targetX,
            targetY,
            clipW,
            clipH
          );
          ctx.restore();
        }
      } else if (activeTool === 'heal') {
        // Apply blended heal
        applyHealBrush(ctx, srcX, srcY, x, y, cloneSettings.brushSize / 2);
      }
    }
  };

  // Mouse Actions inside Canvas Viewport
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select' || e.button === 1 || e.shiftKey) {
      // Middle click, Hand tool or Shift drag starts panning - DISABLED
      return;
    }

    const coords = screenToImageCoords(e.clientX, e.clientY);
    if (!coords) return;

    // Alt-key down or Setting source flag active sets clone source coordinates
    if (cloneSettings.isSettingSource || e.altKey) {
      onChangeCloneSettings({
        sourcePoint: coords,
        isSettingSource: false,
      });
      onModifyBaseImage('Set Source Point');
      return;
    }

    if (activeTool === 'clone' || activeTool === 'heal') {
      if (!cloneSettings.sourcePoint) {
        // Prompt source selection if none is set
        onChangeCloneSettings({ isSettingSource: true });
        return;
      }

      setIsDrawing(true);
      setLastDrawPoint(coords);
      
      // Calculate constant painting stroke offset
      const dx = cloneSettings.sourcePoint.x - coords.x;
      const dy = cloneSettings.sourcePoint.y - coords.y;
      setStrokeStartSourcePoint({ x: dx, y: dy });

      // Draw initial single spot click
      drawBrushStroke(coords, coords, { x: dx, y: dy });
      renderDisplay();
    }

    if (activeTool === 'color_picker') {
      const baseCanvas = baseCanvasRef.current;
      if (!baseCanvas) return;
      const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true })!;
      
      try {
        const pixel = baseCtx.getImageData(coords.x, coords.y, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        // Gray target value (standard ITU luminance)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Channel offset multipliers to shift grey
        const rGain = Math.round(gray - r);
        const bgGain = Math.round(gray - g);
        const bGain = Math.round(gray - b);

        onColorPick({ r: rGain, g: bgGain, b: bGain });
      } catch (err) {
        console.error('Failed to sample pixel buffer', err);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Keep track of hover pointer location for visual brush helper
    setMousePos({ x: e.clientX, y: e.clientY });

    if (!isDrawing || !lastDrawPoint || !strokeStartSourcePoint) return;

    const coords = screenToImageCoords(e.clientX, e.clientY);
    if (!coords) return;

    // Paint seamless Bresenham segment
    drawBrushStroke(lastDrawPoint, coords, strokeStartSourcePoint);
    setLastDrawPoint(coords);
    
    // Also update current live clone point so the crosshair follows nicely!
    onChangeCloneSettings({
      sourcePoint: {
        x: coords.x + strokeStartSourcePoint.x,
        y: coords.y + strokeStartSourcePoint.y
      }
    });

    renderDisplay();
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastDrawPoint(null);
      setStrokeStartSourcePoint(null);
      onModifyBaseImage(activeTool === 'clone' ? 'Clone Stamp Stroke' : 'Healing Brush Stroke');
    }
  };

  // Crop Interactive Marquee Handles
  const handleCropHandleMouseDown = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHandle(handle);
    setStartPan({ x: e.clientX, y: e.clientY });
  };

  const handleCropContainerMouseMove = (e: React.MouseEvent) => {
    if (!activeHandle) return;
    if (!imageDimensions) return;

    const viewportW = imageDimensions.width * zoom;
    const viewportH = imageDimensions.height * zoom;

    if (viewportW === 0 || viewportH === 0) return;

    const dx = ((e.clientX - startPan.x) / viewportW) * 100;
    const dy = ((e.clientY - startPan.y) / viewportH) * 100;

    setStartPan({ x: e.clientX, y: e.clientY });

    setCropBox((prev) => {
      let { x, y, w, h } = prev;

      if (selectedRatio === 'free') {
        if (activeHandle.includes('e')) {
          w = Math.max(10, Math.min(100 - x, w + dx));
        }
        if (activeHandle.includes('w')) {
          const oldX = x;
          x = Math.max(0, Math.min(x + w - 10, x + dx));
          w = w - (x - oldX);
        }
        if (activeHandle.includes('s')) {
          h = Math.max(10, Math.min(100 - y, h + dy));
        }
        if (activeHandle.includes('n')) {
          const oldY = y;
          y = Math.max(0, Math.min(y + h - 10, y + dy));
          h = h - (y - oldY);
        }
        if (activeHandle === 'move') {
          x = Math.max(0, Math.min(100 - w, x + dx));
          y = Math.max(0, Math.min(100 - h, y + dy));
        }
        return { x, y, w, h };
      }

      // Enforced Aspect Ratio logic
      if (activeHandle === 'move') {
        x = Math.max(0, Math.min(100 - w, x + dx));
        y = Math.max(0, Math.min(100 - h, y + dy));
        return { x, y, w, h };
      }

      if (!imageDimensions) return prev;
      const [wRatio, hRatio] = selectedRatio.split(':').map(Number);
      const R = wRatio / hRatio;
      const imgW = imageDimensions.width;
      const imgH = imageDimensions.height;
      const K = R * (imgH / imgW); // w / h should be K

      if (activeHandle === 'se' || activeHandle === 'e' || activeHandle === 's') {
        let targetW = Math.max(10, Math.min(100 - x, w + dx));
        let targetH = targetW / K;
        if (y + targetH > 100) {
          targetH = 100 - y;
          targetW = targetH * K;
        }
        if (targetW < 10 || targetH < 10) return prev;
        w = targetW;
        h = targetH;
      } else if (activeHandle === 'nw' || activeHandle === 'n' || activeHandle === 'w') {
        const right = x + w;
        const bottom = y + h;
        let targetW = Math.max(10, Math.min(right, w - dx));
        let targetH = targetW / K;
        if (bottom - targetH < 0) {
          targetH = bottom;
          targetW = targetH * K;
        }
        if (targetW < 10 || targetH < 10) return prev;
        w = targetW;
        h = targetH;
        x = right - w;
        y = bottom - h;
      } else if (activeHandle === 'ne') {
        const bottom = y + h;
        let targetW = Math.max(10, Math.min(100 - x, w + dx));
        let targetH = targetW / K;
        if (bottom - targetH < 0) {
          targetH = bottom;
          targetW = targetH * K;
        }
        if (targetW < 10 || targetH < 10) return prev;
        w = targetW;
        h = targetH;
        y = bottom - h;
      } else if (activeHandle === 'sw') {
        const right = x + w;
        let targetH = Math.max(10, Math.min(100 - y, h + dy));
        let targetW = targetH * K;
        if (right - targetW < 0) {
          targetW = right;
          targetH = targetW / K;
        }
        if (targetW < 10 || targetH < 10) return prev;
        w = targetW;
        h = targetH;
        x = right - w;
      }

      return { x, y, w, h };
    });
  };

  const triggerCropCommit = () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    // Convert cropBox percentage coordinates into real image space pixel bounds
    const x = Math.round((cropBox.x / 100) * canvas.width);
    const y = Math.round((cropBox.y / 100) * canvas.height);
    const w = Math.round((cropBox.w / 100) * canvas.width);
    const h = Math.round((cropBox.h / 100) * canvas.height);

    onCommitCrop({ x, y, w, h });
  };

  // Keyboard shortcut bounds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        fitToScreen();
      }
      if (e.key === 'Enter' && activeTool === 'crop') {
        triggerCropCommit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, cropBox]);

  // Calculations for brush overlay cursor
  const canvasRect = displayCanvasRef.current?.getBoundingClientRect();
  const showBrushCursor = (activeTool === 'clone' || activeTool === 'heal') && canvasRect && 
    mousePos.x >= canvasRect.left && mousePos.x <= canvasRect.right &&
    mousePos.y >= canvasRect.top && mousePos.y <= canvasRect.bottom;

  return (
    <main 
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={activeHandle ? handleCropContainerMouseMove : undefined}
      onDoubleClick={fitToScreen}
      className="flex-1 bg-[#09090b] relative overflow-hidden flex items-center justify-center cursor-default h-full"
      style={{
        cursor: activeTool === 'select' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair'
      }}
    >
      {/* Background Pixel Grid Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Viewport content */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
        style={{
          width: imageDimensions ? `${imageDimensions.width * zoom}px` : 'auto',
          height: imageDimensions ? `${imageDimensions.height * zoom}px` : 'auto',
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDoubleClick={(e) => {
          e.stopPropagation();
          fitToScreen();
        }}
      >
        {/* Hidden processing buffers and tags */}
        <canvas ref={baseCanvasRef} className="hidden" />

        {/* Display Filtered Image */}
        <canvas
          ref={displayCanvasRef}
          className="shadow-2xl border border-zinc-800 bg-[size:16px_16px] bg-[position:0_0,8px_8px] bg-[linear-gradient(45deg,#121214_25%,transparent_25%,transparent_75%,#121214_75%,#121214),linear-gradient(45deg,#121214_25%,#1a1a1e_25%,#1a1a1e_75%,#121214_75%,#121214)] transition-shadow duration-300"
          style={{
            width: imageDimensions ? `${imageDimensions.width * zoom}px` : 'auto',
            height: imageDimensions ? `${imageDimensions.height * zoom}px` : 'auto',
            imageRendering: zoom >= 2 ? 'pixelated' : 'auto'
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            fitToScreen();
          }}
        />

        {/* Grid Overlay */}
        {gridSettings.type !== 'none' && imageDimensions && (
          <svg
            className="absolute top-0 left-0 pointer-events-none z-20"
            style={{
              width: `${imageDimensions.width * zoom}px`,
              height: `${imageDimensions.height * zoom}px`,
            }}
          >
            <defs>
              {gridSettings.type === 'custom' && (
                <pattern
                  id="custom-grid-pattern"
                  width={gridSettings.spacing * zoom}
                  height={gridSettings.spacing * zoom}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${gridSettings.spacing * zoom} 0 L 0 0 L 0 ${gridSettings.spacing * zoom}`}
                    fill="none"
                    stroke={gridSettings.color}
                    strokeWidth="1"
                    strokeOpacity={gridSettings.opacity}
                  />
                </pattern>
              )}
              {((gridSettings.type === 'pixels' && zoom >= 8) || (gridSettings.type !== 'none' && gridSettings.showPixelBoundary && zoom >= 8)) && (
                <pattern
                  id="pixel-grid-pattern"
                  width={zoom}
                  height={zoom}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${zoom} 0 L 0 0 L 0 ${zoom}`}
                    fill="none"
                    stroke={gridSettings.type === 'pixels' ? gridSettings.color : '#ffffff'}
                    strokeWidth="0.5"
                    strokeOpacity={gridSettings.type === 'pixels' ? gridSettings.opacity * 0.7 : 0.25}
                  />
                </pattern>
              )}
            </defs>

            {/* Rule of Thirds Lines */}
            {gridSettings.type === 'thirds' && (
              <>
                <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke={gridSettings.color} strokeWidth="1.5" strokeOpacity={gridSettings.opacity} />
                <line x1="66.67%" y1="0" x2="66.67%" y2="100%" stroke={gridSettings.color} strokeWidth="1.5" strokeOpacity={gridSettings.opacity} />
                <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke={gridSettings.color} strokeWidth="1.5" strokeOpacity={gridSettings.opacity} />
                <line x1="0" y1="66.67%" x2="100%" y2="66.67%" stroke={gridSettings.color} strokeWidth="1.5" strokeOpacity={gridSettings.opacity} />
              </>
            )}

            {/* Custom Grid */}
            {gridSettings.type === 'custom' && (
              <rect width="100%" height="100%" fill="url(#custom-grid-pattern)" />
            )}

            {/* Pixel Grid */}
            {gridSettings.type === 'pixels' && zoom >= 8 && (
              <rect width="100%" height="100%" fill="url(#pixel-grid-pattern)" />
            )}

            {/* Pixel Boundary Overlay (for non-pixel grids when zoom is high) */}
            {gridSettings.type !== 'none' && gridSettings.type !== 'pixels' && gridSettings.showPixelBoundary && zoom >= 8 && (
              <rect width="100%" height="100%" fill="url(#pixel-grid-pattern)" />
            )}
          </svg>
        )}

        {/* Interactive Crop Marquee Overlay */}
        {activeTool === 'crop' && imageDimensions && (
          <div 
            className="absolute border-2 border-dashed border-[#e25c24] bg-black/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] overflow-visible cursor-move z-30"
            style={{
              left: `${cropBox.x}%`,
              top: `${cropBox.y}%`,
              width: `${cropBox.w}%`,
              height: `${cropBox.h}%`,
            }}
            onMouseDown={(e) => handleCropHandleMouseDown('move', e)}
          >
            {/* Visual crop resolution readout */}
            <div className="absolute -top-6 left-0 bg-[#e25c24] text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow">
              {Math.round((cropBox.w / 100) * imageDimensions.width)} × {Math.round((cropBox.h / 100) * imageDimensions.height)} px
            </div>

            {/* Corner & Side resizing handles */}
            {['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'].map((hnd) => (
              <div
                key={hnd}
                className={`absolute w-3.5 h-3.5 bg-white border border-[#e25c24] shadow rounded-sm z-30 transition-transform hover:scale-125 ${
                  hnd === 'nw' ? '-top-1.5 -left-1.5 cursor-nwse-resize' :
                  hnd === 'ne' ? '-top-1.5 -right-1.5 cursor-nesw-resize' :
                  hnd === 'se' ? '-bottom-1.5 -right-1.5 cursor-nwse-resize' :
                  hnd === 'sw' ? '-bottom-1.5 -left-1.5 cursor-nesw-resize' :
                  hnd === 'n' ? '-top-1.5 left-[47%] cursor-ns-resize' :
                  hnd === 's' ? '-bottom-1.5 left-[47%] cursor-ns-resize' :
                  hnd === 'e' ? 'top-[47%] -right-1.5 cursor-ew-resize' :
                  '-left-1.5 top-[47%] cursor-ew-resize'
                }`}
                onMouseDown={(e) => handleCropHandleMouseDown(hnd, e)}
              />
            ))}

            {/* Commit / Cancel overlay bar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#18181b] border border-[#2e2e33] px-3 py-1.5 rounded-full flex items-center space-x-2.5 shadow-2xl z-40">
              <button
                onClick={(e) => { e.stopPropagation(); triggerCropCommit(); }}
                className="p-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Commit Crop (Enter)"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3.5 bg-zinc-700" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRatio('free');
                  setCropBox({ x: 10, y: 10, w: 80, h: 80 });
                }}
                className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 transition-colors"
                title="Reset Crop box"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3.5 bg-zinc-700" />
              <select
                value={selectedRatio}
                onChange={(e) => { e.stopPropagation(); setCropAspectRatio(e.target.value); }}
                onMouseDown={(e) => e.stopPropagation()}
                className="bg-zinc-900 border border-zinc-700 text-gray-200 text-xs rounded px-2 py-0.5 outline-none cursor-pointer hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                title="Aspect Ratio"
              >
                <option value="free">Free Form</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="16:9">16:9 (Widescreen)</option>
                <option value="9:16">9:16 (Portrait)</option>
              </select>
            </div>
          </div>
        )}

        {/* Clone Stamp Source Crosshair Helper */}
        {activeTool === 'clone' && cloneSettings.sourcePoint && imageDimensions && (
          <div 
            className="absolute w-5 h-5 pointer-events-none select-none z-20 flex items-center justify-center border border-dashed border-sky-400 rounded-full"
            style={{
              left: `${(cloneSettings.sourcePoint.x / imageDimensions.width) * 100}%`,
              top: `${(cloneSettings.sourcePoint.y / imageDimensions.height) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-2.5 h-0.5 bg-sky-400 absolute" />
            <div className="h-2.5 w-0.5 bg-sky-400 absolute" />
          </div>
        )}
      </div>

      {/* Grid Settings Popover */}
      {showGridSettings && imageDimensions && (
        <div className="absolute bottom-16 left-4 bg-[#121214]/95 backdrop-blur-md border border-[#222226] p-4 rounded-xl shadow-2xl z-40 w-72 text-xs font-mono space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="text-[11px] font-bold text-gray-200 tracking-wider flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-[#f98435]" />
              COMPOSITION GRID
            </span>
            <button 
              onClick={() => setShowGridSettings(false)}
              className="text-zinc-500 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Grid Overlay Type</label>
            <div className="grid grid-cols-4 gap-1 bg-[#17171a] p-1 rounded-lg border border-zinc-800">
              {(['none', 'thirds', 'custom', 'pixels'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setGridSettings(prev => ({ ...prev, type }))}
                  className={`py-1 rounded text-[10px] transition-all capitalize font-medium ${
                    gridSettings.type === type
                      ? 'bg-[#e25c24]/10 text-[#f98435] border border-[#e25c24]/20 font-bold'
                      : 'hover:text-white text-zinc-400 border border-transparent'
                  }`}
                >
                  {type === 'none' ? 'Off' : type === 'thirds' ? 'Thirds' : type === 'custom' ? 'Custom' : 'Pixels'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Grid Spacing Slider */}
          {gridSettings.type === 'custom' && (
            <div className="space-y-1.5 animate-in fade-in duration-100">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span className="font-semibold uppercase tracking-wider">Grid Spacing</span>
                <span className="text-white font-bold">{gridSettings.spacing}px</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={gridSettings.spacing}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, spacing: parseInt(e.target.value) }))}
                  className="w-full accent-[#e25c24] bg-zinc-900 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Pixel grid zoom message */}
          {gridSettings.type === 'pixels' && zoom < 8 && (
            <div className="p-2.5 bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 text-[10px] text-zinc-400 leading-normal text-center">
              Pixel boundaries require <strong className="text-[#f98435]">&ge;800%</strong> zoom.<br />
              Current Zoom: <strong className="text-white">{Math.round(zoom * 100)}%</strong>
              <div className="mt-1.5 flex justify-center">
                <button
                  onClick={() => setZoom(8.0)}
                  className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-[9px] text-zinc-300 rounded border border-zinc-700 font-mono"
                >
                  Quick Zoom (800%)
                </button>
              </div>
            </div>
          )}

          {/* Custom Settings: Color & Opacity & Pixel Boundaries */}
          {gridSettings.type !== 'none' && (
            <div className="space-y-3 pt-1.5 border-t border-zinc-800/60">
              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider">Line Opacity</span>
                  <span className="text-white font-bold">{Math.round(gridSettings.opacity * 100)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={gridSettings.opacity}
                    onChange={(e) => setGridSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                    className="w-full accent-[#e25c24] bg-zinc-900 h-1.5 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Grid Line Color Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Line Color</label>
                <div className="flex items-center space-x-2">
                  {[
                    { label: 'White', value: '#ffffff', bg: 'bg-white border border-zinc-700' },
                    { label: 'Black', value: '#000000', bg: 'bg-black border border-zinc-700' },
                    { label: 'Orange', value: '#e25c24', bg: 'bg-[#e25c24]' },
                    { label: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
                    { label: 'Green', value: '#22c55e', bg: 'bg-green-500' },
                  ].map((colorOpt) => (
                    <button
                      key={colorOpt.value}
                      onClick={() => setGridSettings(prev => ({ ...prev, color: colorOpt.value }))}
                      className={`w-5 h-5 rounded-full ${colorOpt.bg} flex items-center justify-center transition-all ${
                        gridSettings.color === colorOpt.value
                          ? 'ring-2 ring-[#e25c24] scale-110 shadow-lg'
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                      title={colorOpt.label}
                    />
                  ))}
                </div>
              </div>

              {/* Pixel Boundaries Toggle at High Zoom */}
              {gridSettings.type !== 'pixels' && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider flex flex-col">
                    <span>Pixel Boundaries</span>
                    <span className="text-[8px] text-zinc-500 font-normal">at &ge;800% zoom</span>
                  </span>
                  <button
                    onClick={() => setGridSettings(prev => ({ ...prev, showPixelBoundary: !prev.showPixelBoundary }))}
                    className={`w-8 h-4 rounded-full transition-colors relative ${
                      gridSettings.showPixelBoundary ? 'bg-[#e25c24]' : 'bg-zinc-800'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                      gridSettings.showPixelBoundary ? 'left-4.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Canvas Zoom/Pan HUD Quick Bar */}
      {imageDimensions && (
        <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 left-2 xs:left-3 sm:left-4 bg-[#121214]/90 backdrop-blur border border-[#222226] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3 text-[10px] sm:text-xs font-mono text-gray-400 shadow-2xl z-30">
          <span><span className="hidden xs:inline">Scale: </span><strong className="text-white">{Math.round(zoom * 100)}%</strong></span>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center space-x-1 xs:space-x-1.5">
            <button
              onClick={() => setZoom(Math.max(0.1, zoom - 0.15))}
              className="p-1 rounded hover:bg-[#1c1c1f] hover:text-white transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoom(Math.min(10, zoom + 0.15))}
              className="p-1 rounded hover:bg-[#1c1c1f] hover:text-white transition-colors"
              title="Zoom In"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={fitToScreen}
              className="p-1 rounded hover:bg-[#1c1c1f] hover:text-white transition-colors"
              title="Fit to Workspace Screen"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1 rounded hover:bg-[#1c1c1f] hover:text-white transition-colors"
              title="Reset to Actual Size (100% Zoom)"
            >
              <Target className="w-3 h-3" />
            </button>
            <span className="text-zinc-700">|</span>
            <button
              onClick={() => setShowGridSettings(!showGridSettings)}
              className={`p-1.5 rounded transition-all flex items-center gap-1 ${
                gridSettings.type !== 'none' 
                  ? 'text-[#f98435] bg-[#e25c24]/10 hover:bg-[#e25c24]/20' 
                  : 'hover:bg-[#1c1c1f] hover:text-white'
              }`}
              title="Composition Grid Settings"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Real-time Live Changes Tracker & Comparison Suite */}
      {imageDimensions && (
        <AnimatePresence mode="wait">
          {!isChangesTrackerCollapsed ? (
            <motion.div
              key="expanded-tracker"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-4 right-4 max-w-[280px] sm:max-w-[320px] w-full bg-[#121214]/95 backdrop-blur-md border border-[#222226] rounded-xl shadow-2xl p-3.5 z-30 flex flex-col space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#222226] pb-2">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f98435] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e25c24]"></span>
                  </span>
                  <span className="text-[11px] font-mono font-bold tracking-wider text-gray-200 uppercase">
                    Real-time Changes Feed
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 font-mono px-1.5 py-0.5 rounded">
                    {getActiveChanges().length} active
                  </span>
                  <button
                    onClick={() => setIsChangesTrackerCollapsed(true)}
                    className="p-1 rounded hover:bg-zinc-800/80 text-zinc-400 hover:text-[#f98435] transition-all cursor-pointer"
                    title="Collapse Changes Feed"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive Compare Tool Section */}
              <div className="space-y-2 bg-[#17171a] border border-[#222226] p-2.5 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 flex items-center space-x-1">
                    <Columns className="w-3 h-3 text-[#f98435]" />
                    <span>Compare Tools</span>
                  </span>
                </div>

                {/* Hold to Compare Button & Toggle */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onMouseDown={() => setIsPressingCompare(true)}
                    onMouseUp={() => setIsPressingCompare(false)}
                    onMouseLeave={() => setIsPressingCompare(false)}
                    onTouchStart={() => setIsPressingCompare(true)}
                    onTouchEnd={() => setIsPressingCompare(false)}
                    className={`py-1.5 px-2.5 rounded text-[10px] font-mono font-medium transition-all flex items-center justify-center space-x-1 border select-none ${
                      isPressingCompare
                        ? 'bg-zinc-100 text-black border-zinc-200 shadow-inner'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700/50'
                    }`}
                    title="Press and hold to temporarily peek at the raw unadjusted original"
                  >
                    {isPressingCompare ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-zinc-400" />}
                    <span>Hold to Original</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsComparing(!isComparing);
                      if (!isComparing) {
                        setIsPressingCompare(false);
                      }
                    }}
                    className={`py-1.5 px-2.5 rounded text-[10px] font-mono font-medium transition-all flex items-center justify-center space-x-1 border ${
                      isComparing
                        ? 'bg-[#e25c24]/20 text-[#f98435] border-[#e25c24]/40 font-bold shadow-md shadow-[#e25c24]/5'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700/50'
                    }`}
                  >
                    <Columns className="w-3 h-3" />
                    <span>{isComparing ? 'Split Active' : 'Split Slider'}</span>
                  </button>
                </div>

                {/* Split Screen Slider (if active) */}
                <AnimatePresence>
                  {isComparing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1 overflow-hidden pt-1.5 border-t border-zinc-800/60"
                    >
                      <div className="flex justify-between font-mono text-[9px] text-gray-400">
                        <span>Original (Left)</span>
                        <span>Modified (Right)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={splitRatio}
                          onChange={(e) => setSplitRatio(parseFloat(e.target.value))}
                          className="w-full accent-[#e25c24] bg-zinc-900 h-1.5 rounded cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-zinc-300 w-8 text-right font-bold">
                          {Math.round(splitRatio * 100)}%
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Active Changes Log List */}
              <div className="max-h-[140px] sm:max-h-[180px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800 space-y-1.5">
                <AnimatePresence initial={false}>
                  {getActiveChanges().length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-6 text-center text-[10px] text-zinc-500 font-mono leading-relaxed bg-[#121214]/40 rounded-lg border border-dashed border-zinc-800"
                    >
                      No filter adjustments applied.
                      <br />
                      Sliders are at default states.
                    </motion.div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {getActiveChanges().map((item) => (
                        <motion.div
                          key={item.key}
                          initial={{ opacity: 0, x: 10, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-[10px] font-mono ${item.color} shadow-sm`}
                        >
                          <span className="font-medium text-zinc-300">{item.label}</span>
                          <span className="font-bold tracking-tight">{item.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed-tracker"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsChangesTrackerCollapsed(false)}
              className="absolute top-4 right-4 p-3 bg-[#121214]/95 backdrop-blur-md border border-[#222226] rounded-xl shadow-2xl hover:bg-[#1a1a20] hover:border-[#e25c24]/50 hover:shadow-[#e25c24]/10 text-zinc-300 hover:text-[#f98435] transition-all cursor-pointer flex items-center justify-center group z-30"
              title="Expand Real-time Changes Feed"
            >
              <div className="relative">
                <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {getActiveChanges().length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#e25c24] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#121214] animate-bounce">
                    {getActiveChanges().length}
                  </span>
                )}
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Stylized Floating Circular Brush Outline Cursor */}
      {showBrushCursor && (
        <div
          className="fixed pointer-events-none rounded-full border border-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.5)] bg-transparent z-50 flex items-center justify-center"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            width: `${cloneSettings.brushSize * zoom}px`,
            height: `${cloneSettings.brushSize * zoom}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Inner point representation */}
          <div className="w-1 h-1 bg-white rounded-full shadow" />
          {/* Crosshair indicator for Clone Stamp Source Offset relative line */}
          {activeTool === 'clone' && cloneSettings.sourcePoint && imageDimensions && (
            <svg className="absolute overflow-visible w-full h-full pointer-events-none opacity-40">
              <line
                x1="50%"
                y1="50%"
                // Draw trailing line back to screen location of clone source! Incredible UX
                x2={`${(cloneSettings.sourcePoint.x - (screenToImageCoords(mousePos.x, mousePos.y)?.x || 0)) * zoom + (cloneSettings.brushSize * zoom)/2}`}
                y2={`${(cloneSettings.sourcePoint.y - (screenToImageCoords(mousePos.x, mousePos.y)?.y || 0)) * zoom + (cloneSettings.brushSize * zoom)/2}`}
                stroke="white"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </svg>
          )}
        </div>
      )}
    </main>
  );
}
