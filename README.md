# Share Your Story

A beautiful web app for recording 60-second video testimonials about what Jesus has done in your life.

## Features

- 📹 Record up to 60 seconds using your webcam
- ⏱️ Visual countdown timer
- 👀 Preview your recording before saving
- 🔄 Option to retake if needed
- 💾 Download your video locally

## Deploying to GitHub Pages

1. Create a new repository on GitHub
2. Push this code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to your repository's **Settings** → **Pages**
4. Under "Source", select **Deploy from a branch**
5. Select **main** branch and **/ (root)** folder
6. Click **Save**

Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## Local Development

Simply open `index.html` in a modern web browser. Note that camera access requires either:
- Serving from `localhost`
- Serving over HTTPS
- Opening the file directly (works in most browsers)

For a local server, you can use:
```bash
npx serve .
```

## Browser Support

Works best in modern browsers:
- Chrome / Edge (recommended)
- Firefox
- Safari

## Privacy

All video recording and processing happens locally in your browser. No data is sent to any server.

