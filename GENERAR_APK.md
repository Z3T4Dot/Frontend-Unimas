# Guía para Generar el APK de Uñimas Spa

## Estado Actual

✅ **Completado:**
- Capacitor instalado y configurado
- Plugins de SplashScreen y StatusBar agregados
- Plataforma Android agregada
- Build de producción generado (`dist/`)
- Proyecto sincronizado con Capacitor

## Requisitos Previos para Generar el APK

Para generar el APK necesitas tener instalado:

### 1. Android Studio y Android SDK

**Opción A: Instalar Android Studio (Recomendado)**
1. Descarga Android Studio desde: https://developer.android.com/studio
2. Instala Android Studio
3. Durante la instalación, asegúrate de seleccionar:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (opcional, para pruebas)
4. Al abrir Android Studio por primera vez, seguirá un asistente que descargará los componentes necesarios

**Opción B: Instalar solo Android SDK Command Line Tools**
1. Descarga desde: https://developer.android.com/studio#command-tools
2. Extrae en una carpeta (ej: `C:\Android\cmdline-tools`)
3. Configura las variables de entorno (ver abajo)

### 2. Configurar Variables de Entorno

Necesitas configurar la variable `ANDROID_HOME`:

**En Windows:**
1. Busca "Variables de entorno" en el menú de inicio
2. Click en "Variables de entorno"
3. En "Variables del sistema", click en "Nueva"
4. Nombre de la variable: `ANDROID_HOME`
5. Valor de la variable: Ruta donde instalaste el SDK (ej: `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk`)
6. Click en "Aceptar"
7. Agrega a la variable `Path`:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

**Verificar instalación:**
```bash
# Abre una nueva terminal (PowerShell o CMD) y ejecuta:
android --version
# o
adb version
```

### 3. Instalar Java JDK

Android Studio generalmente incluye el JDK. Si no lo tienes:

1. Descarga JDK 17 desde: https://www.oracle.com/java/technologies/downloads/#java17
2. Instala el JDK
3. Configura la variable `JAVA_HOME`:
   - Nombre: `JAVA_HOME`
   - Valor: Ruta de instalación del JDK (ej: `C:\Program Files\Java\jdk-17`)

---

## Pasos para Generar el APK

Una vez que tengas todo instalado:

### 1. Abrir el Proyecto en Android Studio

```bash
# Desde la raíz del proyecto Frontend:
npx cap open android
```

Esto abrirá el proyecto en Android Studio.

### 2. Esperar a que Gradle Sincronice

Cuando se abra Android Studio:
- Espera a que termine de sincronizar Gradle (verás una barra de progreso abajo)
- Si hay errores de dependencias, Android Studio los resolverá automáticamente

### 3. Generar APK Debug (para pruebas)

**Opción A: Desde Android Studio**
1. En el menú: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. Espera a que compile (puede tomar varios minutos la primera vez)
3. Cuando termine, verás una notificación con un link "locate"
4. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

**Opción B: Desde la consola**
```bash
cd android
./gradlew assembleDebug
```

El APK se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Generar APK Release (para producción)

**IMPORTANTE**: Para generar un APK de release necesitas firmar la app.

#### Crear Keystore (solo la primera vez)

```bash
keytool -genkey -v -keystore unimas-release.keystore -alias unimas -keyalg RSA -keysize 2048 -validity 10000
```

Guarda la contraseña y el archivo `.keystore` en un lugar seguro.

#### Configurar Firma

1. Crea el archivo `android/key.properties`:
```properties
storePassword=TU_CONTRASEÑA_KEYSTORE
keyPassword=TU_CONTRASEÑA_KEY
keyAlias=unimas
storeFile=../unimas-release.keystore
```

2. Modifica `android/app/build.gradle`:

Busca el bloque `android {` y agrega antes de `buildTypes`:

```gradle
android {
    // ... configuración existente ...

    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("key.properties")
            def keystoreProperties = new Properties()
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Generar APK Release

```bash
cd android
./gradlew assembleRelease
```

El APK firmado estará en: `android/app/build/outputs/apk/release/app-release.apk`

---

## Comandos Rápidos (una vez configurado)

```bash
# Desde la raíz del proyecto Frontend:

# 1. Hacer cambios en el código...

# 2. Rebuild del proyecto
npm run build

# 3. Sincronizar con Capacitor
npx cap sync android

# 4. Abrir en Android Studio (opcional)
npx cap open android

# 5. Generar APK debug
cd android && ./gradlew assembleDebug && cd ..

# 6. O generar APK release
cd android && ./gradlew assembleRelease && cd ..
```

---

## Instalar APK en Dispositivo Android

### Vía USB (ADB):
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Vía Archivo:
1. Copia el APK a tu dispositivo Android
2. Abre el archivo desde el explorador de archivos
3. Permite instalar desde "Orígenes desconocidos" si te lo pide
4. Instala la app

---

## Solución de Problemas Comunes

### Error: "SDK location not found"
- **Solución**: Configura la variable `ANDROID_HOME` como se explicó arriba

### Error: "Non-ASCII characters in path"
- **Solución**: Ya configurado en `android/gradle.properties` con `android.overridePathCheck=true`

### Error: "Gradle sync failed"
- **Solución**: Abre el proyecto en Android Studio y espera a que sincronice automáticamente

### Error: "Command failed: gradlew"
- **Solución**: Asegúrate de estar en la carpeta `android/` y que el archivo `gradlew` tenga permisos de ejecución

### APK muy grande
- **Solución**: Usa APK splits o App Bundle para reducir el tamaño:
  ```bash
  ./gradlew bundleRelease  # Genera un .aab en lugar de .apk
  ```

---

## Publicar en Google Play Store

Para publicar la app en Google Play:

1. **Genera un Android App Bundle** (recomendado por Google):
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. El archivo `.aab` estará en: `android/app/build/outputs/bundle/release/app-release.aab`

3. Sube el `.aab` a Google Play Console:
   - Crea una cuenta de desarrollador ($25 USD único pago)
   - Crea una nueva aplicación
   - Sube el `.aab`
   - Completa la información requerida (descripción, screenshots, etc.)
   - Envía para revisión

---

## Notas Importantes

- El build inicial puede tomar **5-15 minutos** mientras Gradle descarga dependencias
- Builds subsecuentes serán mucho más rápidos
- El APK de debug es solo para pruebas, **no lo publiques en producción**
- Guarda tu archivo `.keystore` en un lugar seguro, si lo pierdes no podrás actualizar la app
- El archivo `key.properties` **NO** debe subirse a Git (ya está en `.gitignore`)

---

## Recursos Adicionales

- [Documentación de Capacitor](https://capacitorjs.com/docs/android)
- [Documentación de Android Studio](https://developer.android.com/studio/intro)
- [Guía de firma de apps](https://developer.android.com/studio/publish/app-signing)
- [Publicar en Google Play](https://developer.android.com/distribute/console)
