import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'SOS App',
  webDir: 'dist',
  plugins: {
  FirebaseX: {
    senderId: '690835812602'
  }
}
};

export default config;
