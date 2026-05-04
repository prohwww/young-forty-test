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
    displayName: '나는 어떤 영포티?',
    icon: 'https://static.toss.im/appsintoss/73/10550764-5ac1-44e2-9ff3-ad78d8d2e71a.png', // 아이콘 URL로 변경하세요
    primaryColor: '#7C3AED',
    bridgeColorMode: 'inverted',
  },
  webViewProps: {
    type: 'partner',
  },
});
