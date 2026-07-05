# AI Email Generator

An AI-powered email generator built with **Next.js**, **Supabase**, and **Groq AI**. Users sign in, describe what they need, and get a professional email instantly.

**Live Demo:** [ai-email-generator-6pxy.vercel.app](https://ai-email-generator-6pxy.vercel.app)

---

## Features

- AI Email Generation — Powered by Groq's Llama 3.1 8B Instant model
- User Authentication — Sign up / Sign in with Supabase Auth (email & password)
- Email History — All generated emails are saved per user in Supabase PostgreSQL
- Delete Drafts — Users can delete saved drafts
- Dark / Light Mode — Theme preference saved in localStorage
- Responsive Design — Works on all screen sizes
- Secure API — Groq API key is server-side only, never exposed to the browser

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org) | Full-stack React framework (frontend + API routes) |
| [TypeScript](https://www.typescriptlang.org) | Type-safe JavaScript |
| [Supabase](https://supabase.com) | Authentication + PostgreSQL database |
| [Groq API](https://groq.com) | Fast AI inference — Llama 3.1 8B model |
| [Vercel](https://vercel.com) | Deployment & hosting |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first CSS styling |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/NiranjanBorse1/ai-email-generator.git
cd ai-email-generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 4. Set up Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a table called `email_drafts` with the following columns:

```sql
create table email_drafts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  text text not null,
  created_at timestamp with time zone default now()
);
```

3. Enable Row Level Security (RLS) and add a policy so users can only access their own drafts.

4. Go to **Authentication → URL Configuration** and set:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/**` and `http://localhost:3000/**`

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API → Anon/Public Key |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # Server-side API route — calls Groq AI
│   ├── layout.tsx             # Root layout — fonts, tab title, global styles
│   ├── page.tsx               # Main page — auth UI + email generator UI
│   └── globals.css            # Global CSS styles
└── lib/
    └── supabase/
        └── browser.ts         # Supabase client factory for browser
```

---

## How It Works

```
User fills form (purpose + recipient + tone)
        |
page.tsx sends POST request to /api/generate
        |
API route verifies Supabase auth token
        |
Builds a prompt and sends to Groq API (Llama 3.1)
        |
AI returns generated email
        |
Email displayed on screen + saved to Supabase database
```

---

## Deployment

This app is deployed on **Vercel** with automatic CI/CD:

- Every push to `main` branch triggers an automatic deployment
- Environment variables are configured in the Vercel dashboard
- Live URL: [ai-email-generator-6pxy.vercel.app](https://ai-email-generator-6pxy.vercel.app)

To deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NiranjanBorse1/ai-email-generator)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

**Niranjan Borse**
- GitHub: [@NiranjanBorse1](https://github.com/NiranjanBorse1)
