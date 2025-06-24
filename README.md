# Paraguay Real Estate Catalog

A modern real estate platform built with Next.js, TypeScript, and Tailwind CSS, featuring interactive maps and advanced property filtering.

## 🚀 Deployment to Railway

### Prerequisites
- Railway account ([railway.app](https://railway.app))
- Neon database with property data

### Step 1: Create New Railway Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository

### Step 2: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

Replace with your actual Neon database connection string.

### Step 3: Deploy
Railway will automatically:
- Install dependencies with `pnpm`
- Build the application with `pnpm run build`
- Start the server with `pnpm start`

### Features
- 🗺️ Interactive Leaflet maps with custom pins
- 🏠 Property listings with advanced filtering
- 📊 Market analytics and deal categorization
- 💫 Hover animations and smooth transitions
- 📱 Responsive design
- 🎨 Modern UI with shadcn/ui components

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Maps**: React Leaflet
- **Database**: Neon (Serverless Postgres)
- **Animations**: Framer Motion
- **Package Manager**: pnpm

## Local Development

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (DATABASE_URL)
4. Run development server: `pnpm dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `DATABASE_URL` - Neon database connection string (required)
- `NODE_ENV` - Environment (development/production)

## Project Structure

```
├── app/                 # Next.js App Router pages and API routes
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   └── ...             # Application-specific components
├── lib/                # Utilities and database functions
├── public/             # Static assets
└── scripts/            # Database setup scripts
``` 