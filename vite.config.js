import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const noExternal = [
  '@mui/material',
  '@mui/utils',
  '@mui/system',
  '@mui/icons-material',
  '@mui/styled-engine',
  '@emotion/react',
  '@emotion/styled',
  '@emotion/cache'
];

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      '@emotion/react': path.resolve(
        __dirname,
        'node_modules/@emotion/react'
      ),
      '@emotion/styled': path.resolve(
        __dirname,
        'node_modules/@emotion/styled'
      ),
      '@emotion/cache': path.resolve(
        __dirname,
        'node_modules/@emotion/cache'
      ),
    },
  },
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
      '@mui/material',
      '@mui/icons-material',
      '@mui/system',
    ],
    force: true,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.jsx'),
      name: 'TasksManagement',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'redux',
        'redux-api-middleware',
        'react-redux',
        'react-intl',
        'prop-types',
        'moment',
        'lodash',
        /^lodash\/.*/,
        'lodash-uuid',
        'classnames',
        'clsx',
        'react-autosuggest',
        'react-router',
        'react-router-dom',
        'history',
        '@emotion/react',
        '@emotion/styled',
        '@emotion/cache',
        '@mui/material',
        '@mui/icons-material',
        '@mui/system',
        /^@babel.*/,
        /^@date-io\/.*/,
        /^@material-ui\/.*/,
        /^@openimis.*/,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@emotion/react': 'EmotionReact',
          '@emotion/styled': 'EmotionStyled',
          '@mui/material': 'MuiMaterial',
        },
      },
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
  ssr: {
    noExternal,
  },
});
