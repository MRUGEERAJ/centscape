# Centscape - Wishlist App

A production-grade React Native wishlist application built with Expo, featuring deep linking, URL preview, and robust data persistence.

## 🚀 Features

### Core Functionality
- **Deep Linking**: Use `centscape://add?url=` to directly open the Add flow with URL pre-filled
- **Add Flow**: Paste URLs and get instant previews before adding to wishlist
- **Wishlist Management**: Virtualized list with pull-to-refresh and infinite scrolling
- **Data Persistence**: AsyncStorage with schema migrations (v1 → v2)
- **URL Deduplication**: Smart URL normalization to prevent duplicates

### Technical Excellence
- **Production Architecture**: Clean separation of concerns with services, stores, and components
- **Type Safety**: Comprehensive TypeScript types and interfaces
- **Error Handling**: Graceful error handling with retry mechanisms
- **Accessibility**: Full accessibility support with proper labels and hints
- **Performance**: Virtualized lists, image optimization, and efficient state management
- **Testing**: Jest configuration with 80% coverage thresholds

## 📱 Screenshots

### Wishlist Screen
- Virtualized list of saved items
- Each item shows: title, image, price, source domain, and timestamp
- Pull-to-refresh functionality
- Empty state with call-to-action

### Add Screen
- URL input with paste functionality
- Real-time preview generation
- Error handling and validation
- Success feedback with navigation options

## 🏗️ Architecture

```
src/
├── components/
│   ├── screens/          # Screen components
│   └── ui/              # Reusable UI components
├── services/            # Business logic layer
│   ├── DatabaseService.ts
│   ├── UrlNormalizationService.ts
│   ├── UrlPreviewService.ts
│   └── DeepLinkService.ts
├── stores/              # State management
│   └── wishlistStore.ts
├── types/               # TypeScript definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── index.ts
│   └── appInit.ts
└── constants/           # App constants
    └── Colors.ts
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **URL Parsing**: url-parse
- **Date Handling**: date-fns
- **Testing**: Jest + React Native Testing Library
- **TypeScript**: Full type safety

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator
- OpenAI API Key (for AI features)

### Environment Setup
```bash
# Run the setup script
./setup-env.sh

# Or manually copy the template
cp env.template .env
```

### Configure AI Integration
Edit `.env` file and add your OpenAI API key:
```bash
EXPO_PUBLIC_OPENAI_API_KEY=your_actual_api_key_here
```

Get your API key from: [OpenAI Platform](https://platform.openai.com/api-keys)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Type checking
npm run type-check
```

## 🔗 Deep Linking

The app supports deep linking with the following format:
```
centscape://add?url=https://example.com/product
```

### Testing Deep Links
```bash
# iOS Simulator
xcrun simctl openurl booted "centscape://add?url=https://amazon.com/product"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "centscape://add?url=https://amazon.com/product" com.yourcompany.centscape
```

## 📊 Database Schema

### Wishlist Items Table
```typescript
interface WishlistItem {
  id: string;              // Unique identifier
  title: string;           // Item title
  imageUrl: string | null; // Preview image URL
  price: string | null;     // Item price
  sourceDomain: string;    // Source website domain
  originalUrl: string;      // Original URL
  normalizedUrl: string;    // Normalized URL for deduplication
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

### Schema Migrations
- **v1**: Basic wishlist items without normalized URLs
- **v2**: Added `normalizedUrl` field for deduplication

## 🔧 URL Normalization

The app normalizes URLs to prevent duplicates:
- Strips UTM parameters
- Lowercases host
- Removes fragments (#...)
- Handles www vs non-www

Example:
```
Original: https://www.amazon.com/product?utm_source=google&ref=123#section
Normalized: https://amazon.com/product
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage
- Services: URL normalization, preview fetching, database operations
- Components: UI rendering, user interactions, accessibility
- Stores: State management, error handling
- Utilities: Date formatting, text manipulation

## 📱 Accessibility

The app includes comprehensive accessibility support:
- `accessibilityLabel` for all interactive elements
- `accessibilityHint` for context
- Screen reader compatibility
- Proper focus management
- Semantic markup

## 🚀 Production Deployment

### Build Configuration
```json
{
  "expo": {
    "name": "Centscape",
    "slug": "centscape",
    "scheme": "centscape",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic"
  }
}
```

### EAS Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Expo team for the excellent development platform
- React Native community for the ecosystem
- Zustand for lightweight state management
- All contributors and maintainers
