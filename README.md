# Share Your Story

A beautiful web app for recording and sharing 60-second video testimonials about what Jesus has done in your life.

## Features

- 📹 Record up to 60 seconds using your webcam
- ⏱️ Visual countdown timer
- 👀 Preview your recording before submitting
- 🔄 Option to retake if needed
- ☁️ Upload to cloud storage (Supabase)
- 🖼️ Gallery to view all submitted stories

---

## Supabase Setup (Step-by-Step)

### Step 1: Create a Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project** (top right)
3. Sign up with GitHub or email
4. Click **New Project**
5. Fill in:
   - **Name:** `story-capture` (or anything you like)
   - **Database Password:** Create a strong password (save it somewhere)
   - **Region:** Choose closest to you
6. Click **Create new project**
7. Wait 1-2 minutes for setup to complete

---

### Step 2: Create the Database Table

1. In the left sidebar, click **SQL Editor**
2. Click **New query**
3. Paste this entire block:

```sql
-- Create table
CREATE TABLE stories (
    id TEXT PRIMARY KEY,
    video_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view
CREATE POLICY "Allow public viewing" ON stories
    FOR SELECT USING (true);

-- Allow anyone to insert
CREATE POLICY "Allow public insert" ON stories
    FOR INSERT WITH CHECK (true);
```

4. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
5. You should see "Success. No rows returned"

---

### Step 3: Create the Storage Bucket

1. In the left sidebar, click **Storage**
2. Click **New bucket**
3. Fill in:
   - **Name of bucket:** `videos`
   - ✅ Check **Public bucket**
4. Click **Create bucket**

---

### Step 4: Add Storage Policy for Viewing

1. Click on the `videos` bucket you just created
2. Click the **Policies** tab
3. Under "Other policies under storage.objects", click **New policy**
4. Click **For full customization**
5. Fill in:
   - **Policy name:** `Allow public viewing`
   - **Allowed operation:** Check ✅ **SELECT**
   - **Target roles:** Leave as default
   - **Policy definition:** Type exactly:
     ```
     bucket_id = 'videos'
     ```
6. Click **Review**
7. Click **Save policy**

---

### Step 5: Add Storage Policy for Uploading

1. Still on the Policies tab, click **New policy** again
2. Click **For full customization**
3. Fill in:
   - **Policy name:** `Allow public uploads`
   - **Allowed operation:** Check ✅ **INSERT**
   - **Target roles:** Leave as default
   - **Policy definition:** Type exactly:
     ```
     bucket_id = 'videos'
     ```
4. Click **Review**
5. Click **Save policy**

---

### Step 6: Get Your API Keys

1. In the left sidebar, click **Project Settings** (gear icon at bottom)
2. Click **API** in the settings menu
3. You'll see two values you need:
   - **Project URL** - looks like `https://abcdefg.supabase.co`
   - **anon public** key - a long string starting with `eyJ...`
4. Copy these values

---

### Step 7: Update config.js

Open `config.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-key-here';
```

---

### Step 8: Deploy

```bash
git add .
git commit -m "Add Supabase credentials"
git push
```

Your app will be live at: `https://YOUR_USERNAME.github.io/story-capture/`

---

## Local Development

Open `index.html` in a browser, or run a local server:

```bash
npx serve .
```

**Note:** Camera access requires `localhost`, HTTPS, or direct file access.

## Browser Support

- Chrome / Edge (recommended)
- Firefox
- Safari

## Privacy

Videos are stored in your own Supabase project. You have full control over your data. The anon key is designed to be public and is protected by Row Level Security policies.
