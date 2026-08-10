# FreePass

**FreePass** is a cross-platform mobile app for **financial literacy**—learning resources, Q&A, events, messaging, and more. It’s built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev), using [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Expo ~54, React 19, React Native 0.81 |
| Navigation | Expo Router (stack + drawer), typed routes |
| UI | React Native, `@expo/vector-icons`, custom theme (`constants/theme.ts`) |
| Platforms | iOS, Android, Web (`react-native-web`) |

The root layout uses a **drawer** for primary sections and a **stack** for detail screens, modals, and deep links.

## Features (high level)

- **Home & drawer** — Account, Message Board, Casey (AI assistant), Learning Academy, Event Calendar, Ask a Question, New User Guide  
- **Community & content** — Listings, maps, street view, events, Q&A threads, community board, interview library  
- **Programs** — Fountain Fund, Money Smart, loan inquiry, courses, staff view, quick list, signup  

Screens live under `app/`; shared UI under `components/`.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)  
- [npm](https://www.npmjs.com/) (or use `yarn` / `pnpm` if you prefer)  
- For device builds: [Xcode](https://developer.apple.com/xcode/) (iOS), [Android Studio](https://developer.android.com/studio) (Android)  
- [Expo CLI](https://docs.expo.dev/get-started/installation/) is used via `npx` (no global install required)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the dev server**

   ```bash
   npm start
   # or
   npx expo start
   ```

3. **Run on a platform**

   - Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with **Expo Go** on a physical device  
   - **Web:** `npm run web` (or `npx expo start --web`)

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Build/run iOS (dev client) |
| `npm run android` | Build/run Android (dev client) |
| `npm run web` | Start with web target |
| `npm run lint` | Run ESLint (`expo lint`) |
| `npm run reset-project` | Move current `app` code to `app-example` and scaffold a blank `app` (Expo template helper) |

## Project layout

```
app/                 # Routes (Expo Router)
  (drawer)/          # Main drawer screens (home, chat, academy, etc.)
  modal/             # Modal presentations
  _layout.tsx        # Root stack + theme
components/          # Reusable UI (drawer, headers, etc.)
constants/           # Theme and shared constants
assets/              # Images and fonts
```

## Configuration

- **`app.json`** — Expo app name, slug, icons, splash, iOS/Android/web settings  
- **Deep linking** — `scheme: "freepass"` in `app.json`  
- **New Architecture** — enabled in `app.json` (`newArchEnabled`)  
- **Experiments** — typed routes, React Compiler (see `app.json`)

## Building for production

Use [EAS Build](https://docs.expo.dev/build/introduction/) or local `expo prebuild` + native tooling. See the [Expo distribution docs](https://docs.expo.dev/distribution/introduction/) for App Store and Play Store flows.

## Learn more

- [Expo documentation](https://docs.expo.dev/)  
- [Expo Router](https://docs.expo.dev/router/introduction/)  
- [React Native](https://reactnative.dev/docs/getting-started)

---

*Internal / private project — adjust licensing and contribution guidelines as needed.*
