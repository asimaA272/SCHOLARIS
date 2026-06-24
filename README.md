# Scholaris — Autonomous Research Collaborator

AI-powered academic paper search and synthesis. Built with Next.js 15, deployed on Vercel. **All APIs are 100% free.**

---

## Project Structure

```
scholaris/
├── app/
│   ├── api/
│   │   └── research/
│   │       └── route.ts        ← BACKEND (API route)
│   ├── globals.css             ← Design tokens + animations
│   ├── layout.tsx              ← HTML shell + metadata
│   └── page.tsx                ← FRONTEND (React UI)
├── public/                     ← Static assets
├── .env.local                  ← API keys (local only, never commit)
├── .gitignore
├── next.config.ts
├── package.json
└── README.md
```

**Frontend files:** `app/page.tsx`, `app/globals.css`, `app/layout.tsx`  
**Backend file:** `app/api/research/route.ts`

---

## APIs Used (All Free)

| API | Cost | Key needed? | What it does |
|-----|------|-------------|--------------|
| Semantic Scholar | FREE | ❌ No | Searches 200M+ academic papers |
| CrossRef | FREE | ❌ No | Enriches papers with DOI metadata |
| Hugging Face Inference | FREE tier | ✅ Yes (free account) | AI summarization of abstracts |

### How to get the Hugging Face API key (free)

1. Go to **https://huggingface.co** → Sign Up (free)
2. Go to **Settings → Access Tokens**
3. Click **"New token"** → select **Read** → copy the token (starts with `hf_...`)
4. That's it. Free tier = 1000 requests/day.

> **Note:** Without the HF key, the app still works perfectly — Semantic Scholar abstracts are shown directly. HF summarization is optional enhancement.

---

## Local Test (Step by Step)

```bash
# 1. Clone or enter project folder
cd scholaris

# 2. Install dependencies
npm install

# 3. Create .env.local file with your keys
echo "HF_API_KEY=hf_your_key_here" > .env.local

# 4. Run locally
npm run dev

# 5. Open browser
# http://localhost:3000
```

---

## GitHub (Step by Step)

```bash
# Inside scholaris/ folder:

# 1. Initialize git (if not already)
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "Initial commit: Scholaris research app"

# 4. Create repo on github.com (name: scholaris) then:
git remote add origin https://github.com/YOUR_USERNAME/scholaris.git

# 5. Push
git branch -M main
git push -u origin main
```

> **Important:** `.env.local` is in `.gitignore` — your API keys are never pushed to GitHub. ✅

---

## Vercel Deploy (Step by Step)

### Option A — via Vercel website (easiest)
1. Go to **https://vercel.com** → Sign Up with GitHub (free)
2. Click **"Add New Project"**
3. Import your `scholaris` GitHub repo
4. Vercel auto-detects Next.js → click **Deploy**
5. **Add environment variable:**
   - Go to Project → **Settings → Environment Variables**
   - Name: `HF_API_KEY`
   - Value: `hf_your_key_here`
   - Click **Save** → **Redeploy**

### Option B — via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
# Follow prompts → auto-deploys to vercel.app URL
```

---

## No paid backend needed

- Frontend **and** Backend both run on Vercel (Next.js API Routes = serverless functions)
- No Express server, no Railway, no Render, no separate hosting needed
- Free tier: 100GB bandwidth/month, unlimited deploys

