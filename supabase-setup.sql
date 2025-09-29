-- Food Diary Database Setup
-- Run this in your Supabase SQL Editor

-- Create entries table for food entries
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create storage bucket for food images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entries table
CREATE POLICY "Users can view their own entries" ON public.entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON public.entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" ON public.entries
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for food images
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'food-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'food-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public images can be viewed" ON storage.objects
  FOR SELECT USING (bucket_id = 'food-images');

-- Optional: Create an index for better performance
CREATE INDEX IF NOT EXISTS entries_user_id_created_at_idx 
ON public.entries(user_id, created_at DESC);

-- Success message
SELECT 'Database setup completed successfully!' as message;
