# Configuracion Google Sign-In Android (debug, preview, production)

Este documento deja trazable la configuracion para que Google Login funcione en:

- `debug` local
- `preview` (EAS internal)
- `production`

## 1) Extraer huellas SHA

Ejecuta:

```bash
node scripts/google-signin/collect-android-fingerprints.mjs
```

El script imprime:

- Huellas de `debug` local (`android/app/debug.keystore`)
- Huellas de `release/upload` usando `credentials.json`
- Recordatorio de huellas de `App Signing` en Play Console (manual)

## 2) Google Cloud Console (OAuth)

En el mismo proyecto de Google/Firebase:

1. Ve a `APIs & Services > Credentials`.
2. Crea o valida estos OAuth Client IDs:
   - `Web application` (este se usa como `googleWebClientId` en la app).
   - `Android` para package `com.ayunierto.ascenciotaxinc` + SHA de debug.
   - `Android` para package `com.ayunierto.ascenciotaxinc` + SHA de release/upload.
   - `Android` para package `com.ayunierto.ascenciotaxinc` + SHA de App Signing (Play).
3. En `OAuth consent screen`, verifica:
   - App en estado `In production` si ya publicaras.
   - Dominios/politicas completos (privacy policy y terms) segun corresponda.

## 3) Firebase Console

En Firebase del mismo proyecto:

1. `Project settings > General > Your apps > Android app (com.ayunierto.ascenciotaxinc)`.
2. Agrega SHA-1 y SHA-256 para:
   - Debug local
   - Release/Upload (EAS)
   - App Signing (Play Console)
3. En `Authentication > Sign-in method`, habilita `Google`.

## 4) Backend y config movil

La app movil toma el `webClientId` desde `GET/mobile-config` (`googleWebClientId`).

Debes configurar en API el mismo OAuth Web Client ID creado en Google Cloud:

- setting: `mobile.googleWebClientId` o
- env: `MOBILE_GOOGLE_WEB_CLIENT_ID`

Sin este valor, la app mostrara `googleSignInNotReady` o errores de developer config.

## 5) Builds y validacion por entorno

- `debug`: usa debug keystore local.
- `preview`: usa keystore de EAS (`credentials.json` / credential manager).
- `production`:
  - APK/AAB firmado con upload key (EAS keystore)
  - Distribucion desde Play usa App Signing key

Por eso necesitas **las 3 familias de SHA** registradas.

## 6) Checklist final

1. Registrar todas las SHA en Google Cloud (clientes Android).
2. Registrar todas las SHA en Firebase (Android app).
3. Confirmar `googleWebClientId` correcto en backend mobile-config.
4. Probar login Google en:
   - build debug local
   - build preview instalada en dispositivo real
   - build release/production (idealmente desde Internal testing en Play)
5. Si falla solo en Play, normalmente falta la SHA de App Signing.
