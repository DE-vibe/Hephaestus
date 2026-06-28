export type ToolType = 'select' | 'crop' | 'clone' | 'heal' | 'color_picker';

export interface FilterAdjustments {
  contrast: number;      // -100 to 100
  brightness: number;    // -100 to 100
  hue: number;           // -180 to 180
  saturation: number;    // -100 to 100
  sharpen: number;       // 0 to 100
  blur: number;          // 0 to 100
  noiseReduction: number; // 0 to 100 (median/denoise pass)
  colorDepth: 'original' | '16bit' | '8bit' | '4bit' | '2bit' | '1bit';
  dither: 'none' | 'floyd-steinberg' | 'ordered';
  redChannel: number;    // -100 to 100 (RGB Gains)
  greenChannel: number;  // -100 to 100
  blueChannel: number;   // -100 to 100
}

export const INITIAL_ADJUSTMENTS: FilterAdjustments = {
  contrast: 0,
  brightness: 0,
  hue: 0,
  saturation: 0,
  sharpen: 0,
  blur: 0,
  noiseReduction: 0,
  colorDepth: 'original',
  dither: 'none',
  redChannel: 0,
  greenChannel: 0,
  blueChannel: 0,
};

export interface ScaleSettings {
  factor: number; // 0.25, 0.5, 1, 2, 4
  interpolation: 'nearest' | 'bilinear';
}

export interface CloneStampSettings {
  brushSize: number; // 5 to 100
  brushStrength: number; // 0.1 to 1.0 (opacity)
  sourcePoint: { x: number; y: number } | null;
  isSettingSource: boolean;
}

export interface HealSettings {
  brushSize: number;
}

export interface VideoState {
  playing: boolean;
  currentTime: number;
  duration: number;
  startTime: number; // trim start
  endTime: number;   // trim end
  fps: number;
  upscaleFactor?: number; // 1.0, 1.5, 2.0, 4.0
  upscaleMethod?: 'nearest' | 'bilinear';
  enhanceContrast?: boolean;
  enhanceSharpen?: number; // 0 to 100
  enhanceDenoise?: number; // 0 to 100
}

export interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  // A snapshot of the base image canvas state (stored as ImageData or canvas dataURL)
  imageDataURL: string;
  adjustments: FilterAdjustments;
  width: number;
  height: number;
}

export interface LibraryFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  fileObject?: File;
}

