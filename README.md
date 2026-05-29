<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Ticket Category Sales and Entry - Tickster Dashboard

This application helps manage Tickster tickets with categorization and sales tracking.

View your app in AI Studio: https://ai.studio/apps/d00dffed-b8f5-4f5b-829c-6a7c157861a9

## Local Development

**Prerequisites:**  Node.js 18+

### Option 1: Using Netlify CLI (Recommended for testing Functions locally)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

4. Run with Netlify dev server:
   ```bash
   netlify dev
   ```

This runs both the Vite app and Netlify Functions locally on `http://localhost:8888`.

### Option 2: Quick development (Vite only)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local)

3. Run:
   ```bash
   npm run dev
   ```

The app runs on `http://localhost:5173`, but API calls won't work locally without the Functions running.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Netlify Functions (serverless)
- **API Proxies**: 
  - `/api/fetch-tickets` - Proxy to Tickster API
  - `/api/fetch-events` - Proxy to Tickster Events API

## Deployment to Netlify

1. Connect your repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

3. Add environment variables in Netlify dashboard:
   - `GEMINI_API_KEY` (if using Google GenAI)

4. Deploy! The `netlify.toml` file handles all configuration.

### How it works

- Vite builds the React app to the `dist` directory
- Netlify Functions in `netlify/functions/` handle API proxying
- The `netlify.toml` file redirects `/api/*` requests to serverless functions
- All credentials are sent from the frontend (stored in localStorage)
