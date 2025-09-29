# Food Diary - Mobile-First PWA

A mobile-first Progressive Web App for tracking your favorite meals with photos, ratings, and tags. Built with React, Tailwind CSS, and Supabase.

## Features

- **Add Food Entries**: Take photos, rate dishes (1-5 stars), and add tags
- **Mobile-First Design**: Optimized for mobile devices using Tailwind CSS
- **User Authentication**: Sign up/sign in with Supabase Auth
- **Photo Storage**: Upload and store food photos with Supabase Storage
- **Food Feed**: Scrollable list of all your food entries
- **Tags & Ratings**: Organize entries by cuisine type and rating
- **User Profile**: View your account details and sign out

## Tech Stack

- **Frontend**: React 18 with React Router
- **Styling**: Tailwind CSS (mobile-first approach)
- **Backend**: Supabase (Database, Auth, Storage)
- **State Management**: React Context API

## Project Structure

```
food-diary/
├── public/
│   └── assets/         # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context (Auth & Entries)
│   ├── pages/          # Page components
│   ├── utils/          # Helper functions
│   └── App.js          # Main app component
├── .env                # Environment variables
└── package.json        # Dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update `.env` with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your-supabase-url-here
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create users table (optional, as auth.users is built-in)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text,
  created_at timestamp default current_timestamp
);

-- Create entries table for food entries
create table public.entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  rating integer check (rating >= 1 and rating <= 5),
  tags text[] default '{}',
  notes text,
  photo_url text,
  created_at timestamp default current_timestamp
);

-- Create storage bucket for food images
insert into storage.buckets (id, name, public) values ('food-images', 'food-images', true);

-- Set up RLS (Row Level Security)
alter table public.entries enable row level security;

-- Policy: Users can only see their own entries
create policy "Users can view their own entries" on public.entries
  for select using (auth.uid() = user_id);

-- Policy: Users can insert their own entries
create policy "Users can insert their own entries" on public.entries
  for insert with check (auth.uid() = user_id);

-- Policy: Users can update their own entries
create policy "Users can update their own entries" on public.entries
  for update using (auth.uid() = user_id);

-- Policy: Users can delete their own entries
create policy "Users can delete their own entries" on public.entries
  for delete using (auth.uid() = user_id);

-- Storage policy for food images
create policy "Users can upload their own images" on storage.objects
  for insert with check (bucket_id = 'food-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own images" on storage.objects
  for select using (bucket_id = 'food-images' and auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Start Development Server

```bash
npm start
```

The app will run at `http://localhost:3000`

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Add Entry**: Click "Add Entry" to take a photo, rate your dish, and add tags
3. **Browse Feed**: View all your food entries in a scrollable feed
4. **Profile**: Access your profile to view account details and sign out

## Components

### Pages
- `Home`: Main feed displaying all food entries
- `AddEntry`: Form for creating new food entries
- `Login`: Authentication page for sign in/sign up
- `Profile`: User profile and settings

### Components
- `Header`: Navigation header with app title and profile access
- `EntryCard`: Card component for displaying food entries
- `StarRating`: Interactive star rating component

### Context
- `AuthContext`: Manages user authentication state
- `EntriesContext`: Manages food entries and image uploads

## Customization

The app uses a custom color palette defined in `tailwind.config.js`. You can modify the primary colors to match your brand:

```javascript
colors: {
  primary: {
    50: '#fef7ee',
    100: '#fdedd7',
    500: '#f97316', // Main brand color
    600: '#ea580c',
    700: '#c2410c',
  }
}
```

## Future Enhancements

- [ ] PWA capabilities with service worker
- [ ] Offline support
- [ ] Push notifications
- [ ] Social sharing features
- [ ] Advanced filtering and search
- [ ] Analytics and insights
- [ ] Export functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
