import { defineConfig } from 'vitest/config';

export default defineConfig({
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
