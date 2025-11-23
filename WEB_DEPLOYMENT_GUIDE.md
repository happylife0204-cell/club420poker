# Club 420 Poker - Web Deployment Guide

## ✅ Web Build Complete!

Your Club 420 Poker app has been successfully built for web deployment. The build files are in the `dist/` folder.

---

## 🚀 Quick Deployment Options

### Option 1: Netlify (Recommended - Easiest)

**Free hosting with automatic HTTPS and custom domains**

#### Steps:

1. **Sign up at [netlify.com](https://netlify.com)** (free account)

2. **Deploy via drag & drop:**
   - Click "Add new site" → "Deploy manually"
   - Drag the entire `dist` folder to the upload area
   - Done! Your site is live in seconds

3. **Get your URL:**
   - Netlify gives you: `https://[random-name].netlify.app`
   - Example: `https://club420poker.netlify.app`

4. **Custom domain (optional):**
   - In Netlify: Site settings → Domain management
   - Add your custom domain: `poker.yoursite.com`

---

### Option 2: Vercel

**Similar to Netlify, great performance**

#### Steps:

1. **Sign up at [vercel.com](https://vercel.com)** (free account)

2. **Deploy via CLI:**
   ```bash
   npm install -g vercel
   cd /home/user/workspace
   vercel --prod
   ```

3. **Or drag & drop:**
   - Go to vercel.com dashboard
   - Click "Add New" → "Project"
   - Drag the `dist` folder

---

### Option 3: GitHub Pages

**Free hosting via GitHub**

#### Steps:

1. **Create GitHub repo** (if you don't have one)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/club420poker.git
   git push -u origin main
   ```

2. **Push dist folder to gh-pages branch:**
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```

3. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Source: `gh-pages` branch
   - Your site: `https://yourusername.github.io/club420poker`

---

### Option 4: Render

**Free static site hosting**

#### Steps:

1. **Sign up at [render.com](https://render.com)**

2. **New Static Site:**
   - Connect your GitHub repo OR
   - Upload the `dist` folder manually

3. **Settings:**
   - Publish directory: `dist`
   - Deploy

---

## 📱 Add to Home Screen Instructions

Once deployed, users can "install" your app:

### iOS (Safari):
1. Open the URL in Safari
2. Tap Share button (box with arrow)
3. Scroll down → "Add to Home Screen"
4. Tap "Add"
5. App appears on home screen like a native app!

### Android (Chrome):
1. Open the URL in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home screen"
4. Tap "Add"
5. App appears on home screen!

---

## 🔧 Rebuilding After Changes

Whenever you make code changes:

```bash
# Rebuild the web version
npx expo export --platform web

# Deploy the updated dist folder
# (use your chosen method from above)
```

---

## 🌐 Custom Domain Setup

### For Netlify/Vercel:
1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Netlify/Vercel dashboard:
   - Add custom domain
   - Update DNS settings (they'll guide you)
3. HTTPS is automatic!

Example: `https://club420poker.com`

---

## 📊 What You Get

✅ **Progressive Web App (PWA)**
- Installable on home screen
- Works offline (partial)
- Fast loading
- Native-like experience

✅ **Features:**
- All authentication methods (Telegram, Email, C420)
- Profile management with avatar upload
- CHiP$ currency system
- Banker marketplace
- Poker lobby and table hosting
- Real-time gameplay (once Socket.IO server is connected)

✅ **Mobile Optimized:**
- Responsive design
- Touch-friendly
- Smooth animations
- Portrait orientation

---

## 🎯 Recommended Next Steps

1. **Deploy to Netlify** (easiest, drag & drop the `dist` folder)
2. **Share the URL** with your users
3. **Instruct users** to "Add to Home Screen"
4. **Optional:** Set up custom domain
5. **Optional:** Connect Socket.IO poker server for real-time gameplay

---

## 🆘 Troubleshooting

### Build failed?
```bash
# Clear cache and rebuild
npx expo start --clear
npx expo export --platform web
```

### App not loading?
- Check browser console for errors
- Ensure all environment variables are set (if using API features)

### Images not loading?
- Images are bundled in the `dist/_expo/static/` folder
- Make sure to deploy the entire `dist` folder, not just index.html

---

## 📞 Support

Your web app is now ready to go live! Choose a deployment method above and share the link with your users.

**Built with:** Expo + React Native Web
**Bundle size:** ~4.6 MB (optimized for web)
**Browser support:** Chrome, Safari, Firefox, Edge (modern versions)

---

🎉 **You're all set!** Deploy the `dist` folder using any of the methods above and start sharing Club 420 Poker with the world!
