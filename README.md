
<div align="center">
  <img src="./assets/images/icon.png" alt="Orbit Logo" width="120" height="120">

  # Orbit 🪐

  **An AI-Powered Interview Experience & Campus Networking Platform**

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
</div>

<br/>

## 📖 Overview

**Orbit** is a high-performance mobile application designed to centralize and streamline how university students and professionals share interview experiences, placement insights, and campus resources. Built with **React Native (Expo)** and a **Supabase Serverless Backend**, the platform leverages AI-driven data extraction and automated content moderation to maintain a high-quality, structured knowledge base.

This project demonstrates advanced mobile architecture, including seamless authentication flows, global state management via Zustand, dynamic feed filtering, and Deno-based Edge Functions.

---

## 🚀 Demo

- 📱 APK: [https://github.com/igdevansh09/Loop/releases/download/apps/Loop.apk  ](https://github.com/igdevansh09/Orbit/releases/download/apps/Orbit.apk)
- 🎥 Demo Video: [https://youtube.com/shorts/17AIQpRHrjc?si=t6pLO01wU0ib4SO1  ](https://youtube.com/shorts/zClmFVKyZWM?si=_eyQl6Zt4D7lF7P_)

---

## ✨ Key Technical Highlights (For Developers & Recruiters)

* **AI Data Extraction (Edge Computing):** Utilizes a custom Supabase Edge Function (`extract-interview-data`) to parse unstructured, user-submitted interview stories into structured, queryable data points (Company, Role, Compensation, Difficulty).
* **Automated Content Moderation:** Implements the `auto-moderate-post` Edge Function to autonomously scan and filter community posts for inappropriate content or spam before they hit the public feed.
* **Modular State Architecture:** Implements **Zustand** (`authStore`) for highly scalable, boilerplate-free global state management, completely decoupling UI components from authentication and data logic.
* **Complex Filtering & UI:** Features a highly optimized feed with dynamic academic branch filtering (`BranchSelector`) and reusable, heavily-styled native components (`ExperienceCard`).
* **Secure Authentication Flow:** End-to-end secure onboarding utilizing Supabase Auth, featuring Email Verification, Password Resets, and secure session persistence.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React Native / Expo
* **Routing:** Expo Router (File-based routing)
* **State Management:** Zustand
* **Styling:** Custom Modular Stylesheet Architecture (`assets/styles/`)

### Backend & Cloud (Supabase)
* **Database:** PostgreSQL (with Row Level Security)
* **Authentication:** Supabase Auth (Email/Password + Verification)
* **Serverless AI:** Supabase Edge Functions (Deno / TypeScript)
* **Storage:** Supabase Storage (for avatars and post media)

---

## 📱 Core Architecture & Features

### 🎓 The Feed & Networking
- **Interview Experiences:** Users can browse, filter (by academic branch/domain), and read deep dives into corporate interview processes.
- **Bookmarks Engine:** A dedicated local/cloud synchronized ledger allowing users to save and curate high-value posts for upcoming placement seasons.

### ✍️ Content Creation & Moderation
- **Rich Post Creation:** Users can draft and submit detailed placement experiences.
- **Invisible Moderation:** Submissions are instantly routed through serverless Edge Functions for AI-based moderation and data structuring before becoming visible to the campus network.

### 🔐 Identity & Access
- **Full Auth Lifecycle:** Complete implementation of Magic Links, OTP verifications, and forgotten password recovery flows seamlessly integrated with Expo Router.

---



## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm or yarn
* Expo CLI
* Supabase CLI (for local backend testing & deploying Edge Functions)

### 1. Clone the repository
```bash
git clone [https://github.com/igdevansh09/orbit.git](https://github.com/igdevansh09/orbit.git)
cd orbit

```

### 2\. Install dependencies

Bash

```
npm install

```

### 3\. Environment Setup

Create a `.env` file in the root directory with your Supabase credentials:

Code snippet

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

```

### 4\. Deploy Edge Functions (Required for Post Processing)

Bash

```
supabase functions deploy auto-moderate-post
supabase functions deploy extract-interview-data

```

### 5\. Run the App

Bash

```
npx expo start

```

Scan the QR code with the Expo Go app on your physical device, or press `a` to run on an Android emulator / `i` for iOS simulator.

* * * * *

🗂️ Project Structure
---------------------

Plaintext

```
orbit/
├── app/                  # Expo Router navigation
│   ├── (auth)/           # Login, Signup, Password Recovery
│   ├── (tabs)/           # Main feed, Create, Bookmarks, Profile
│   ├── _layout.jsx       # Root layout & auth guards
│   └── onboarding.jsx    # Initial user setup
├── assets/               # Fonts, Images, and Custom Stylesheets
├── components/           # Reusable UI (ExperienceCard, BranchSelector)
├── constants/            # Theming and app constants (colors.js)
├── lib/                  # Core libraries (Supabase client, utils)
├── store/                # Zustand global state slices (authStore.js)
└── supabase/
    ├── functions/        # Deno Edge Functions (AI & Moderation)
    └── config.toml       # Supabase local configuration

```

* * * * *


<div align="center">

<i>Developed with ❤️ by <a href="https://www.google.com/search?q=https://github.com/igdevansh09">Devansh Gupta</a></i>

</div>
