# Share Your Story

A beautiful web app for recording and sharing 60-second video testimonials about what Jesus has done in your life.

## Features

- 📹 Record up to 60 seconds using your webcam
- ⏱️ Visual countdown timer
- 👀 Preview your recording before submitting
- 🔄 Option to retake if needed
- ☁️ Upload to cloud storage (Supabase)
- 🖼️ Gallery to view all submitted stories

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and fill in the details
3. Wait for your database to be provisioned

### 2. Create the Database Table

Go to the **SQL Editor** in your Supabase dashboard and run:

```sql
-- Create the stories table
CREATE TABLE stories (
    id TEXT PRIMARY KEY,
    video_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read stories
CREATE POLICY "Anyone can view stories" ON stories
    FOR SELECT USING (true);

-- Allow anyone to insert stories
CREATE POLICY "Anyone can insert stories" ON stories
    FOR INSERT WITH CHECK (true);
```

### 3. Create the Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Name it `videos`
4. Check **Public bucket** (so videos can be viewed)
5. Click **Create bucket**

### 4. Set Storage Policies

Go to the **Storage** section, click on your `videos` bucket, then **Policies**:

**For uploads (INSERT):**
```sql
CREATE POLICY "Anyone can upload videos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'videos');
```

**For viewing (SELECT):**
```sql
CREATE POLICY "Anyone can view videos" ON storage.objects
    FOR SELECT USING (bucket_id = 'videos');
```

### 5. Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** and **anon/public** key
3. Update `config.js` with your credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

## Deploying to GitHub Pages

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push
   ```

2. Go to your repository's **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select **main** branch and **/ (root)** folder
5. Click **Save**

Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## Local Development

Simply open `index.html` in a modern web browser, or run a local server:

```bash
npx serve .
```

**Note:** Camera access requires either `localhost`, HTTPS, or direct file access.

## Browser Support

Works best in modern browsers:
- Chrome / Edge (recommended)
- Firefox
- Safari

## Privacy

Videos are stored in your own Supabase project. You have full control over your data.
