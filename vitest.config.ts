import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
      generated: resolve(__dirname, 'generated'),
    },
  },
  test: {
    name: 'unit',
    include: ['src/**/*.unit.spec.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      './temp/**',
      './test/**',
      './generated/**',
    ],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 91,
        branches: 85,
      },
      // include: ['src/**/*.unit.spec.ts'],
      exclude: ['./generated/**'],
    },
  },
});
