# PROTOCOL — Deploy Guide

Get your workout app live on a real URL in ~15 minutes. No coding required.

## Step 1 — Get an Anthropic API Key (~3 min)

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** in the sidebar → **Create Key**
4. Copy the key (starts with `sk-ant-...`) — you'll paste it into the app later
5. Go to **Plans & Billing** and add ~$5 of credit. That's enough for hundreds of workout generations.

## Step 2 — Create a GitHub Account (skip if you have one) (~2 min)

1. Go to https://github.com → Sign up (free)
2. Verify your email

## Step 3 — Upload the Code to GitHub (~5 min)

The easiest way, no command line needed:

1. On GitHub, click **+ (top right) → New repository**
2. Name it `protocol-workout` (or whatever)
3. Set to **Public** (free Vercel deploys need this) or **Private** (works too with free Vercel)
4. Click **Create repository**
5. On the empty repo page, click **uploading an existing file**
6. Drag the entire contents of this folder (everything in `protocol-deploy/`) into the upload area
7. Click **Commit changes**

## Step 4 — Deploy to Vercel (~5 min)

1. Go to https://vercel.com → **Sign up with GitHub** (free)
2. After signup, click **Add New → Project**
3. Find `protocol-workout` in the list → click **Import**
4. Leave all settings as default (Vercel auto-detects Vite)
5. Click **Deploy**
6. Wait ~60 seconds. You'll get a URL like `protocol-workout-yourname.vercel.app`

That's it. Visit the URL — your app is live.

## Step 5 — Add to Home Screen (~30 sec)

On your iPhone:

1. Open the URL in **Safari** (not Chrome — Chrome can't add to home screen on iOS)
2. Tap the **Share** icon (square with up arrow)
3. Scroll down → tap **Add to Home Screen**
4. Name it **Protocol** → tap **Add**

You now have a Protocol icon on your home screen. One tap launches it full-screen with no browser bars — looks and feels like a native app.

## Step 6 — Add Your API Key (~30 sec)

1. Open Protocol from your home screen
2. Tap **PROFILE** (bottom right)
3. Scroll to **ANTHROPIC API KEY** → tap **ADD**
4. Paste your key from Step 1 → **SAVE**

You're live. Generate a workout to test.

## Step 7 — Migrate Data from the Artifact (optional, ~1 min)

If you already logged sessions in the Claude artifact and want them in your live app:

1. Open the artifact → **PROFILE** tab → **EXPORT JSON**
2. The file `protocol-backup-DATE.json` saves to your phone
3. In your live app → **PROFILE** → **IMPORT JSON** → pick that file
4. Confirm. All your history is now in the live app.

## Updating the App

When I send you new code:

1. Go to your GitHub repo → click on `src/App.jsx` (or whichever file changed)
2. Click the pencil icon (Edit)
3. Paste the new code → scroll down → **Commit changes**
4. Vercel auto-deploys in ~30 seconds
5. Refresh your home screen Protocol icon — new version is live

If multiple files changed, repeat for each, or use **Add file → Upload files** to drag-replace.

## Troubleshooting

**"No API key set" error when generating:** Profile tab → add your key.

**"401 unauthorized" or "rate_limited":** API key is invalid, or you ran out of credit. Check console.anthropic.com.

**App looks broken / blank screen on first load:** Open browser dev tools (or just hard refresh: pull down on the page in Safari). Sometimes the first load needs a refresh after deploy.

**My data disappeared:** Browser storage is per-device-per-browser. If you cleared Safari history or switched browsers, data is gone. **Export JSON regularly** — it's your only backup.

**Want a custom domain (like protocol.yourname.com)?** In Vercel project → Settings → Domains → buy or connect one. Vercel handles SSL automatically.

## Privacy Notes

- Your API key is stored in **your browser only** — never sent to me, Vercel, or anyone except Anthropic when generating workouts.
- Your workout data is stored in **your browser only** (localStorage). Nothing syncs to a server.
- **Implication:** different browsers / devices = different data. Use Export/Import to move between.
- Never put your API key in the source code or commit it to GitHub.
