# Supabase Setup Instructions

## 1. Create a Supabase project
Go to https://supabase.com → New Project → choose a name and password.

## 2. Get your API keys
Dashboard → Settings → API

Copy:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role secret key → `SUPABASE_SERVICE_ROLE_KEY`

Paste them into `.env.local`

## 3. Run the database schema
Dashboard → SQL Editor → New Query

Paste the full contents of `supabase/schema.sql` and click **Run**.

## 4. Configure Auth settings
Dashboard → Authentication → URL Configuration
- Site URL: `http://localhost:3000` (change to your prod URL later)
- Redirect URLs: `http://localhost:3000/**`

## 5. (Optional) Disable email confirmation for dev
Dashboard → Authentication → Providers → Email

Turn off **Confirm email** so you can test login immediately without checking inbox.
