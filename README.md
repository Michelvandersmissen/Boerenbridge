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
Zonder login zijn de Firestore-rules publiek schrijfbaar (met lichte vorm-validatie) —
prima voor een privé-spel, niet voor gevoelige data. Wil je het afschermen, voeg dan
Firebase Auth toe en beperk de rules op eigenaar.
