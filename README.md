# 🍽️ FoodTrack - Social Culinary Journey Platform

A sophisticated social media platform for food enthusiasts to document, share, and discover culinary experiences with friends. Built with React, Tailwind CSS, and Supabase.

**✨ Now featuring the Liquid Glass design system** - A refined iOS 26-inspired aesthetic with subtle translucency, depth, and luminous surfaces. 
**🤖 NEW: AI-Powered Food Recognition** - Automatic dish name and tag detection using Google Gemini AI. 

## ✨ Revolutionary Features

### 🤖 AI-Powered Food Recognition 

- **Automatic Dish Detection**: Upload a photo and AI identifies the dish name
- **Smart Tag Generation**: AI suggests 5-8 relevant tags from your categories
- **Instant Analysis**: Results in 2-3 seconds
- **Free Forever**: Google Gemini Free Tier (1,500 images/day)
- **One-Click Magic**: Just click "✨ AI Magic" button after photo upload
- **Accurate Recognition**: Powered by Google's advanced Gemini 2.0 Flash model

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

- **Multi-Photo Upload**: Up to 3 photos per entry for different angles
- **AI-Powered Analysis**: 🤖 One-click automatic dish name & tag detection using Google Gemini
- **Smart Image Processing**: Automatic compression and optimization for fast uploads
- **10-Point Rating System**: Intuitive visual feedback with descriptions
- **Location Tracking**: Integrated geolocation for restaurant discovery
- **Comprehensive Tags**: 80+ pre-defined tags across 8 categories + custom tags
- **Advanced Search**: Filter by cuisine, location, rating, and tags
- **Private Entries**: Option to keep meals private or share with friends

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

## 🤖 AI Features

### How It Works

1. **Upload Photo** - Add 1-3 photos of your meal
2. **Click AI Magic** - Press the "✨ AI Magic" button
3. **Auto-Fill** - Dish name and tags are automatically detected
4. **Refine** - Adjust if needed and save your entry

### Technology

- **Model**: Google Gemini 2.0 Flash (latest)
- **Processing**: Supabase Edge Functions
- **Speed**: 2-3 seconds per image
- **Accuracy**: High precision for common dishes
- **Free Tier**: 1,500 analyses per day

### Setup AI Features

For detailed AI setup instructions, see [AI-QUICKSTART.md](AI-QUICKSTART.md)

**Quick Setup:**
1. Get free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set in Supabase: `supabase secrets set GEMINI_API_KEY=your-key`
3. Deploy function: `supabase functions deploy analyze-food`

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

5. **AI Setup (Optional but Recommended)** 🤖
   - Follow the detailed guide: [AI-SETUP.md](AI-SETUP.md)
   - Get a free Gemini API key from Google AI Studio
   - Deploy the analyze-food Edge Function
   - Enable automatic dish name & tag detection!

6. **Start the development server**

   ```bash
   npm start
   ```

7. **Visit the app**
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
- **Edge Functions**: Serverless functions for AI analysis and complex operations
- **Google Gemini AI**: Advanced image recognition for food analysis (Free Tier)

### Unique Integrations

- **AI Image Recognition**: Google Gemini 2.0 Flash for automatic food detection
- **Geolocation API**: Location-based features
- **File Upload**: Optimized image handling with automatic compression
- **Real-time Updates**: Live social interactions
- **Progressive Web App**: Mobile-friendly with offline capabilities

## 🌟 Unique Value Propositions

1. **AI-Powered Food Recognition**: Revolutionary one-click dish detection and tagging 🤖
2. **First-of-its-kind Food DNA Matching**: Revolutionary compatibility algorithm for food lovers
3. **Interactive Flavor Constellation**: Unprecedented visualization of culinary preferences
4. **Gamified Achievement System**: Makes food tracking addictive and rewarding
5. **Social-First Design**: Built from ground up as a social platform, not just a tracker
6. **Advanced Analytics**: AI insights that learn from your preferences

## 🔮 Roadmap

### Recently Added ✅

- [x] **AI Food Recognition** - Automatic dish name & tag detection 🤖
- [x] **Multi-Photo Upload** - Up to 3 photos per entry
- [x] Liquid Glass Design System (iOS 26-inspired UI)
- [x] PWA Support with Service Workers
- [x] Push Notifications System
- [x] Real-time In-App Notifications
- [x] Notification Permission Management
- [x] Automatic Friend Activity Alerts

### Upcoming Features

- [ ] Voice Input for Dish Names
- [ ] AI Cuisine Style Analysis (Japanese, Italian, etc.)
- [ ] Batch Photo Analysis (multiple dishes at once)
- [ ] AR Menu Recognition
- [ ] Recipe Sharing and Collaboration
- [ ] Food Challenges and Competitions
- [ ] Restaurant Partnership Program
- [ ] Video Story Integration
- [ ] Group Dining Events
- [ ] Nutritional Analysis with AI
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
