export interface GifConfiguration {
  width: number;
  height: number;
  framerate: number;
  delay: number;
  scrollPercentage: number;
  compression: undefined | 'lossless' | 'lossy' | '' | false;
  maximumScreenshotCount: number;
}

export type PresetName = 'fast' | 'default' | 'smooth' | 'ultra';

export interface Preset extends GifConfiguration {
  name: PresetName;
}

export const DEFAULT_PRESET: Preset = {
  name: 'default',
  width: 1280,
  height: 720,
  framerate: 15,
  delay: 360,
  scrollPercentage: 10,
  compression: false,
  maximumScreenshotCount: 100,
};

export const SMOOTH_PRESET: Preset = {
  ...DEFAULT_PRESET,
  name: 'smooth',
  framerate: 7,
  delay: 120,
  scrollPercentage: 2,
};

export const PRESETS: Preset[] = [
  {
    ...DEFAULT_PRESET,
    name: 'fast',
    framerate: 15,
    delay: 270,
    scrollPercentage: 20,
  },
  DEFAULT_PRESET,
  SMOOTH_PRESET,
  {
    ...SMOOTH_PRESET,
    name: 'ultra',
    maximumScreenshotCount: 250,
  },
];
