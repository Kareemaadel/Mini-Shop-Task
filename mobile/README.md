# Mini Shop Mobile App

A polished, production-ready mobile application built with **React Native**, **Expo SDK**, and **TypeScript**.

## Tech Stack
- **Framework**: React Native + Expo (latest SDK)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Networking**: Axios
- **Auth Persistence**: Expo SecureStore
- **Styling**: Custom theme with StyleSheet
- **Icons**: Feather (via `@expo/vector-icons`)

## Project Structure
```
/mobile
├── app/                  # Expo Router file-based navigation
│   ├── (auth)/           # Authentication flow (login, register, etc.)
│   ├── (app)/            # Authenticated app flow
│   │   ├── (tabs)/       # Bottom tab navigation (shop, cart, orders, profile)
│   │   ├── product/      # Product detail screens
│   │   └── order/        # Order detail screens
│   └── _layout.tsx       # Root layout handling auth redirects
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks (e.g., useDebounce)
│   ├── services/         # API integration layers (Axios)
│   ├── store/            # Zustand global state (auth, cart)
│   └── theme/            # Design system tokens (colors, typography, spacing)
├── .env.example          # Environment variables template
└── package.json
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Environment variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Ensure `EXPO_PUBLIC_API_URL` points to your backend instance.
*Note: If running on a physical device, change `http://localhost:3000` to your computer's local IP address (e.g., `http://192.168.1.50:3000`).*

### 3. Run the App
To start the Expo development server:
```bash
npm start
```

Then, you can open the app on:
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code using the Expo Go app

## Test Credentials
You can use the seeded backend data to test the app:
- **Email**: `customer@test.com`
- **Password**: `password123`

## Features Implemented
- **Robust Auth Flow**: SecureStore JWT persistence, auto-login after register, layout guards.
- **Shop Catalogue**: Grid layout, debounced search, category filtering, pull-to-refresh, skeleton loaders, empty states.
- **Cart Management**: Local Zustand store, quantity modification, persistent across navigation, seamless checkout.
- **Order History**: Status color-coding, detailed item breakdown, server-side data fetching.
- **Premium Design**: Clean typography, consistent spacing, interactive states, error boundaries, shadow depths.
