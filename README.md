# 💅 Uñimas Spa - Sistema de Citas

Sistema moderno y estético para gestión de citas en Uñimas Spa. Construido con React, TypeScript, Tailwind CSS y conectado a una API REST completa.

## ✨ Características

### Para Clientes
- 📅 **Agendar citas** con selección de servicios, técnico, fecha y hora
- 📋 **Ver historial** de citas agendadas, completadas y canceladas
- ✅ **Gestionar citas** (cancelar, ver detalles)
- 💰 **Ver precios** y duración estimada

### Para Técnicos
- 🗓️ **Agenda diaria** con todas las citas programadas
- ✅ **Gestionar citas** (completar, cancelar)
- 📊 **Resumen del día** con ganancias y estadísticas
- 👥 **Ver clientes** con información de contacto

### Para Administradores
- 📊 **Dashboard completo** con estadísticas generales
- 👥 **Gestión de usuarios** (clientes, técnicos, admins)
- 💅 **Gestión de servicios** y categorías
- 📅 **Gestión de citas** con vista completa
- 📈 **Reportes y métricas** del negocio

## 🚀 Tecnologías

- **React 19** - Framework frontend moderno
- **TypeScript** - Tipado estático para mejor DX
- **Vite 7** - Build tool ultra rápido
- **Tailwind CSS 4** - Estilos utility-first modernos
- **Lucide React** - Iconos SVG livianos y escalables (sin Ionic)
- **Zustand** - Gestión de estado simple y eficiente
- **React Router 7** - Navegación client-side
- **Axios** - Cliente HTTP con interceptores
- **date-fns** - Manipulación de fechas
- **Capacitor** (Opcional) - Compilación nativa para iOS/Android

## 📦 Instalación

1. Clona el repositorio:
\`\`\`bash
git clone <repository-url>
cd Frontend
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Configura las variables de entorno:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Edita el archivo \`.env\` con la URL de tu API:
\`\`\`
VITE_API_URL=http://localhost:8000/api
\`\`\`

## 🎯 Uso

### Modo Desarrollo
\`\`\`bash
npm run dev
\`\`\`
La aplicación estará disponible en \`http://localhost:3000\`

### Build para Producción
\`\`\`bash
npm run build
\`\`\`

### Preview de Producción
\`\`\`bash
npm run preview
\`\`\`

## 📂 Estructura del Proyecto

\`\`\`
src/
├── components/          # Componentes reutilizables
│   ├── admin/          # Componentes para administradores
│   ├── client/         # Componentes para clientes
│   ├── Layout.tsx      # Layout principal
│   └── ProtectedRoute.tsx
├── pages/              # Páginas principales
│   ├── admin/          # Dashboard administrador
│   ├── client/         # Dashboard cliente
│   ├── technician/     # Dashboard técnico
│   ├── Login.tsx
│   └── Register.tsx
├── lib/                # Utilidades y configuración
│   └── api.ts          # Cliente API y tipos
├── store/              # Estado global (Zustand)
│   └── authStore.ts
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales
\`\`\`

## 🎨 Diseño Mobile-First

La aplicación cuenta con un diseño **completamente moderno y mobile-first**:

- **Sin Ionic UI**: Interfaz personalizada usando solo Tailwind CSS y Lucide React
- **Colores primarios**: Rosa (#ec4899) y Púrpura (#a855f7) con gradientes
- **Tipografía**: Inter (Google Fonts) con tamaños responsive
- **Glassmorphism**: Cards con backdrop-blur y transparencias
- **Touch-Friendly**: Todos los elementos interactivos con mínimo 44px
- **Feedback Táctil**: Efectos `active:scale-95` para mejor UX móvil
- **Safe Areas**: Soporte para notch y home indicator
- **Scroll Horizontal**: En filtros y tabs para mejor uso en móvil
- **Animaciones**: Transiciones suaves con Tailwind
- **100% Responsive**: Optimizado desde 320px hasta desktop

### Características Mobile

- ✅ Menú hamburguesa responsive
- ✅ Navegación optimizada para pulgar
- ✅ Modales full-screen en móvil
- ✅ Grid adaptativo con breakpoints
- ✅ Componentes touch-optimized
- ✅ Teclado virtual friendly

## 🔐 Autenticación

El sistema maneja tres roles de usuario:

1. **CLIENT** - Clientes del spa
2. **TECHNICIAN** - Técnicos/empleados
3. **ADMIN** - Administradores

Cada rol tiene acceso a diferentes funcionalidades y vistas.

## 📱 Rutas

- \`/login\` - Inicio de sesión
- \`/register\` - Registro de nuevos clientes
- \`/client/dashboard\` - Dashboard de clientes
- \`/technician/dashboard\` - Dashboard de técnicos
- \`/admin/dashboard\` - Dashboard de administradores

## 🔌 Integración con API

La aplicación se conecta con el backend a través de:

- **Base URL**: Configurada en \`.env\`
- **Auth**: JWT Token en header \`Authorization: Bearer {token}\`
- **Endpoints**: Usuarios, Servicios, Categorías, Citas

Ver \`src/lib/api.ts\` para todos los endpoints disponibles.

## 📱 Compilación Móvil (Capacitor)

Para compilar la aplicación como app nativa para iOS/Android, sigue estos pasos:

### 1. Instalar Capacitor
\`\`\`bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor/splash-screen @capacitor/status-bar
\`\`\`

### 2. Compilar y sincronizar
\`\`\`bash
npm run build
npx cap sync
\`\`\`

### 3. Agregar plataformas
\`\`\`bash
npx cap add android  # Para Android
npx cap add ios      # Para iOS (requiere macOS)
\`\`\`

### 4. Abrir en IDE nativo
\`\`\`bash
npx cap open android  # Abre Android Studio
npx cap open ios      # Abre Xcode (solo macOS)
\`\`\`

**Nota**: El archivo \`capacitor.config.ts\` ya está configurado. Para más detalles, consulta \`capacitor-setup.md\`.

## 🛠️ Desarrollo

### Agregar un nuevo componente
\`\`\`typescript
// src/components/MiComponente.tsx
export default function MiComponente() {
  return <div>Hola Mundo</div>
}
\`\`\`

### Usar el store de autenticación
\`\`\`typescript
import { useAuthStore } from '@/store/authStore'

const { user, isAuthenticated, logout } = useAuthStore()
\`\`\`

### Hacer una llamada a la API
\`\`\`typescript
import { appointmentsAPI } from '@/lib/api'

const appointments = await appointmentsAPI.getAll()
\`\`\`

## 📄 Licencia

© 2025 Uñimas Spa. Todos los derechos reservados.

## 👨‍💻 Autor

Desarrollado con ❤️ para Uñimas Spa
