import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.unimas.app",
  appName: "Unimas Mobile",
  webDir: "dist",
  server: {
    // Para desarrollo con Vite + emulador Android:
    // url: 'http://10.0.2.2:5173',
    // cleartext: true,
  },
};

export default config;
