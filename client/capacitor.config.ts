import type { CapacitorConfig } from '@capacitor/cli';

// NearBee is a server-rendered TanStack Start app (auth, API calls, etc. all
// need the Node/Nitro server), so Capacitor can't just bundle static files
// like a plain SPA. Instead, in development the WebView loads the app
// straight from the already-running dev server, reached via the special
// 10.0.2.2 alias Android emulators use to mean "the host machine's
// localhost". For a real device or production build, replace `server.url`
// with your deployed HTTPS domain (e.g. https://nearbee.app) and drop
// `cleartext` since that only exists to allow the http:// dev URL.
const config: CapacitorConfig = {
  appId: 'com.nearbee.app',
  appName: 'NearBee',
  webDir: '.output/public',
  server: {
    url: 'http://10.0.2.2:3000',
    cleartext: true,
  },
};

export default config;
