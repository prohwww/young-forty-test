import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'young40-test',
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'rsbuild dev',
      build: 'rsbuild build',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '영포티 테스트',
    icon: 'https://raw.githubusercontent.com/prohwww/young-forty-test/master/public/icon.png',
    primaryColor: '#7C3AED',
    bridgeColorMode: 'inverted',
  },
  webViewProps: {
    type: 'partner',
  },
});
