# GitHub Pages Deployment Guide

This guide explains how to deploy the OB Digital Portal to GitHub Pages.

## Important: Architecture Considerations

GitHub Pages can only host **static websites** (HTML, CSS, JavaScript). This means:

✅ **Frontend (Next.js)** - CAN be deployed to GitHub Pages
❌ **Backend API (Express)** - CANNOT be deployed to GitHub Pages

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│  GitHub Pages (Static Frontend)            │
│  https://yourusername.github.io/demoportal3│
└──────────────────┬──────────────────────────┘
                   │
                   │ API Calls
                   ↓
┌─────────────────────────────────────────────┐
│  Backend API (Must run separately)          │
│  Options:                                   │
│  1. Localhost (http://localhost:3001)       │
│  2. Cloud platform (Heroku, Railway, etc.)  │
│  3. Your own server                         │
└─────────────────────────────────────────────┘
```

## Quick Setup (Automatic)

The repository is already configured with GitHub Actions. To enable deployment:

### 1. Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/santanug5ai/demoportal3`
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Save the changes

### 2. Merge Your PR to Main Branch

Once you merge the PR from `claude/digital-portal-monorepo-015gPwfMraBrBtBNTvaxMWKN` to `main`, the deployment will automatically start.

### 3. Wait for Deployment

The GitHub Actions workflow will:
- Install dependencies
- Build the shared package
- Build the frontend as static HTML
- Deploy to GitHub Pages

Check the "Actions" tab to monitor progress.

## After Deployment

Your frontend will be available at:
```
https://santanug5ai.github.io/demoportal3
```

## Configuring the Backend API

Since the backend API cannot run on GitHub Pages, you have **3 options**:

### Option 1: Run Backend Locally (Development)

**Best for testing and development**

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd shared && npm run build && cd ..
   ```

3. Start the backend API:
   ```bash
   cd services/portal-api
   npm run dev
   ```

4. The API will run at `http://localhost:3001`

5. **Important:** The frontend on GitHub Pages is configured to use `http://localhost:3001/api` by default, so you can test it while running the backend locally.

### Option 2: Deploy Backend to a Cloud Platform (Production)

**Best for production use**

Deploy the backend API to a platform like:

- **Railway** (Recommended): https://railway.app
- **Heroku**: https://heroku.com
- **Render**: https://render.com
- **DigitalOcean App Platform**: https://digitalocean.com
- **AWS/GCP/Azure**: Any cloud provider

**Steps:**

1. Deploy the `services/portal-api` folder to your chosen platform
2. Set environment variables:
   ```
   PORT=3001 (or as required by platform)
   JWT_SECRET=your-secret-key-change-this
   NODE_ENV=production
   ```

3. Note your deployed API URL (e.g., `https://your-api.railway.app`)

4. Update the frontend to use your API URL:
   - Fork the repo or create a new branch
   - Edit `frontend/src/lib/api.ts` line 3:
     ```typescript
     const API_BASE_URL = 'https://your-api.railway.app/api';
     ```
   - Commit and push to trigger redeployment

### Option 3: Use Environment Variable

**Alternative approach:**

1. Create a `frontend/.env.production` file:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api
   ```

2. The app will use this URL in production builds

## Testing the Deployment

1. Open your GitHub Pages URL: `https://santanug5ai.github.io/demoportal3`

2. Make sure your backend API is running (locally or on a cloud platform)

3. Try logging in with demo credentials:
   - Username: `sales1`, `integrator1`, `partner1`, or `viewer1`
   - Password: `password123`

4. If login fails, check:
   - Is the backend API running?
   - Is the API URL correct?
   - Check browser console for errors (F12)
   - Check CORS configuration in the backend

## CORS Configuration

If your backend is on a different domain than GitHub Pages, you need to configure CORS:

Edit `services/portal-api/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://santanug5ai.github.io'
  ],
  credentials: true
}));
```

## Manual Build and Test

To test the static build locally before deployment:

```bash
# Build the frontend
cd frontend
npm run build

# The static files will be in frontend/out/
# You can serve them with any static server:
npx serve out
```

## Troubleshooting

### Frontend doesn't load
- Check GitHub Pages is enabled in repository settings
- Check the GitHub Actions workflow completed successfully
- Clear browser cache and try again

### API calls fail
- Ensure backend API is running
- Check API URL in browser console
- Verify CORS settings in backend
- Check network tab (F12) for failed requests

### Login doesn't work
- Backend API must be running
- Check that `NEXT_PUBLIC_API_URL` points to correct backend
- Verify JWT_SECRET is set in backend environment

### Styling looks broken
- GitHub Pages may take a few minutes to update
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check that `basePath` in `next.config.js` matches your repo name

## Recommended Production Setup

For a complete production deployment:

1. **Frontend**: GitHub Pages (free, reliable, CDN)
2. **Backend**: Railway/Render (easiest) or AWS/GCP (more control)
3. **Database**: Upgrade from JSON files to PostgreSQL/MongoDB
4. **Authentication**: Use environment-specific JWT secrets
5. **HTTPS**: Ensure backend has SSL certificate
6. **Monitoring**: Add error tracking (Sentry) and analytics

## Cost Estimate

- **GitHub Pages**: Free (public repos)
- **Railway**: Free tier available, ~$5-10/month for production
- **Heroku**: Free tier removed, ~$7/month minimum
- **Render**: Free tier available, ~$7/month for production

## Alternative: Full Stack Deployment

If you want to deploy everything together (not using GitHub Pages):

Use platforms that support both frontend and backend:
- **Vercel** (with serverless functions)
- **Netlify** (with serverless functions)
- **Render** (full stack)
- **Railway** (full stack)

These platforms can deploy both Next.js and Node.js apps together.
