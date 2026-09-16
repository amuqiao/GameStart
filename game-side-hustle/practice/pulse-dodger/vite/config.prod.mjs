import { defineConfig } from 'vite';

export default defineConfig({
  // CrazyGames 技术要求:bundle 内部只能用相对路径,绝对路径一律禁止。
  // 官方 Phaser 模板已经这么配,这里保持一致。
  base: './',
  logLevel: 'warn',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // phaser 单独切块,方便观察引擎体积占比(约 1.1MB gzip 前)
        manualChunks: { phaser: ['phaser'] },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2, drop_debugger: true },
      mangle: true,
      format: { comments: false },
    },
  },
});
