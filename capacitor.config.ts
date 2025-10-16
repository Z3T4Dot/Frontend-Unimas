import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.unimasspa.app',
  appName: 'Uñimas Spa',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',

    // ✅ Permite a la app contactar al backend y frontend
    allowNavigation: [
      'https://back-unimas-v2.up.railway.app',
      'https://front-unimas-v2.up.railway.app',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ec4899",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ec4899',
    },
  },
};

export default config;
