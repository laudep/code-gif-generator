export interface GifConfiguration {
  width: number;
  height: number;
  framerate: number;
  delay: number;
  scrollPercentage: number;
  compression: undefined | 'lossless' | 'lossy' | '' | false;
  maximumScreenshotCount: number;
}

export interface Preset extends GifConfiguration {
  name: string;
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

export const PRESETS: Preset[] = [
  {
    ...DEFAULT_PRESET,
    name: 'fast',
    framerate: 15,
    delay: 270,
    scrollPercentage: 20,
  },
  DEFAULT_PRESET,
  {
    ...DEFAULT_PRESET,
    name: 'ultra',
    framerate: 7,
    delay: 120,
    scrollPercentage: 2,
  },
];
