# 🌱 GreenPulse

<div align="center">
  <p align="center">
    <img src="https://img.shields.io/badge/React%20Native-0A1A2F?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
  <h1>Empowering Sustainable Action Through Technology</h1>
  <p>Connect, contribute, and make an impact on environmental sustainability projects in your community.</p>
</div>

## 🚀 Features

### 🌍 Project Discovery
- Browse and filter environmental projects by location, category, and impact level
- Interactive map view for discovering nearby sustainability initiatives
- Detailed project information with goals, requirements, and progress tracking

### 👥 Community Engagement
- User authentication and profile management
- Follow projects and receive updates
- Share projects on social media
- Earn achievements and recognition for contributions

### 📊 Impact Tracking
- Visualize your environmental impact through interactive dashboards
- Track personal and community contributions
- Earn digital badges and certificates for participation

### 🔄 Real-time Updates
- Push notifications for project milestones
- Live chat with project organizers
- Activity feed of recent contributions

## 🛠 Tech Stack

| Category       | Technologies                                                                 |
|----------------|-----------------------------------------------------------------------------|
| **Frontend**   | React Native, Expo, TypeScript, NativeWind (TailwindCSS)                    |
| **State**      | React Context API, AsyncStorage                                            |
| **Backend**    | Firebase (Authentication, Firestore, Storage, Cloud Functions)              |
| **Maps**       | React Native Maps                                                          |
| **UI/UX**      | React Native Reanimated, Framer Motion, Lucide Icons, Expo Image Picker    |
| **Analytics**  | Firebase Analytics                                                         |

## 📱 Screenshots

| | | |
|:-------------------------:|:-------------------------:|:-------------------------:|
| <img src="assets/images/screenshots/home.png" width=200> | <img src="assets/images/screenshots/project-details.png" width=200> | <img src="assets/images/screenshots/profile.png" width=200> |
| Home Screen | Project Details | User Profile |

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (for mobile development)
- Firebase project (for backend services)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/greenpulse.git
cd greenpulse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Update the .env file with your Firebase configuration

# Start the development server
npx expo start
```

### Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Set up Firestore Database in test mode
4. Create a web app in Firebase console
5. Copy the configuration to `.env` file
6. Update security rules in `firestore.rules`

## 🏗 Project Structure

```
greenpulse/
├── app/                    # Main application code
│   ├── (auth)/            # Authentication flows
│   ├── (tabs)/            # Main app navigation tabs
│   ├── components/        # Reusable UI components
│   ├── config/            # App configuration
│   ├── constants/         # App-wide constants
│   ├── contexts/          # Global state management
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and business logic
│   └── utils/             # Utility functions
├── assets/               # Static assets (images, fonts)
├── scripts/              # Build and utility scripts
└── tests/                # Test files
```

## 🛠 Development

### Available Scripts

```bash
# Start development server
npm start

# Run on Android
expo run:android

# Run on iOS
expo run:ios

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 📝 Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development experience
- [Firebase](https://firebase.google.com/) for backend services
- [React Native Community](https://reactnative.dev/) for the awesome framework
- All our amazing contributors and users!

---

<div align="center">
  Made with ❤️ by the GreenPulse Team
</div>
