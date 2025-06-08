import '@testing-library/jest-dom';
import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Web Audio API for tests
const mockAudioContext = {
  createGain: vi.fn().mockReturnValue({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  createOscillator: vi.fn().mockReturnValue({
    frequency: { value: 440 },
    type: 'sine',
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }),
  createAnalyser: vi.fn().mockReturnValue({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getFloatFrequencyData: vi.fn(),
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
  }),
  createBufferSource: vi.fn().mockReturnValue({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }),
  createBuffer: vi.fn(),
  decodeAudioData: vi.fn().mockResolvedValue({}),
  destination: {},
  sampleRate: 44100,
  currentTime: 0,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
};

// Mock MediaDevices API
const mockMediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: vi.fn().mockReturnValue([]),
    getAudioTracks: vi.fn().mockReturnValue([]),
    getVideoTracks: vi.fn().mockReturnValue([]),
  }),
  enumerateDevices: vi.fn().mockResolvedValue([]),
};

// Setup global mocks
beforeEach(() => {
  (global as any).AudioContext = vi
    .fn()
    .mockImplementation(() => mockAudioContext);
  (global as any).webkitAudioContext = vi
    .fn()
    .mockImplementation(() => mockAudioContext);
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: mockMediaDevices,
    writable: true,
  });
  Object.defineProperty(global.URL, 'createObjectURL', {
    value: vi.fn().mockReturnValue('blob:mock-url'),
    writable: true,
  });
  Object.defineProperty(global.URL, 'revokeObjectURL', {
    value: vi.fn(),
    writable: true,
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
