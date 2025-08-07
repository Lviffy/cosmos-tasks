# Environment Setup Guide

## Overview
This project uses environment variables to securely store sensitive configuration like API keys. The main configuration is for Supabase, which provides the backend database and authentication services.

## Environment Variables

### Required Variables

1. **VITE_SUPABASE_URL** - Your Supabase project URL
2. **VITE_SUPABASE_ANON_KEY** - Your Supabase anonymous/public key

## How to Get Your Supabase Keys

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter a project name (e.g., "cosmos-tasks")
6. Enter a database password (save this securely)
7. Choose a region close to your users
8. Click "Create new project"

### Step 2: Get Your Project Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll find your keys in the "Project API keys" section:
   - **Project URL**: Copy the "Project URL" (this is your `VITE_SUPABASE_URL`)
   - **anon public**: Copy the "anon public" key (this is your `VITE_SUPABASE_ANON_KEY`)

### Step 3: Set Up Environment Variables
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit your `.env` file** - It's already in `.gitignore`
2. **Never share your service role key** - Only use the anon/public key for client-side code
3. **Keep your keys secure** - Don't post them in public repositories or chat applications
4. **Use different keys for development and production** - Create separate Supabase projects if needed

## Environment File Structure

```
cosmos-tasks/
├── .env                 # Your actual environment variables (not committed)
├── .env.example        # Template showing required variables
└── .gitignore          # Ensures .env is not committed
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Make sure your `.env` file exists in the project root
   - Verify the variable names match exactly (case-sensitive)
   - Restart your development server after adding environment variables

2. **"Invalid API key" error**
   - Double-check that you copied the correct key from Supabase
   - Ensure you're using the "anon public" key, not the "service_role" key
   - Verify the project URL is correct

3. **Environment variables not loading**
   - In Vite, environment variables must be prefixed with `VITE_`
   - Restart your development server after changing environment variables

### Getting Help

If you're still having issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Verify your project is active in the Supabase dashboard
3. Ensure your database is properly set up with the required tables

## Additional Configuration

### Optional: Service Role Key
For server-side operations (if you add a backend), you can also add:
```env
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Warning**: The service role key has full database access. Only use it in secure server-side code, never in client-side code. 