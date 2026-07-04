import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Sparkles, 
  History, 
  HelpCircle, 
  RotateCcw,
  Film,
  Image as ImageIcon,
  CheckCircle,
  Play,
  MonitorPlay,
  Sun,
  Moon,
  Smartphone,
  Library,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ToolType, 
  FilterAdjustments, 
  INITIAL_ADJUSTMENTS, 
  ScaleSettings, 
  CloneStampSettings, 
  VideoState, 
  HistoryItem,
  LibraryFile
} from './types';
import JSZip from 'jszip';

import GlobalToolbar from './components/GlobalToolbar';
import Toolbar from './components/Toolbar';
import ControlPanel from './components/ControlPanel';
import Workspace from './components/Workspace';
import VideoTimeline from './components/VideoTimeline';
import { scaleImageData } from './utils/imageFilters';
import SplashPage from './components/SplashPage';

const PRESETS = [
  {
    name: 'Parthenon Temple',
    url: 'https://images.unsplash.com/photo-1608155686393-8fdd966d784d?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
    desc: 'Golden-ratio architectural perfection',
    icon: '🏛️'
  },
  {
    name: 'Statue of Athena',
    url: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
    desc: 'Intricate marble carving details',
    icon: '👤'
  },
  {
    name: 'Ancient Artifacts',
    url: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
    desc: 'High contrast relics of antiquity',
    icon: '🏺'
  },
  {
    name: 'Aegean Sunset',
    url: 'https://images.unsplash.com/photo-1505080856163-267a49b3026a?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
    desc: 'Rich gradient blue & amber tones',
    icon: '🌅'
  },
  {
    name: 'Fire & Steel Loop',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video' as const,
    desc: 'Furnace action loop for video tuning',
    icon: '🔥'
  }
];

export default function App() {
  // Application Modes
  const [showInitialSplash, setShowInitialSplash] = useState(true);
  const [hasFile, setHasFile] = useState(false);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [fileName, setFileName] = useState('');
  const [mediaFiles, setMediaFiles] = useState<LibraryFile[]>([]);
  const [showGallery, setShowGallery] = useState(true);
  
  // Theme States
  const [theme, setTheme] = useState<'light' | 'dark' | 'phone'>('dark');
  const [systemIsDark, setSystemIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemIsDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const activeTheme = theme === 'phone' ? (systemIsDark ? 'dark' : 'light') : theme;
  
  // Base State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [adjustments, setAdjustments] = useState<FilterAdjustments>(INITIAL_ADJUSTMENTS);
  const [zoom, setZoom] = useState(0.41);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [videoCrop, setVideoCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Active Tool Settings
  const [cloneSettings, setCloneSettings] = useState<CloneStampSettings>({
    brushSize: 30,
    brushStrength: 0.8,
    sourcePoint: null,
    isSettingSource: false,
  });

  const [scaleSettings, setScaleSettings] = useState<ScaleSettings>({
    factor: 1.0,
    interpolation: 'nearest',
  });

  // Video State
  const [videoState, setVideoState] = useState<VideoState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    startTime: 0,
    endTime: 0,
    fps: 30,
    upscaleFactor: 1.0,
    upscaleMethod: 'bilinear',
    enhanceContrast: false,
    enhanceSharpen: 0,
    enhanceDenoise: 0,
    playbackRate: 1.0,
  });

  // History Undo/Redo System
  const [historyStack, setHistoryStack] = useState<HistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // References
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonStateInputRef = useRef<HTMLInputElement | null>(null);

  // Video recording/rendering exports
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  // Create a history item snapshot
  const pushHistoryState = (actionName: string, customCanvas?: HTMLCanvasElement) => {
    const canvas = customCanvas || baseCanvasRef.current;
    if (!canvas) return;

    try {
      const dataURL = canvas.toDataURL('image/png');
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: actionName,
        timestamp: Date.now(),
        imageDataURL: dataURL,
        adjustments: { ...adjustments },
        width: canvas.width,
        height: canvas.height,
      };

      // Slice out any "redo" steps if we were in the middle of the stack
      const cleanStack = historyStack.slice(0, currentHistoryIndex + 1);
      const nextStack = [...cleanStack, newItem];
      
      // Limit history stack size to 25 items to prevent browser memory bloat
      if (nextStack.length > 25) {
        nextStack.shift();
      }

      setHistoryStack(nextStack);
      setCurrentHistoryIndex(nextStack.length - 1);
    } catch (err) {
      console.warn('Failed to capture base canvas history state', err);
    }
  };

  // Jump or revert to a specific state in the history stack
  const jumpToHistory = (index: number) => {
    if (index < 0 || index >= historyStack.length) return;

    const item = historyStack[index];
    const canvas = baseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.src = item.imageDataURL;
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      canvas.width = item.width;
      canvas.height = item.height;
      ctx.clearRect(0, 0, item.width, item.height);
      ctx.drawImage(img, 0, 0);
      
      setImageDimensions({ width: item.width, height: item.height });
      setAdjustments(item.adjustments);
      setCurrentHistoryIndex(index);
    };
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      jumpToHistory(currentHistoryIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < historyStack.length - 1) {
      jumpToHistory(currentHistoryIndex + 1);
    }
  };

  // Load a file from the media files library with auto-retry wait for mounting
  const loadLibraryFile = (libFile: LibraryFile) => {
    setFileName(libFile.name);
    setFileType(libFile.type);
    setHasFile(true);
    setVideoCrop(null);
    setAdjustments(INITIAL_ADJUSTMENTS);

    if (libFile.type === 'image') {
      const img = new Image();
      img.src = libFile.url;
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        let attempts = 0;
        const drawOnCanvas = () => {
          const canvas = baseCanvasRef.current;
          if (!canvas) {
            attempts++;
            if (attempts < 100) { // Safety bound
              setTimeout(drawOnCanvas, 30);
            }
            return;
          }

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          setHistoryStack([]);
          setCurrentHistoryIndex(-1);
          
          // Push initial snapshot
          pushHistoryState(`Load: ${libFile.name}`, canvas);
        };
        drawOnCanvas();
      };
    } else {
      // Handle Video
      let videoAttempts = 0;
      const setupVideo = () => {
        const video = videoRef.current;
        if (!video) {
          videoAttempts++;
          if (videoAttempts < 100) {
            setTimeout(setupVideo, 30);
          }
          return;
        }

        video.src = libFile.url;
        video.onloadedmetadata = () => {
          setVideoState({
            playing: false,
            currentTime: 0,
            duration: video.duration,
            startTime: 0,
            endTime: video.duration,
            fps: 30,
            upscaleFactor: 1.0,
            upscaleMethod: 'bilinear',
            enhanceContrast: false,
            enhanceSharpen: 0,
            enhanceDenoise: 0,
            playbackRate: 1.0,
          });

          let canvasAttempts = 0;
          const drawVideoFrame = () => {
            const canvas = baseCanvasRef.current;
            if (!canvas) {
              canvasAttempts++;
              if (canvasAttempts < 100) {
                setTimeout(drawVideoFrame, 30);
              }
              return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            setImageDimensions({ width: video.videoWidth, height: video.videoHeight });

            setHistoryStack([]);
            setCurrentHistoryIndex(-1);
            pushHistoryState(`Load Video: ${libFile.name}`, canvas);
          };
          drawVideoFrame();
        };
      };
      setupVideo();
    }
  };

  // Handle loading multiple files (including .zip unzipping)
  const handleMultipleFilesLoad = async (filesList: File[]) => {
    const newMediaFiles: LibraryFile[] = [...mediaFiles];
    let firstLoaded: LibraryFile | null = null;

    for (const file of filesList) {
      if (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
        try {
          const zip = new JSZip();
          const zipContents = await zip.loadAsync(file);
          for (const [filename, fileEntry] of Object.entries(zipContents.files)) {
            if (fileEntry.dir) continue;
            const isImg = filename.match(/\.(png|jpe?g|webp|gif)$/i);
            const isVid = filename.match(/\.(mp4|webm|mov|mkv)$/i);
            if (isImg || isVid) {
              const ext = filename.split('.').pop() || '';
              const mimeType = isImg ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : `video/${ext}`;
              const blob = await fileEntry.async('blob');
              const fileObj = new File([blob], filename, { type: mimeType });
              const url = URL.createObjectURL(fileObj);
              const libFile: LibraryFile = {
                id: Math.random().toString(36).substring(7),
                name: filename,
                type: isImg ? 'image' : 'video',
                url,
                fileObject: fileObj
              };
              newMediaFiles.push(libFile);
              if (!firstLoaded) firstLoaded = libFile;
            }
          }
        } catch (err) {
          console.error("Error unzipping file: ", err);
          alert(`Failed to extract zip file: ${file.name}`);
        }
      } else {
        const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|mkv)$/i);
        const isImage = file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g|webp|gif)$/i);
        if (isImage || isVideo) {
          const url = URL.createObjectURL(file);
          const libFile: LibraryFile = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            type: isVideo ? 'video' : 'image',
            url,
            fileObject: file
          };
          newMediaFiles.push(libFile);
          if (!firstLoaded) firstLoaded = libFile;
        }
      }
    }

    if (newMediaFiles.length > 0) {
      setMediaFiles(newMediaFiles);
      if (firstLoaded) {
        loadLibraryFile(firstLoaded);
      }
    } else {
      alert('No supported image, video, or ZIP files were found.');
    }
  };

  // Adapter for backward compatibility
  const handleFileLoad = (file: File) => {
    handleMultipleFilesLoad([file]);
  };

  // Create high contrast Procedural Test Card Demo
  const handleLoadDemoCanvas = () => {
    setFileName('hephaestus_procedural_test_pattern.png');
    setFileType('image');
    setHasFile(true);
    setVideoCrop(null);
    setAdjustments(INITIAL_ADJUSTMENTS);

    setTimeout(() => {
      const canvas = baseCanvasRef.current;
      if (!canvas) return;

      const w = 800;
      const h = 600;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // 1. Sleek metallic background color gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#111317');
      grad.addColorStop(0.5, '#20242d');
      grad.addColorStop(1, '#0c0d10');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 2. Technical alignment grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 3. Draw a stylized vector Anvil in the center
      ctx.fillStyle = '#2d3340';
      ctx.strokeStyle = '#e25c24';
      ctx.lineWidth = 3;

      // Draw Anvil base path
      ctx.beginPath();
      ctx.moveTo(300, 420);
      ctx.lineTo(500, 420);
      ctx.lineTo(470, 360);
      ctx.lineTo(430, 320);
      ctx.lineTo(370, 320);
      ctx.lineTo(330, 360);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Anvil center trunk
      ctx.beginPath();
      ctx.moveTo(360, 320);
      ctx.lineTo(440, 320);
      ctx.lineTo(440, 240);
      ctx.lineTo(360, 240);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Anvil top horn and deck
      ctx.beginPath();
      ctx.moveTo(240, 240); // Horn tip
      ctx.quadraticCurveTo(310, 245, 340, 210);
      ctx.lineTo(520, 210); // Deck right edge
      ctx.lineTo(520, 240);
      ctx.lineTo(240, 240);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw procedural noise dots (ideal for verifying "Noise Reduction" Median filter!)
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 400; i++) {
        const px = Math.floor(Math.random() * w);
        const py = Math.floor(Math.random() * h);
        ctx.fillRect(px, py, 1.5, 1.5);
      }

      // 4. Color grading calibrate spectrum bars at bottom
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];
      const barW = 50;
      const barH = 40;
      colors.forEach((color, idx) => {
        ctx.fillStyle = color;
        ctx.fillRect(100 + idx * (barW + 10), 40, barW, barH);
        
        // Add artificial speckles/scratches to color bars (perfect to try out Clone Stamp / Healing brush!)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(110 + idx * (barW + 10) + Math.random()*20, 45 + Math.random()*15);
        ctx.lineTo(110 + idx * (barW + 10) + Math.random()*20 + 8, 45 + Math.random()*15 + 8);
        ctx.stroke();
      });

      // Gradient bars for contrast testing
      const grayGrad = ctx.createLinearGradient(100, 100, 700, 100);
      grayGrad.addColorStop(0, '#000000');
      grayGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grayGrad;
      ctx.fillRect(100, 100, 600, 15);

      setImageDimensions({ width: w, height: h });
      setHistoryStack([]);
      setCurrentHistoryIndex(-1);
      pushHistoryState('Load Procedural Demo', canvas);
    }, 50);
  };

  // Load a classical Greek preset or video URL with CORS-bypass failsafes
  const handleLoadPresetURL = (url: string, type: 'image' | 'video', name: string) => {
    setFileName(name);
    setFileType(type);
    setHasFile(true);
    setVideoCrop(null);
    setAdjustments(INITIAL_ADJUSTMENTS);

    if (type === 'image') {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.referrerPolicy = 'no-referrer';
      img.src = url;
      img.onload = () => {
        const canvas = baseCanvasRef.current;
        if (!canvas) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setHistoryStack([]);
        setCurrentHistoryIndex(-1);
        pushHistoryState(`Load Preset: ${name}`, canvas);
      };
      img.onerror = () => {
        console.warn(`Failed to load preset ${name} via direct URL, falling back to procedural demo`);
        handleLoadDemoCanvas();
      };
    } else {
      setTimeout(() => {
        const video = videoRef.current;
        if (!video) return;

        video.src = url;
        video.crossOrigin = "anonymous";
        video.onloadedmetadata = () => {
          setVideoState({
            playing: false,
            currentTime: 0,
            duration: video.duration,
            startTime: 0,
            endTime: video.duration,
            fps: 30,
            upscaleFactor: 1.0,
            upscaleMethod: 'bilinear',
            enhanceContrast: false,
            enhanceSharpen: 0,
            enhanceDenoise: 0,
            playbackRate: 1.0,
          });

          const canvas = baseCanvasRef.current;
          if (!canvas) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          setImageDimensions({ width: video.videoWidth, height: video.videoHeight });

          setHistoryStack([]);
          setCurrentHistoryIndex(-1);
          pushHistoryState(`Load Video: ${name}`, canvas);
        };
        video.onerror = () => {
          console.warn(`Failed to load video preset ${name}, falling back to procedural demo`);
          handleLoadDemoCanvas();
        };
      }, 50);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFilesLoad(Array.from(e.dataTransfer.files));
    }
  };

  // Zoom actions
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 10));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.05));
  const handleZoomReset = () => setZoom(1.0);
  const handleZoomFit = () => {
    // Triggers Fit screen calculation in Workspace hook
    setZoom(0.99); 
  };

  // Adjustments modifiers
  const handleModifyAdjustments = (newAdjs: Partial<FilterAdjustments>) => {
    setAdjustments((prev) => ({ ...prev, ...newAdjs }));
  };

  const handleResetAdjustments = () => {
    setAdjustments(INITIAL_ADJUSTMENTS);
  };

  // Destructive Editing Transforms (Rotate, Flip, Crop, Resolution Scaling)
  const handleRotate = (deg: number) => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d')!.drawImage(canvas, 0, 0);

    const rad = (deg * Math.PI) / 180;
    const is90 = Math.abs(deg) % 180 === 90;

    canvas.width = is90 ? tempCanvas.height : tempCanvas.width;
    canvas.height = is90 ? tempCanvas.width : tempCanvas.height;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);

    setImageDimensions({ width: canvas.width, height: canvas.height });
    pushHistoryState(`Rotate ${deg}°`);
  };

  const handleFlip = (dir: 'h' | 'v') => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d')!.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (dir === 'h') {
      ctx.scale(-1, 1);
      ctx.drawImage(tempCanvas, -canvas.width, 0);
    } else {
      ctx.scale(1, -1);
      ctx.drawImage(tempCanvas, 0, -canvas.height);
    }
    ctx.restore();

    pushHistoryState(`Flip ${dir === 'h' ? 'Horizontal' : 'Vertical'}`);
  };

  // Crop Comitter
  const handleCommitCrop = (box: { x: number; y: number; w: number; h: number }) => {
    if (fileType === 'video') {
      setVideoCrop(box);
      setImageDimensions({ width: box.w, height: box.h });
      setActiveTool('select');
      pushHistoryState('Commit Crop Rectangle');
      return;
    }

    const canvas = baseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d')!.drawImage(canvas, 0, 0);

    // Resize canvas
    canvas.width = box.w;
    canvas.height = box.h;

    ctx.clearRect(0, 0, box.w, box.h);
    ctx.drawImage(tempCanvas, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);

    setImageDimensions({ width: box.w, height: box.h });
    setActiveTool('select'); // Reset active tool
    pushHistoryState('Commit Crop Rectangle');
  };

  // Resolution Rescaler
  const handleApplyScale = () => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const oldData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const scaledData = scaleImageData(oldData, scaleSettings.factor, scaleSettings.interpolation);

    canvas.width = scaledData.width;
    canvas.height = scaledData.height;
    ctx.putImageData(scaledData, 0, 0);

    setImageDimensions({ width: scaledData.width, height: scaledData.height });
    setScaleSettings((prev) => ({ ...prev, factor: 1.0 })); // Reset slider
    pushHistoryState(`Rescale Resolution (${Math.round(scaleSettings.factor * 100)}%)`);
  };

  // White Balance Calibration
  const handleColorPickCalibration = (gains: { r: number; g: number; b: number }) => {
    setAdjustments((prev) => ({
      ...prev,
      redChannel: Math.min(Math.max(prev.redChannel + gains.r, -100), 100),
      greenChannel: Math.min(Math.max(prev.greenChannel + gains.g, -100), 100),
      blueChannel: Math.min(Math.max(prev.blueChannel + gains.b, -100), 100),
    }));
    // Auto-reset picker back to selector hand
    setActiveTool('select');
  };

  // Frame scrubber step back/forth
  const handleStepFrame = (dir: 'forward' | 'backward') => {
    const video = videoRef.current;
    if (!video) return;

    const frameDuration = 1 / videoState.fps;
    const nextTime = dir === 'forward' 
      ? Math.min(videoState.currentTime + frameDuration, videoState.endTime) 
      : Math.max(videoState.currentTime - frameDuration, videoState.startTime);

    video.currentTime = nextTime;
    setVideoState((prev) => ({ ...prev, currentTime: nextTime }));
  };

  // Standard export filtered image (as PNG)
  const handleSaveAsset = () => {
    const displayCanvas = document.querySelector('main canvas:not(.hidden)') as HTMLCanvasElement;
    if (!displayCanvas) return;

    const url = displayCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `hephaestus_${fileName.replace(/\.[^/.]+$/, '')}_edited.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Frame Export for Video frames
  const handleExportCurrentFrame = () => {
    handleSaveAsset();
  };

  // Video recording system using frame-by-frame canvas capturing streams!
  const handleExportVideo = async () => {
    const video = videoRef.current;
    const displayCanvas = document.querySelector('main canvas:not(.hidden)') as HTMLCanvasElement;
    if (!video || !displayCanvas) return;

    try {
      setIsRecording(true);
      setRecordingProgress(0);

      // Store initial video play state
      const wasPlaying = videoState.playing;
      if (wasPlaying) {
        video.pause();
        setVideoState((prev) => ({ ...prev, playing: false }));
      }

      // Capture stream from canvas at a fixed FPS
      const stream = displayCanvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hephaestus_${fileName.replace(/\.[^/.]+$/, '')}_trimmed.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setIsRecording(false);
        setRecordingProgress(0);

        // Reset video to original current time
        video.currentTime = videoState.startTime;
      };

      recorder.start();

      // Precision seek render step-by-step
      const durationToRecord = videoState.endTime - videoState.startTime;
      let cur = videoState.startTime;
      const step = 0.05; // 50ms frames

      const recordStep = () => {
        if (cur >= videoState.endTime) {
          recorder.stop();
          return;
        }

        video.currentTime = cur;
        setVideoState((prev) => ({ ...prev, currentTime: cur }));

        const progress = Math.min(Math.round(((cur - videoState.startTime) / durationToRecord) * 100), 99);
        setRecordingProgress(progress);

        cur += step;
        setTimeout(recordStep, 100); // 100ms interval for stable rendering before capture
      };

      recordStep();

    } catch (err) {
      console.error('Canvas MediaRecorder compilation error:', err);
      alert('Video export is not fully supported in this browser sandbox. Try exporting individual processed frames.');
      setIsRecording(false);
    }
  };

  // Package all currently loaded library files into a single ZIP for export
  const handleExportGalleryZIP = async () => {
    if (mediaFiles.length === 0) {
      alert("No files in the gallery to package.");
      return;
    }
    try {
      const zip = new JSZip();
      for (const mediaFile of mediaFiles) {
        if (mediaFile.fileObject) {
          zip.file(mediaFile.name, mediaFile.fileObject);
        } else {
          // If it's a preset URL, fetch the image or video blob
          try {
            const res = await fetch(mediaFile.url);
            const blob = await res.blob();
            zip.file(mediaFile.name, blob);
          } catch (e) {
            console.warn("Could not fetch file object directly for zip, skipping: ", mediaFile.name);
          }
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hephaestus_sacred_vault.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate gallery ZIP: ", err);
      alert("Failed to export the gallery ZIP.");
    }
  };

  const handleSaveWorkspaceState = () => {
    const state = {
      version: '1.0',
      fileName,
      fileType,
      hasFile,
      activeTool,
      adjustments,
      zoom,
      pan,
      imageDimensions,
      videoCrop,
      cloneSettings,
      scaleSettings,
      videoState,
      canvasDataUrl: null as string | null
    };

    if (fileType === 'image' && baseCanvasRef.current) {
      try {
        state.canvasDataUrl = baseCanvasRef.current.toDataURL('image/png');
      } catch (err) {
        console.warn('Failed to export canvas to JSON state', err);
      }
    }

    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const safeFileName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "workspace";
    link.href = url;
    link.download = `${safeFileName}_state.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleJsonFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.version !== '1.0') {
          if (!data.hasOwnProperty('adjustments') || !data.hasOwnProperty('activeTool')) {
            alert('Invalid workspace state file.');
            return;
          }
        }

        // Restore splash page state to Forge mode
        setShowInitialSplash(false);

        // Restore state fields
        if (data.fileName !== undefined) setFileName(data.fileName);
        if (data.fileType !== undefined) setFileType(data.fileType);
        if (data.hasFile !== undefined) setHasFile(data.hasFile);
        if (data.activeTool !== undefined) setActiveTool(data.activeTool);
        if (data.adjustments !== undefined) setAdjustments(data.adjustments);
        if (data.zoom !== undefined) setZoom(data.zoom);
        if (data.pan !== undefined) setPan(data.pan);
        if (data.imageDimensions !== undefined) setImageDimensions(data.imageDimensions);
        if (data.videoCrop !== undefined) setVideoCrop(data.videoCrop);
        if (data.cloneSettings !== undefined) setCloneSettings(data.cloneSettings);
        if (data.scaleSettings !== undefined) setScaleSettings(data.scaleSettings);
        if (data.videoState !== undefined) setVideoState(data.videoState);

        // Restore canvas image
        if (data.fileType === 'image' && data.canvasDataUrl) {
          const canvas = baseCanvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d')!;
            const img = new Image();
            img.src = data.canvasDataUrl;
            img.referrerPolicy = 'no-referrer';
            img.onload = () => {
              if (data.imageDimensions) {
                canvas.width = data.imageDimensions.width;
                canvas.height = data.imageDimensions.height;
              } else {
                canvas.width = img.width;
                canvas.height = img.height;
                setImageDimensions({ width: img.width, height: img.height });
              }
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              setHistoryStack([]);
              setCurrentHistoryIndex(-1);
              pushHistoryState(`Restore State: ${data.fileName || 'unnamed'}`, canvas);
            };
          }
        } else if (data.fileType === 'video') {
          const found = mediaFiles.find(f => f.name === data.fileName) || PRESETS.find(f => f.name === data.fileName);
          if (found && videoRef.current) {
            videoRef.current.src = found.url;
            videoRef.current.load();
          }
        }

      } catch (err) {
        console.error('Error loading workspace state:', err);
        alert('Failed to parse workspace state JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Keyboard shortcut modifiers (Undo/Redo, Tools toggles)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          handleUndo();
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
        }
        if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          handleSaveAsset();
        }
      } else {
        // Simple letter bounds (if not inputting)
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') {
          return;
        }
        if (e.key === 'h' || e.key === 'H' || e.key === 'v' || e.key === 'V') {
          setActiveTool('select');
        }
        if (e.key === 'c' || e.key === 'C') {
          setActiveTool('crop');
        }
        if (e.key === 's' || e.key === 'S') {
          setActiveTool('clone');
        }
        if (e.key === 'j' || e.key === 'J') {
          setActiveTool('heal');
        }
        if (e.key === 'i' || e.key === 'I') {
          setActiveTool('color_picker');
        }
        if (e.key === 'Escape') {
          setActiveTool('select');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [currentHistoryIndex, historyStack, activeTool]);

  return (
    <div className={`h-screen theme-${activeTheme} bg-custom-primary text-custom-primary flex flex-col font-sans overflow-hidden transition-colors duration-200`}>
      
      {/* Invisible file upload input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleMultipleFilesLoad(Array.from(e.target.files));
          }
        }}
        accept="image/*,video/*,.zip"
        multiple
        className="hidden"
      />

      {/* Invisible JSON workspace state input */}
      <input
        type="file"
        ref={jsonStateInputRef}
        onChange={handleJsonFileLoad}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Hidden background Video element for frame capture */}
      {fileType === 'video' && (
        <video
          ref={videoRef}
          crossOrigin="anonymous"
          className="hidden"
          playsInline
        />
      )}

      <AnimatePresence mode="wait">
        {showInitialSplash ? (
          <SplashPage key="initial-splash" onComplete={() => setShowInitialSplash(false)} />
        ) : !hasFile ? (
          /* SPLASH LANDING PAGE */
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto relative bg-custom-primary text-custom-primary transition-colors duration-200"
          >
            {/* Background glowing ambient light */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-custom-accent/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Left & Right Decorative Greek Temple Columns (Desktop Only) */}
            <div className="hidden xl:flex absolute left-8 top-12 bottom-12 w-20 flex-col justify-between items-center opacity-15 border-r border-dashed border-custom-gilded pointer-events-none select-none">
              <div className="w-16 h-6 bg-custom-gilded/30 rounded-t border-b border-custom-gilded" />
              <div className="flex-1 w-8 bg-gradient-to-r from-transparent via-custom-gilded/10 to-transparent border-x border-custom-gilded/20" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, var(--border-gilded) 4px, var(--border-gilded) 6px)'
              }} />
              <div className="w-16 h-8 bg-custom-gilded/30 rounded-b border-t border-custom-gilded" />
            </div>

            <div className="hidden xl:flex absolute right-8 top-12 bottom-12 w-20 flex-col justify-between items-center opacity-15 border-l border-dashed border-custom-gilded pointer-events-none select-none">
              <div className="w-16 h-6 bg-custom-gilded/30 rounded-t border-b border-custom-gilded" />
              <div className="flex-1 w-8 bg-gradient-to-r from-transparent via-custom-gilded/10 to-transparent border-x border-custom-gilded/20" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, var(--border-gilded) 4px, var(--border-gilded) 6px)'
              }} />
              <div className="w-16 h-8 bg-custom-gilded/30 rounded-b border-t border-custom-gilded" />
            </div>

            {/* Floating Top Bar for Theme Toggle inside landing page */}
            <div className="w-full max-w-4xl flex justify-end mb-6 relative z-20">
              <div className="flex items-center space-x-2 bg-custom-secondary/90 border border-custom-color/80 rounded-2xl p-1 shadow-md backdrop-blur-md">
                <span className="text-[10px] font-mono text-custom-secondary uppercase tracking-[0.15em] px-3 font-semibold">Forge Aesthetics:</span>
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3.5 py-2 rounded-xl transition-all text-xs font-mono font-bold flex items-center space-x-1.5 ${
                    theme === 'light' 
                      ? 'bg-gradient-to-r from-[#e25c24] to-[#f98435] text-white shadow-md' 
                      : 'hover:text-custom-primary text-custom-secondary hover:bg-custom-tertiary/60'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>IVORY</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3.5 py-2 rounded-xl transition-all text-xs font-mono font-bold flex items-center space-x-1.5 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-[#e25c24] to-[#f98435] text-white shadow-md' 
                      : 'hover:text-custom-primary text-custom-secondary hover:bg-custom-tertiary/60'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>OBSIDIAN</span>
                </button>
                <button
                  onClick={() => setTheme('phone')}
                  className={`px-3.5 py-2 rounded-xl transition-all text-xs font-mono font-bold flex items-center space-x-1.5 ${
                    theme === 'phone' 
                      ? 'bg-gradient-to-r from-[#e25c24] to-[#f98435] text-white shadow-md' 
                      : 'hover:text-custom-primary text-custom-secondary hover:bg-custom-tertiary/60'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>DEVICE</span>
                </button>
              </div>
            </div>

            <div className="max-w-4xl w-full space-y-8 sm:space-y-12 relative z-10 pb-12 sm:pb-16">
              
              {/* Header Branding */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-custom-accent to-[#ff8c42] rounded-[24px] sm:rounded-[32px] flex items-center justify-center shadow-xl shadow-[#e25c24]/15 relative overflow-hidden group shiny-gloss">
                  <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:6px_6px]" />
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
                </div>
                
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[0.15em] sm:tracking-[0.25em] font-serif text-center mt-2 bg-gradient-to-b from-custom-primary to-custom-accent bg-clip-text text-transparent">
                  HEPHAESTUS
                </h1>
                
                {/* Meander pattern line beneath the title */}
                <div className="w-44 sm:w-64 h-2 sm:h-2.5 greek-pattern opacity-60 rounded" />
                
                <p className="text-custom-secondary font-sans text-xs sm:text-sm max-w-xl text-center leading-relaxed font-medium px-2">
                  "Enter the divine blacksmith shop of Mount Olympus. Forge, remaster, dither, and reconstruct your images & video clips frame-by-frame with surgical mathematical precision. Zero AI illusions. Pure manual pixel artistry."
                </p>
              </div>

              {/* Main Interactive Row: Drag Drop Box & Preset Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
                
                {/* Drag and Drop Box */}
                <div className="flex flex-col justify-between p-1">
                  <motion.div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ 
                      scale: 1.01,
                      borderColor: '#e25c24',
                      boxShadow: '0 20px 50px rgba(226,92,36,0.18)'
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="flex-1 border-2 border-dashed border-[#e25c24]/20 bg-custom-secondary/45 hover:bg-custom-secondary/80 backdrop-blur-sm rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.15)] group flex flex-col items-center justify-center space-y-5 sm:space-y-6 transition-colors duration-300"
                  >
                    <div className="w-14 h-14 sm:w-18 sm:h-18 bg-custom-tertiary rounded-full flex items-center justify-center border border-custom-color group-hover:border-custom-accent/40 group-hover:scale-105 transition-all shadow-inner">
                      <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-custom-secondary group-hover:text-custom-accent transition-colors animate-bounce" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm sm:text-base font-bold text-custom-primary">Drag & drop your file here</p>
                      <p className="text-[10px] sm:text-xs text-custom-secondary mt-1">Supports images (.png, .jpg) and video clips (.mp4, .mov)</p>
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-white bg-gradient-to-r from-custom-accent to-[#f98435] hover:from-[#f98435] hover:to-[#ff945b] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-mono transition-all shadow-md active:scale-95">
                      Or Browse Local Directory
                    </span>
                  </motion.div>
                </div>

                {/* Classical Preset Masterpieces Column */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    scale: 1.01,
                    borderColor: 'rgba(226,92,36,0.35)'
                  }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="bg-custom-secondary/45 border border-custom-color rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 flex flex-col justify-between space-y-5 shadow-xl shadow-black/10 transition-colors duration-300"
                >
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold font-serif tracking-widest text-custom-primary uppercase mb-1 flex items-center space-x-2">
                      <span>🏛️</span>
                      <span>Classical Masterpieces</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-custom-secondary mb-4">
                      Select an ancient preset artifact to load the canvas instantly:
                    </p>

                    <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                      {PRESETS.map((preset, idx) => (
                        <motion.button
                          key={preset.name}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + idx * 0.08, duration: 0.25, ease: 'easeOut' }}
                          onClick={() => handleLoadPresetURL(preset.url, preset.type, preset.name)}
                          className="w-full text-left p-2 sm:p-2.5 bg-custom-tertiary/75 hover:bg-custom-accent/15 border border-custom-color hover:border-custom-accent/45 rounded-2xl flex items-center space-x-2.5 sm:space-x-3.5 group transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <span className="text-lg sm:text-xl bg-custom-secondary p-1 sm:p-1.5 rounded-xl border border-custom-color/80">{preset.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] sm:text-xs font-bold text-custom-primary truncate group-hover:text-custom-accent transition-colors">
                              {preset.name}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-custom-secondary truncate">
                              {preset.desc}
                            </p>
                          </div>
                          <span className="text-[8px] sm:text-[9px] bg-custom-secondary group-hover:bg-custom-accent group-hover:text-white border border-custom-color px-1.5 sm:px-2 py-0.5 rounded-lg text-custom-secondary font-mono transition-colors">
                            {preset.type.toUpperCase()}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Standard Procedural Demo and Resume State Links */}
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    <button
                      onClick={handleLoadDemoCanvas}
                      className="flex-1 bg-custom-tertiary/80 hover:bg-custom-accent/15 text-custom-primary text-[11px] sm:text-xs px-3 py-3 rounded-2xl font-mono flex items-center justify-center space-x-2 border border-custom-color active:scale-95 transition-all shadow-sm group font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-custom-accent group-hover:scale-110 transition-transform" />
                      <span>Calibration Pattern</span>
                    </button>

                    <button
                      onClick={() => jsonStateInputRef.current?.click()}
                      className="flex-1 bg-[#10b981]/10 hover:bg-[#10b981]/15 text-[#10b981] text-[11px] sm:text-xs px-3 py-3 rounded-2xl font-mono flex items-center justify-center space-x-2 border border-[#10b981]/25 active:scale-95 transition-all shadow-sm group font-bold"
                      title="Resume a saved workspace session (.json)"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#10b981] group-hover:scale-110 transition-transform" />
                      <span>Resume State (.json)</span>
                    </button>
                  </div>
                </motion.div>

              </div>

              {/* Meander decorative divider line */}
              <div className="h-2.5 greek-pattern opacity-40 rounded" />

              {/* Detailed Informative Feature Breakdown */}
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-widest text-center text-custom-primary uppercase">
                  ⚡ Inside The Media Blacksmith Forge
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <motion.div
                    initial={{ opacity: 0, y: 45, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ 
                      y: -6,
                      scale: 1.02,
                      borderColor: 'rgba(226,92,36,0.4)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
                    }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    className="bg-custom-secondary/45 border border-custom-color rounded-2xl p-6 space-y-4 shadow-md relative overflow-hidden group transition-colors duration-300"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-custom-accent/2 rounded-full blur-xl pointer-events-none" />
                    <div className="w-11 h-11 bg-custom-accent/10 rounded-xl flex items-center justify-center text-custom-accent group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5.5 h-5.5" />
                    </div>
                    <motion.h3 
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
                      className="text-sm font-bold font-serif tracking-wider uppercase text-custom-primary"
                    >
                      1. Color Depth Sanding
                    </motion.h3>
                    <p className="text-xs text-custom-secondary leading-relaxed">
                      Sand pixels down to true 16-bit, 8-bit, 4-bit, or 1-bit monochrome formats. Apply <strong>Floyd-Steinberg error diffusion</strong> or <strong>Ordered Bayer pattern</strong> dithering matrices to construct spatial shades.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 45, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ 
                      y: -6,
                      scale: 1.02,
                      borderColor: 'rgba(226,92,36,0.4)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
                    }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                    className="bg-custom-secondary/45 border border-custom-color rounded-2xl p-6 space-y-4 shadow-md relative overflow-hidden group transition-colors duration-300"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-custom-accent/2 rounded-full blur-xl pointer-events-none" />
                    <div className="w-11 h-11 bg-custom-accent/10 rounded-xl flex items-center justify-center text-custom-accent group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5.5 h-5.5" />
                    </div>
                    <motion.h3 
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
                      className="text-sm font-bold font-serif tracking-wider uppercase text-custom-primary"
                    >
                      2. Manual Grafting & Healing
                    </motion.h3>
                    <p className="text-xs text-custom-secondary leading-relaxed">
                      Manually graft and clone pixels over canvas coordinates. The healing brush integrates a <strong>mathematical luminance blending solver</strong> to seamlessly heal dust, hairs, scratches, or spots while matching destination lighting.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 45, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ 
                      y: -6,
                      scale: 1.02,
                      borderColor: 'rgba(226,92,36,0.4)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
                    }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                    className="bg-custom-secondary/45 border border-custom-color rounded-2xl p-6 space-y-4 shadow-md relative overflow-hidden group transition-colors duration-300"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-custom-accent/2 rounded-full blur-xl pointer-events-none" />
                    <div className="w-11 h-11 bg-custom-accent/10 rounded-xl flex items-center justify-center text-custom-accent group-hover:scale-110 transition-transform">
                      <Film className="w-5.5 h-5.5" />
                    </div>
                    <motion.h3 
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
                      className="text-sm font-bold font-serif tracking-wider uppercase text-custom-primary"
                    >
                      3. Chronos Video Engine
                    </motion.h3>
                    <p className="text-xs text-custom-secondary leading-relaxed">
                      Upscale, sharpen, and denoise video sources frame-by-frame with zero latency. Features hardware-accelerated rendering and frame extraction. Save, crop, and compile directly to local storage.
                    </p>
                  </motion.div>

                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* CREATIVE SUITE APP MODE */
          <motion.div
            key="forge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Global Dropdowns & Menus */}
            <GlobalToolbar
              onOpenFile={() => fileInputRef.current?.click()}
              onSaveFile={handleSaveAsset}
              onExportFrame={handleExportCurrentFrame}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={currentHistoryIndex > 0}
              canRedo={currentHistoryIndex < historyStack.length - 1}
              onResetAdjustments={handleResetAdjustments}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomReset={handleZoomReset}
              onZoomFit={handleZoomFit}
              onRotate={handleRotate}
              onFlip={handleFlip}
              hasFile={hasFile}
              fileType={fileType}
              onCloseFile={() => {
                setHasFile(false);
                setFileType(null);
                setHistoryStack([]);
                setCurrentHistoryIndex(-1);
              }}
              onCommitCrop={() => {
                // Let the crop coordinate resolver trigger it directly via event
                const event = new KeyboardEvent('keydown', { key: 'Enter' });
                window.dispatchEvent(event);
              }}
              canCommitCrop={activeTool === 'crop'}
              theme={theme}
              onThemeChange={setTheme}
              showGallery={showGallery}
              onToggleGallery={() => setShowGallery(!showGallery)}
              onSaveWorkspaceState={handleSaveWorkspaceState}
              onLoadWorkspaceState={() => jsonStateInputRef.current?.click()}
            />

            {/* Core Section Workspace */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              
              {/* Left sidebar toolbox */}
              <Toolbar
                activeTool={activeTool}
                onChangeTool={(t) => {
                  setActiveTool(t);
                  // Turn off setting source coordinates initially when changing tools
                  setCloneSettings((prev) => ({ ...prev, isSettingSource: false }));
                }}
                cloneSettings={cloneSettings}
                onChangeCloneSettings={(s) => setCloneSettings((prev) => ({ ...prev, ...s }))}
                onRotate={handleRotate}
                onFlip={handleFlip}
                hasFile={hasFile}
              />

              {/* Viewport & Controls vertical split container */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Viewport canvas center */}
                <Workspace
                  activeTool={activeTool}
                  adjustments={adjustments}
                  cloneSettings={cloneSettings}
                  onChangeCloneSettings={(s) => setCloneSettings((prev) => ({ ...prev, ...s }))}
                  videoState={videoState}
                  videoRef={videoRef}
                  baseCanvasRef={baseCanvasRef}
                  onCommitCrop={handleCommitCrop}
                  onModifyBaseImage={(actionName) => pushHistoryState(actionName)}
                  onColorPick={handleColorPickCalibration}
                  zoom={zoom}
                  setZoom={setZoom}
                  pan={pan}
                  setPan={setPan}
                  imageDimensions={imageDimensions}
                  setImageDimensions={setImageDimensions}
                  fileName={fileName}
                  videoCrop={videoCrop}
                />

                {/* Bottom adjustment drawers */}
                <ControlPanel
                  adjustments={adjustments}
                  onChangeAdjustments={handleModifyAdjustments}
                  scaleSettings={scaleSettings}
                  onChangeScaleSettings={(s) => setScaleSettings((prev) => ({ ...prev, ...s }))}
                  onApplyScale={handleApplyScale}
                  historyStack={historyStack}
                  currentHistoryIndex={currentHistoryIndex}
                  onJumpToHistory={jumpToHistory}
                  hasFile={hasFile}
                  imageDimensions={imageDimensions}
                  fileType={fileType}
                  videoState={videoState}
                  onChangeVideoState={(s) => setVideoState((prev) => ({ ...prev, ...s }))}
                />
              </div>

              {/* Right Sidebar: Archival Vault (Collapsible Gallery) */}
              <AnimatePresence>
                {showGallery && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full bg-custom-secondary border-l border-custom-color flex flex-col overflow-hidden relative z-40 transition-colors duration-200 shadow-xl"
                  >
                    <div className="p-4 border-b border-custom-color flex justify-between items-center bg-custom-tertiary">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold font-serif tracking-widest text-custom-primary">
                          🏛️ VAULT OF ARTISANS
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-custom-accent/15 text-custom-accent font-semibold">
                          {mediaFiles.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowGallery(false)}
                        className="p-1 rounded hover:bg-custom-color text-custom-secondary hover:text-custom-primary transition-colors text-xs font-mono font-semibold"
                        title="Close Gallery Drawer"
                      >
                        × COLLAPSE
                      </button>
                    </div>

                    <div className="p-3 border-b border-custom-color flex flex-col space-y-2 bg-custom-secondary">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 bg-custom-accent hover:bg-custom-accent/90 text-white text-xs font-mono font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow active:scale-95 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>IMPORT ARTIFACT / ZIP</span>
                      </button>

                      <button
                        onClick={() => jsonStateInputRef.current?.click()}
                        className="w-full py-2 bg-custom-tertiary hover:bg-custom-accent/10 border border-custom-color text-custom-primary hover:text-custom-accent text-xs font-mono font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                        title="Resume workspace session from a saved .json state file"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>RESUME WORKSPACE (.JSON)</span>
                      </button>
                      
                      {mediaFiles.length > 0 && (
                        <button
                          onClick={handleExportGalleryZIP}
                          className="w-full py-2 bg-custom-tertiary hover:bg-custom-accent/10 border border-custom-color text-custom-primary hover:text-custom-accent text-xs font-mono font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5 text-custom-accent" />
                          <span>PACKAGE ARCHIVE AS ZIP</span>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {mediaFiles.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-custom-color rounded-xl">
                          <Library className="w-8 h-8 text-custom-secondary mb-2 animate-bounce" />
                          <p className="text-xs font-bold text-custom-primary">Your Vault is Empty</p>
                          <p className="text-[10px] text-custom-secondary mt-1">
                            Drag & drop multiple images, video files, or zip archives here.
                          </p>
                        </div>
                      ) : (
                        <AnimatePresence initial={false}>
                          {mediaFiles.map((file) => {
                            const isSelected = fileName === file.name;
                            return (
                              <motion.div
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                key={file.id}
                                onClick={() => loadLibraryFile(file)}
                                className={`group relative p-2.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                                  isSelected
                                    ? 'bg-custom-accent/10 border-custom-accent shadow-md shadow-custom-accent/5'
                                    : 'bg-custom-tertiary/40 border-custom-color hover:border-custom-accent/30 hover:bg-custom-tertiary/80'
                                }`}
                              >
                                {/* Thumbnail preview */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-custom-color flex items-center justify-center relative flex-shrink-0">
                                  {file.type === 'image' ? (
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                      <Film className="w-5 h-5 text-custom-accent" />
                                      <span className="absolute bottom-0 right-0 text-[8px] bg-black/60 text-white px-1 py-0.5 rounded font-mono">
                                        VID
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* File Details */}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-bold truncate ${
                                    isSelected ? 'text-custom-accent' : 'text-custom-primary'
                                  }`}>
                                    {file.name}
                                  </p>
                                  <p className="text-[10px] text-custom-secondary uppercase tracking-wider font-mono mt-0.5">
                                    {file.type}
                                  </p>
                                </div>

                                {/* Delete button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Remove file from mediaFiles
                                    const updated = mediaFiles.filter((f) => f.id !== file.id);
                                    setMediaFiles(updated);
                                    if (fileName === file.name) {
                                      // If active file was deleted, load next one or clear
                                      if (updated.length > 0) {
                                        loadLibraryFile(updated[0]);
                                      } else {
                                        setHasFile(false);
                                        setFileType(null);
                                      }
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-custom-secondary hover:text-red-500 transition-all absolute top-2 right-2"
                                  title="Remove artifact from vault"
                                >
                                  <span className="text-xs font-bold font-sans">×</span>
                                </button>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      )}
                    </div>

                    {/* Meander decorative border in bottom */}
                    <div className="h-2 bg-[#e25c24]/10" />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Bottom Timeline Controls for Videos */}
            {fileType === 'video' && (
              <VideoTimeline
                videoState={videoState}
                onChangeVideoState={(s) => {
                  setVideoState((prev) => {
                    const next = { ...prev, ...s };
                    const video = videoRef.current;
                    if (video) {
                      if (s.currentTime !== undefined) {
                        video.currentTime = s.currentTime;
                      }
                      if (s.playbackRate !== undefined) {
                        video.playbackRate = s.playbackRate;
                      }
                      if (s.playing !== undefined) {
                        if (s.playing) {
                          // Loop within trim margins
                          if (video.currentTime >= prev.endTime || video.currentTime < prev.startTime) {
                            video.currentTime = prev.startTime;
                          }
                          // Keep playbackRate synced
                          video.playbackRate = next.playbackRate || 1.0;
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }
                    return next;
                  });
                }}
                onStepFrame={handleStepFrame}
                onExportVideo={handleExportVideo}
                isRecording={isRecording}
                recordingProgress={recordingProgress}
              />
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
