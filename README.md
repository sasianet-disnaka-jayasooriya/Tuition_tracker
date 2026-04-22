# 📚 Tuition Fee Tracker — Firebase PWA

Family-shared tuition fee tracker with real-time sync across all phones.

---

## ✅ Features
- Shared login — whole family uses same email + password
- Real-time sync — change on one phone, appears on all others instantly
- Offline-first — works without internet, syncs when reconnected
- Sri Lankan Rupee (₨) + 6 other currencies
- Multiple children, classes, payment history, budget tracking
- Export/Import JSON backup

---

## 🔥 STEP 1 — Create Firebase Project (Free, ~10 minutes)

### 1.1 Create Project
1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Name it: `tuition-tracker` → Continue
4. Disable Google Analytics (not needed) → **Create project**

### 1.2 Add a Web App
1. In project dashboard, click the **Web icon ( </> )**
2. App nickname: `tuition-pwa` → Click **"Register app"**
3. You will see a `firebaseConfig` object — **COPY IT**, you need it in Step 3

### 1.3 Enable Email/Password Authentication
1. Left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Click **"Email/Password"** → Enable the first toggle → **Save**

### 1.4 Create Firestore Database
1. Left sidebar → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** → Next
4. Select location nearest to you (e.g. `asia-south1` for Sri Lanka/India) → **Enable**

### 1.5 Set Security Rules
1. In Firestore, click the **"Rules"** tab
2. Replace ALL existing text with the contents of `firestore.rules` file:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
3. Click **Publish**

---

## ✏️ STEP 2 — Edit index.html (Paste Your Firebase Config)

Open `index.html` in any text editor (Notepad, VS Code, etc.)

Find this section near the top (~line 50):
```javascript
const FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_apiKey_HERE",
  authDomain:        "PASTE_YOUR_authDomain_HERE",
  projectId:         "PASTE_YOUR_projectId_HERE",
  storageBucket:     "PASTE_YOUR_storageBucket_HERE",
  messagingSenderId: "PASTE_YOUR_messagingSenderId_HERE",
  appId:             "PASTE_YOUR_appId_HERE"
};
```

Replace the placeholder values with your actual Firebase config values. It should look like:
```javascript
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAbc123...",
  authDomain:        "tuition-tracker-abc12.firebaseapp.com",
  projectId:         "tuition-tracker-abc12",
  storageBucket:     "tuition-tracker-abc12.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123..."
};
```

Save the file.

---

## 🚀 STEP 3 — Deploy to GitHub Pages

1. Go to **github.com** → **New repository**
2. Name: `tuition-tracker` → **Public** → **Create repository**
3. Upload ALL files: `index.html`, `manifest.json`, `sw.js`, `icon.svg`, `firestore.rules`
4. Go to **Settings → Pages → Source → main → / (root) → Save**
5. Wait ~1 minute → URL: `https://YOUR-USERNAME.github.io/tuition-tracker`

---

## 📱 STEP 4 — Install on Phones

### Android (Chrome):
1. Open the GitHub Pages URL in Chrome
2. Tap **⋮ menu → "Add to Home Screen"** → Install
3. App icon appears on home screen

### iPhone (Safari):
1. Open the GitHub Pages URL in Safari
2. Tap **Share 📤 → "Add to Home Screen"** → Add

---

## 👨‍👩‍👧‍👦 STEP 5 — Share With Family

### First phone (you):
1. Open app → tap **"Create family account"**
2. Enter any email and a password (min 6 chars)
3. You are now logged in

### Other phones:
1. Open app → tap **"Sign In"**
2. Enter the **same email and password**
3. All data syncs instantly ✅

---

## 🔒 Security Notes
- One email + password = access to all family data
- Choose a strong password (mix of letters, numbers, symbols)
- Only people with this password can see your data
- Data stored securely in Google Firebase (same as Google Drive)

---

## 💾 Data Persistence
| Location | How long | Purpose |
|----------|----------|---------|
| Firebase Firestore | Forever (Google Cloud) | Primary database, shared across phones |
| localStorage (each phone) | Until browser data cleared | Instant offline access |
| .json backup file | Forever (your device) | Extra backup, download monthly |

---

## 🆓 Firebase Free Tier Limits
Your usage will stay well within free limits:
- **50,000 reads/day** (you'll use ~100)
- **20,000 writes/day** (you'll use ~50)
- **1 GB storage** (you'll use ~1 MB)
- **No credit card required**
