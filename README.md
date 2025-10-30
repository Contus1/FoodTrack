# 🍽️ FoodTrack - Social Culinary Journey Platform

A sophisticated social media platform for food enthusiasts to document, share, and discover culinary experiences with friends. Built with React, Tailwind CSS, and Supabase.

**✨ Now featuring the Liquid Glass design system** - A refined iOS 26-inspired aesthetic with subtle translucency, depth, and luminous surfaces. See [LIQUID_GLASS_DESIGN.md](LIQUID_GLASS_DESIGN.md) for details.

## ✨ Revolutionary Features

### 🌟 Social Media Integration

- **Social Feed**: Instagram-inspired feed showing friends' latest culinary adventures
- **Friend Management**: Search, add, and connect with fellow food lovers
- **Interactive Posts**: Like, save, and comment on food entries
- **User Profiles**: Personalized profiles with bio, follower stats, and food galleries
- **Profile Pictures**: Upload and customize avatar images with automatic storage management

### 🧬 Unique Social Components

#### 1. **Food DNA Matcher**

- Analyzes culinary compatibility between friends using AI-powered algorithms
- DNA helix visualization showing compatibility percentages
- Personality trait matching based on food preferences
- Personalized recommendations for shared dining experiences

#### 2. **Flavor Journey Map**

- Interactive constellation map of your culinary universe
- Dynamic visualization connecting cuisines by rating and frequency
- Clickable nodes revealing detailed cuisine statistics
- Animated connections showing your flavor relationships

#### 3. **Culinary Achievements System**

- Gamified experience with 15+ unique achievements
- Categories: Explorer, Connoisseur, Social, Adventurer, Special
- Rarity levels: Common, Rare, Epic, Legendary
- Animated celebration system for new achievements

### 📱 Core Food Tracking

- **Photo Upload**: Capture and share your culinary moments
- **Smart Rating**: 5-star rating system with visual feedback
- **Location Tracking**: Geolocation integration for restaurant discovery
- **Tag System**: Categorize dishes with custom tags
- **Advanced Search**: Filter by cuisine, location, rating, and tags

### 🔔 PWA & Notifications

- **Progressive Web App**: Install as native app on any device
- **Push Notifications**: Get notified when friends post new meals
- **Real-time Updates**: Instant notifications for friend requests and social activity
- **Offline Support**: Service worker for offline functionality
- **Smart Prompts**: Non-intrusive notification permission requests

### 📊 Advanced Analytics

- **Spider Chart**: Visual flavor profile analysis
- **Interactive Maps**: Geographic visualization of your food journey
- **Rating Distribution**: Statistical breakdown of your preferences
- **Cuisine Insights**: Discover your favorite food types and patterns

### 🎯 Personalized Recommendations

- AI-powered suggestion engine
- Based on your ratings, preferences, and friend activity
- Seasonal and trending dish recommendations
- Location-based suggestions for new restaurants

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/foodtrack.git
   cd foodtrack
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   REACT_APP_VAPID_PUBLIC_KEY=your-vapid-public-key
   ```

   Generate VAPID keys for push notifications at: https://web-push-codelab.glitch.me/

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL setup script: `supabase-setup.sql`
   - This creates all necessary tables for social features
   - Creates storage buckets for food images and profile pictures
   - Sets up Row Level Security (RLS) policies for data protection

5. **Start the development server**

   ```bash
   npm start
   ```

6. **Visit the app**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗄️ Database Schema

### Core Tables

- **entries**: Food entries with ratings, photos, and metadata
- **user_profiles**: Extended user information and preferences

### Social Features

- **friendships**: Friend relationships and status management
- **entry_likes**: Like interactions on food posts
- **entry_saves**: Saved food entries
- **entry_comments**: Comments and discussions
- **notifications**: Real-time social notifications
- **push_subscriptions**: Web push notification device tokens

### Advanced Features

- **RLS (Row Level Security)**: Comprehensive data protection
- **Real-time subscriptions**: Live updates for social interactions
- **Optimized indexes**: Fast query performance

## 🎨 Technology Stack

### Frontend

- **React 18**: Modern UI framework with hooks
- **Tailwind CSS**: Utility-first styling with custom animations
- **Liquid Glass Design System**: iOS 26-inspired aesthetic with translucency and depth
- **React Router**: Client-side routing
- **Context API**: State management for auth, entries, and social features

### Backend

- **Supabase**: PostgreSQL database with real-time features
- **Authentication**: Email/password with social login options
- **Storage**: Image upload and optimization
- **Edge Functions**: Server-side logic for complex operations

### Unique Integrations

- **Geolocation API**: Location-based features
- **File Upload**: Optimized image handling
- **Real-time Updates**: Live social interactions
- **Progressive Web App**: Mobile-friendly with offline capabilities

## 🌟 Unique Value Propositions

1. **First-of-its-kind Food DNA Matching**: Revolutionary compatibility algorithm for food lovers
2. **Interactive Flavor Constellation**: Unprecedented visualization of culinary preferences
3. **Gamified Achievement System**: Makes food tracking addictive and rewarding
4. **Social-First Design**: Built from ground up as a social platform, not just a tracker
5. **AI-Powered Insights**: Advanced analytics that learn from your preferences

## 🔮 Roadmap

### Recently Added ✅

- [x] Liquid Glass Design System (iOS 26-inspired UI)
- [x] PWA Support with Service Workers
- [x] Push Notifications System
- [x] Real-time In-App Notifications
- [x] Notification Permission Management
- [x] Automatic Friend Activity Alerts

### Upcoming Features

- [ ] AR Menu Recognition
- [ ] Recipe Sharing and Collaboration
- [ ] Food Challenges and Competitions
- [ ] Restaurant Partnership Program
- [ ] Advanced ML Recommendations
- [ ] Video Story Integration
- [ ] Group Dining Events
- [ ] Nutritional Analysis
- [ ] Integration with Food Delivery Apps

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from modern social media platforms
- Community feedback from food enthusiasts
- Open-source libraries and frameworks
- Supabase team for excellent backend services

## 📞 Support

- 📧 Email: support@foodtrack.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/foodtrack/issues)
- 💬 Discord: [Join our community](https://discord.gg/foodtrack)
- 📱 Twitter: [@FoodTrackApp](https://twitter.com/foodtrackapp)

---

**Built with ❤️ for food lovers everywhere** 🌍
