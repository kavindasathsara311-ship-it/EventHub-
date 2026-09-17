# EventHub 🎫🎉

**EventHub** is a cross-platform Event Management & Ticket Booking application built with **React Native**, **Expo SDK 57**, and **Firebase Cloud Firestore**. It enables users to explore, create, manage, and book tickets for events seamlessly on both Mobile (iOS/Android) and Web.

---

## ✨ Features

- **🔥 Live Firebase Cloud Firestore Integration**: Real-time event discovery, seat inventory management, bookings, and user profiles powered by Google Cloud Firestore.
- **🎟️ Real-Time Ticket Booking**: Atomic Firestore transactions guarantee accurate seat counts and prevent double booking.
- **📱 Cross-Platform (Mobile & Web)**: Full support for iOS, Android (via Expo Go / Standalone Build), and Web browsers.
- **👤 Dual User Roles**:
  - **Attendees**: Search events by title/location/category, filter by category chips, book tickets, view confirmed bookings, and manage favorites.
  - **Organizers**: Publish new events, edit event details, track attendee orders & revenue analytics, and delete events.
- **⚡ Modern Glassmorphism & Sleek UI**: Designed with modern typography, smooth color palettes, and responsive cards.

---

## 🛠️ Technology Stack

- **Frontend**: React Native, Expo SDK 57, React Navigation v6
- **Database**: Firebase Cloud Firestore SDK v12
- **State & Storage**: React Context API, `@react-native-async-storage/async-storage`
- **Icons & Styling**: `@expo/vector-icons`, Vanilla StyleSheet API
- **Backend (Optional API)**: Express.js, Lowdb REST API

---

## 📁 Project Structure

```text
EventHub/
├── mobile/
│   ├── assets/              # App icons, splash screens, and images
│   ├── src/
│   │   ├── components/      # Reusable UI components (EventCard, SearchBar, Chips)
│   │   ├── config/          # Firebase & API configurations
│   │   │   └── firebase.js  # Firebase SDK initialization & Firestore exports
│   │   ├── context/         # Auth & Favorites Context Providers
│   │   ├── navigation/      # App, Auth, Attendee, and Organizer Navigation Stacks
│   │   ├── screens/         # Application screens (EventList, Details, Booking, Profile)
│   │   ├── services/        # Firebase Firestore CRUD service layer
│   │   └── utils/           # Helper functions & Notifications
│   ├── App.js               # Application entry point
│   ├── app.json             # Expo project configuration
│   └── package.json         # Mobile dependencies
├── backend/                 # Express.js REST API backend (Optional fallback server)
├── package.json             # Root monorepo scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo Go App** (installed on your mobile device for native testing)

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kavindasathsara311-ship-it/EventHub-.git
   cd EventHub
   ```

2. **Install dependencies**:
   ```bash
   # Install root dependencies
   npm install

   # Install mobile dependencies
   npm --prefix mobile install
   ```

---

## ⚙️ Firebase Setup

1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Cloud Firestore** database (in test mode for development).
3. Add a **Web App (`</>`)** in Firebase Console -> Project Settings -> General.
4. Copy your credentials into `mobile/src/config/firebase.js`:

```javascript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```

---

## 📱 Running the Application

### 1. Run Mobile App (Expo Go)
```bash
npm run mobile
```
> Scan the QR code using the **Expo Go** app on Android or Camera app on iOS.

### 2. Run Web Application
```bash
npm run web
```
> Opens the web application in your default browser at `http://localhost:8081`.

### 3. Run Express Backend Server (Optional)
```bash
npm run backend
```
> Starts Express server on `http://localhost:4000/api`.

---

## 📜 License

This project is licensed under the MIT License.
