import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'hyeandang',
  brand: {
    displayName: '혜안당 운세',
    primaryColor: '#A3845B',
    icon: 'https://saju.artpani.com/scratch/toss_assets/logo_light.png',
  },
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'npx vite',
      build: 'npx vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    allowsInlineMediaPlayback: true,
    bounces: false,
    pullToRefreshEnabled: true,
  },
});
