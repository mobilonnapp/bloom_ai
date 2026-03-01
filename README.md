# Bloom AI Maker

Production-ready AI video generator app built with React Native (Expo) + VModel.ai face swap.

## Tech Stack
- **Framework**: Expo SDK 52 (managed workflow)
- **Language**: TypeScript
- **Navigation**: Expo Router v4 (file-based)
- **AI API**: VModel.ai Face Swap
- **Storage**: AsyncStorage
- **Video**: expo-av
- **Animations**: React Native Animated API

## Screens

| Screen | Path | Description |
|--------|------|-------------|
| Homepage | `app/(tabs)/index.tsx` | Browse template categories |
| History | `app/(tabs)/history.tsx` | Past video generations |
| Template Detail | `app/template/[id].tsx` | Preview + create from template |
| Upload Photos | `app/upload/[templateId].tsx` | Upload 2 face photos |
| Processing | `app/processing.tsx` | AI generation with live progress |
| Result | `app/result.tsx` | Preview, download, share |
| Upgrade | `app/upgrade.tsx` | In-app purchase screen |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add VModel.ai API key
```bash
cp .env.example .env
# Edit .env and add your EXPO_PUBLIC_VMODEL_API_KEY
```
Get your API key at: https://vmodel.ai

### 3. Add app assets
Place these files in `assets/images/`:
- `icon.png` (1024×1024)
- `splash.png`
- `adaptive-icon.png` (Android, 1024×1024)

### 4. Run
```bash
# Start dev server
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios
```

## VModel.ai Integration

The app uses `services/vmodel.ts` for all API calls:

```
POST /ai-video/face-swap
  → Returns task_id

GET /tasks/{task_id}
  → Returns status + result_url
```

**Polling**: The app polls every 3 seconds with up to 60 retries (3 min timeout).

## Production Checklist

- [ ] Add real VModel.ai API key to `.env`
- [ ] Upload real template thumbnails/videos to backend
- [ ] Integrate `expo-in-app-purchases` or RevenueCat for real payments
- [ ] Add Sentry or similar for error tracking
- [ ] Configure push notifications for long-running jobs
- [ ] Add face validation API (e.g. AWS Rekognition)
- [ ] Set up backend for template management
- [ ] Enable ProGuard/minification for Android release build
- [ ] Configure app signing for both platforms

## Project Structure

```
├── app/
│   ├── _layout.tsx          # Root layout
│   ├── (tabs)/
│   │   ├── index.tsx         # Homepage
│   │   └── history.tsx       # History
│   ├── template/[id].tsx     # Template detail
│   ├── upload/[templateId].tsx
│   ├── processing.tsx
│   ├── result.tsx
│   └── upgrade.tsx
├── components/               # Reusable UI
├── constants/                # Colors, templates
├── hooks/                    # useCredits, useVideoGeneration
├── services/                 # vmodel.ts, storage.ts
└── types/                    # TypeScript types
```
