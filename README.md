Orbit
=====

An exclusive, high-signal community platform engineered for NSUT students. Stop relying on scattered WhatsApp groups. Orbit centralizes interview experiences, Online Assessment (OA) patterns, and internship strategies into a single, searchable feed.

### Demo

[Watch the App Demo Video](https://youtube.com/shorts/v6xYtL_21RY?feature=share)

* * * * *

🚀 Key Features
---------------

-   **Universal Routing**: Built with `expo-router` for type-safe, file-based routing across all platforms.

-   **Secure Authentication**: Full authentication suite including Sign Up, Email Verification, Login, and Password Recovery powered by Supabase.

-   **State Management**: Optimized performance using Zustand for lightweight and reactive global state.

-   **Persistent Storage**: Securely stores user sessions and preferences using `expo-secure-store` and `async-storage`.

-   **Modern UI/UX**: Features haptic feedback, blurred backgrounds, and high-performance image rendering.

-   **Push Notifications**: Integrated notification system support via `expo-notifications`.

🛠 Tech Stack
-------------

-   **Framework**: [Expo 54](https://www.google.com/search?q=https://expo.dev/).

-   **Library**: [React Native 0.81](https://www.google.com/search?q=https://reactnative.dev/).

-   **Backend**: [Supabase](https://www.google.com/search?q=https://supabase.com/).

-   **State**: [Zustand](https://www.google.com/search?q=https://github.com/pmndrs/zustand).

-   **Navigation**: [Expo Router](https://www.google.com/search?q=https://docs.expo.dev/router/introduction/).

-   **Styling**: React Native StyleSheet with custom theme constants.

⚙️ Project Structure
--------------------

Plaintext

```
Orbit/
├── app/               # File-based routes (Auth flow, Tabs, Onboarding)
├── assets/            # Fonts, Images, and Screenshots
├── components/        # Reusable UI components (Cards, Loaders, Headers)
├── constants/         # Theme colors and global constants
├── lib/               # Supabase client and utility functions
├── store/             # Zustand auth store
└── supabase/          # Database configurations and Edge Functions

```

🏃 Getting Started
------------------

### Prerequisites

-   Node.js installed

-   Expo Go app on your mobile device or an emulator (Android Studio / Xcode)

### Installation

1.  **Clone the repository**

2.  **Install dependencies**:

    Bash

    ```
    npm install

    ```

3.  **Setup Environment**

    Ensure your `$GOOGLE_SERVICES_FILE` is configured for the pre-install script to copy your Firebase configuration.

4.  **Start the development server**:

    Bash

    ```
    npx expo start

    ```

🧪 Testing & Linting
--------------------

-   **Run Jest tests**: `npm test`

-   **Watch tests**: `npm run test:watch`

-   **Lint code**: `npm run lint`

* * * * *

*Created with ❤️ by igdevansh09*