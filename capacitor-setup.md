# Configuración de Capacitor para Uñimas Spa

## Instalación de Capacitor

Para instalar Capacitor y compilar la aplicación para móvil, sigue estos pasos:

### 1. Instalar Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor/splash-screen @capacitor/status-bar
```

### 2. Inicializar Capacitor (solo primera vez)

```bash
npx cap init
```

### 3. Construir la aplicación web

```bash
npm run build
```

### 4. Agregar plataformas

Para Android:
```bash
npx cap add android
```

Para iOS:
```bash
npx cap add ios
```

### 5. Sincronizar cambios

Después de cada cambio en el código web:

```bash
npm run build
npx cap sync
```

### 6. Abrir en el IDE nativo

Para Android (Android Studio):
```bash
npx cap open android
```

Para iOS (Xcode - solo en Mac):
```bash
npx cap open ios
```

## Scripts útiles para package.json

Puedes agregar estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "build:mobile": "vite build && npx cap sync",
    "android": "npm run build:mobile && npx cap open android",
    "ios": "npm run build:mobile && npx cap open ios"
  }
}
```

## Optimizaciones Mobile

El proyecto ya está optimizado para móvil con:

- ✅ Diseño mobile-first con Tailwind CSS
- ✅ Componentes touch-friendly (44px mínimo)
- ✅ Navegación optimizada para pantallas pequeñas
- ✅ Scroll horizontal para filtros y tabs
- ✅ Safe area para notch/home indicator
- ✅ Active states con scale para feedback táctil
- ✅ Iconos de Lucide React (livianos y escalables)
- ✅ Sin dependencias de Ionic UI (solo Capacitor para compilación nativa)

## PWA (Progresiva Web App)

Si prefieres una PWA en lugar de una app nativa, considera usar Vite PWA plugin:

```bash
npm install vite-plugin-pwa -D
```

## Testing en dispositivos

Para probar en dispositivos reales sin compilar:

1. Asegúrate de que tu computadora y dispositivo estén en la misma red
2. Ejecuta `npm run dev -- --host`
3. Accede desde el dispositivo usando la IP local (ej: http://192.168.1.100:5173)
