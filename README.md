# Boerenbridge Scores

Een simpele PWA om de scores van Boerenbridge bij te houden. Eén persoon noteert per
ronde de biedingen en gehaalde slagen; de app rekent de punten uit en bewaart de spellen
in Firebase Firestore (sync over apparaten).

## Functies
- 3–8 spelers, kaarten-reeks oplopend (1 → max) of op-af (1 → max → 1).
- **Deler-regel**: waarschuwing als de som van de biedingen gelijk is aan de kaarten.
- Slagen-controle: volgende ronde pas mogelijk als de gehaalde slagen optellen tot de kaarten.
- Instelbare puntentelling: `10 + 2 per slag`, `3 per slag`, `Zaans (5 per slag)` of eigen.
- Live stand, historie met correctie van eerdere rondes, installeerbaar als app (PWA).

## Tech
Vite + React + TypeScript, Tailwind CSS, Firebase Firestore, vite-plugin-pwa, Vitest.

## Lokaal draaien
```bash
npm install
cp .env.example .env   # vul je Firebase-config in
npm run dev
```

## Scripts
- `npm run dev` — dev-server
- `npm test` — unit tests (domeinlogica)
- `npm run build` — productie-build (incl. PWA)

## Firebase koppelen (in de terminal)
1. Inloggen: `firebase login`
2. Project kiezen of aanmaken in de [Firebase console](https://console.firebase.google.com),
   en in dit project koppelen: `firebase use --add`
3. Web-app aanmaken in de console (Project settings → Your apps → Web) en de config
   in `.env` zetten (zie `.env.example`).
4. Firestore aanzetten in de console (Build → Firestore Database → Create database).
5. Rules + (lege) indexes deployen: `firebase deploy --only firestore`
6. App online zetten: `npm run build && firebase deploy --only hosting`

## Beveiliging
Spellen zijn via anonieme login per apparaat afgeschermd: je kunt alleen je eigen spellen
(op basis van `ownerId == jouw uid`) lezen/wijzigen. Injecties (SQL/NoSQL/XSS) zijn niet
mogelijk: Firestore is geen SQL-database en React escapet alle weergegeven waarden.

### App Check (bescherming tegen scripted misbruik)
De app initialiseert Firebase App Check met reCAPTCHA v3 zodra `VITE_RECAPTCHA_SITE_KEY`
is gezet (zonder die sleutel doet App Check niets). Inschakelen:
1. Maak een **reCAPTCHA v3**-sleutel op https://www.google.com/recaptcha/admin/create
   (type v3; domeinen: `boerenbridge.web.app` en `localhost`). Je krijgt een *site key*
   (publiek, voor de app) en een *secret key* (voor Firebase).
2. Firebase console → **App Check** → web-app registreren → provider **reCAPTCHA v3** →
   plak de *secret key*.
3. Zet de *site key* in `.env`: `VITE_RECAPTCHA_SITE_KEY=...`, daarna `npm run build &&
   firebase deploy --only hosting`.
4. Controleer in de console (App Check-metrics) dat verzoeken geverifieerd binnenkomen.
5. **Pas dan** App Check **afdwingen** voor Firestore (en Authentication) aanzetten.
6. Lokaal: de browser-console toont een debug-token; registreer die onder
   App Check → *Beheer debug-tokens*.
