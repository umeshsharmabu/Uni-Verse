# 

Deployed Linnk: https://uni-verse-1.lovable.app 

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Supabase and Vercel setup

Phase I uses Supabase for authentication, PostgreSQL, row-level security,
storage, and registration/check-in transactions. Payments are not implemented.

1. Create or select a Supabase project and apply the migrations in
   `supabase/migrations`.
2. Enable email confirmation in Supabase Auth and configure the site's redirect
   URL.
3. Copy `.env.example` to `.env.local` and set
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Add the same two public environment variables in the Vercel project
   settings, then deploy the Vite build.

The frontend must never contain a Supabase service-role key. Keep privileged
operations behind RLS-protected RPCs or a server-side function.
