import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import type { FirebaseApp } from 'firebase/app'

/**
 * Schakelt Firebase App Check in met reCAPTCHA v3. Doet niets als er geen
 * sitekey is geconfigureerd (VITE_RECAPTCHA_SITE_KEY), zodat de app blijft
 * werken zolang App Check nog niet is opgezet.
 */
export function setupAppCheck(app: FirebaseApp): void {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  if (!siteKey) {
    return
  }

  // Lokaal (vite dev) een debug-token gebruiken; registreer de token die in de
  // browser-console verschijnt onder App Check > Beheer debug-tokens.
  if (import.meta.env.DEV) {
    ;(
      globalThis as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  })
}
