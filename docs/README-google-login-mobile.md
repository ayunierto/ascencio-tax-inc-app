# README - Configuracion Completa de Google Login (Mobile)

Este documento describe, paso a paso, como dejar funcionando Google Sign-In en la app mobile para los 3 escenarios:

1. `debug` local
2. `preview` (EAS internal builds)
3. `production` (build publicada en Google Play)

## Nota iOS (simulador y dispositivo)

En iOS, `@react-native-google-signin/google-signin` necesita uno de estos 2 enfoques:

1. `GoogleService-Info.plist` integrado en el proyecto nativo, o
2. pasar `iosClientId` en `GoogleSignin.configure(...)`

Este proyecto usa el enfoque 2 para Expo managed, por lo que debes definir:

- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<tu_oauth_ios_client_id>`
- plugin Expo en `app.json` con `iosUrlScheme` (reversed client id), por ejemplo:
  `com.googleusercontent.apps.xxxxx` (valor `REVERSED_CLIENT_ID` del `GoogleService-Info.plist`)

Si este valor falta, verás el error:

`RNGoogleSignin: failed to determine clientID - GoogleService-Info.plist was not found and iosClientId was not provided`

Si falta el URL scheme, verás:

`Your app is missing support for the following URL schemes: com.googleusercontent.apps...`

## 1. Objetivo tecnico

Para que Google Login funcione en Android de forma estable, debes registrar en Google Cloud Console y Firebase las huellas (`SHA-1` y `SHA-256`) de los certificados que firman la app en cada flujo real.

En tu caso, hay 3 "familias" de certificado:

1. Certificado `debug` local
2. Certificado `upload/release` de EAS
3. Certificado `App Signing` de Google Play (production real distribuida por Play)

Si falta cualquiera de estas en la configuracion de OAuth/Firebase, el login puede funcionar en un entorno y fallar en otro.

## 2. Estado actual del proyecto

Ya tienes automatizado en el repo:

1. Script para extraer huellas: `npm run google:sha`
2. Script fuente: `scripts/google-signin/collect-android-fingerprints.mjs`

Huellas detectadas actualmente:

### 2.1 Debug local

- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- SHA-256: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

### 2.2 Release/Upload (EAS)

- SHA-1: `D8:6D:74:F3:8E:ED:C9:FF:C6:BF:21:34:45:82:11:A3:60:54:D0:A7`
- SHA-256: `CE:F9:E9:CA:28:BE:10:7C:3E:6B:A0:5E:5E:70:19:A7:E3:71:CA:85:E0:43:C4:3D:9E:E9:CA:6F:F6:B8:7C:3C`

### 2.3 Pendiente obligatorio para production

- SHA-1 y SHA-256 de `App Signing key certificate` en Google Play Console.

## 3. Paso a paso completo

## Paso 1 - Verificar package name Android

Debes usar exactamente:

- `com.ayunierto.ascenciotaxinc`

Este package debe coincidir en:

1. `app.json`
2. Firebase app Android
3. OAuth clients Android en Google Cloud Console
4. Google Play Console

## Paso 2 - Obtener/actualizar huellas SHA

Ejecuta en el proyecto:

```bash
npm run google:sha
```

Que valida este comando:

1. SHA de `android/app/debug.keystore`
2. SHA de `credentials/android/keystore.jks` (upload key de EAS)
3. Recordatorio de SHA de Play App Signing (manual)

## Paso 3 - Configurar Google Cloud Console (OAuth)

Ruta: `APIs & Services > Credentials`

Debes tener estos OAuth Client IDs en el mismo proyecto Google:

1. `Web application`
2. `Android` + package `com.ayunierto.ascenciotaxinc` + SHA debug
3. `Android` + package `com.ayunierto.ascenciotaxinc` + SHA upload/release
4. `Android` + package `com.ayunierto.ascenciotaxinc` + SHA App Signing (Play)

Importante:

1. El `Web Client ID` es el que usa la app para solicitar `idToken` y luego validar en backend.
2. No reutilices un client Android para otra huella distinta; crea uno por huella/certificado.

## Paso 4 - Configurar OAuth Consent Screen

Ruta: `APIs & Services > OAuth consent screen`

Verifica:

1. App name y support email correctos
2. Dominios autorizados
3. Links de privacy policy y terms (si aplica)
4. Estado en `In production` cuando ya lo publiques

## Paso 5 - Configurar Firebase Console

Ruta: `Project settings > General > Your apps > Android`

Acciones:

1. Abrir la app Android con package `com.ayunierto.ascenciotaxinc`
2. Agregar las 3 familias de SHA (SHA-1 y SHA-256 cada una):
   - Debug local
   - Upload/release EAS
   - App Signing Play

Luego:

1. Ir a `Authentication > Sign-in method`
2. Habilitar proveedor `Google`

## Paso 6 - Configurar backend (mobile-config)

La app mobile obtiene el Web Client ID desde el backend en `GET /mobile-config` (`googleWebClientId`).

Debes establecer en API uno de estos:

1. Setting `mobile.googleWebClientId`
2. Env `MOBILE_GOOGLE_WEB_CLIENT_ID`

Debe ser exactamente el OAuth Client tipo `Web application` de Google Cloud.

## Paso 7 - Compilar por entorno

### 7.1 Debug local

```bash
npx expo run:android
```

Debe validar contra SHA debug.

### 7.2 Preview (EAS)

```bash
eas build --platform android --profile preview
```

Debe validar contra SHA upload/release (keystore EAS).

### 7.3 Production

```bash
eas build --platform android --profile production
```

Si pruebas desde Play Internal Testing / Production, la firma efectiva es App Signing de Play, por eso su SHA es obligatoria.

## Paso 8 - Validacion funcional por entorno

Matriz minima de pruebas:

1. Instalar build debug local en dispositivo y probar Google login
2. Instalar build preview y probar Google login
3. Instalar build desde canal Play (internal testing recomendado) y probar Google login

Resultado esperado:

1. Se abre selector de cuenta Google sin `DEVELOPER_ERROR`
2. App recibe `idToken`
3. Backend acepta token en `/auth/google/verify`
4. Usuario inicia sesion correctamente

## 4. Troubleshooting rapido

## Error: DEVELOPER_ERROR / login falla solo en preview o production

1. Revisar SHA faltante en OAuth Android client
2. Revisar SHA faltante en Firebase Android app
3. Confirmar package name exacto

## Error: funciona en debug pero no en Play

1. Falta registrar SHA de App Signing de Play

## Error: googleSignInNotReady

1. `googleWebClientId` no llega desde `/mobile-config`
2. backend no tiene `MOBILE_GOOGLE_WEB_CLIENT_ID` correcto

## Error: backend rechaza idToken

1. Web Client ID incorrecto en backend
2. Token emitido para otro proyecto OAuth

## 5. Checklist final de cierre

1. Ejecutar `npm run google:sha` y guardar evidencia
2. Confirmar 3 OAuth Android clients + 1 Web client en Google Cloud
3. Confirmar todas las SHA en Firebase app Android
4. Confirmar `googleWebClientId` en backend mobile-config
5. Probar login en debug, preview y build distribuida por Play
6. Documentar fecha, responsable y proyecto Google/Firebase usado

## 6. Comandos utiles

```bash
# Extraer huellas Android
npm run google:sha

# Lint del proyecto mobile
npm run lint

# Build preview Android
eas build --platform android --profile preview

# Build production Android
eas build --platform android --profile production

# Build iOS simulator (development)
eas build --platform ios --profile development
```
