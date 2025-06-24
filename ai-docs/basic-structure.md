# Paraguay Real Estate Catalog - Project Structure

This document outlines the basic structure of the Paraguay Real Estate Catalog project, including the organization of directories, key files, and the technologies used.

## 1. High-Level Overview

The project is a [Next.js](https://nextjs.org/) application built with the [App Router](https://nextjs.org/docs/app) paradigm. It uses [TypeScript](https://www.typescriptlang.org/) for type safety and [Tailwind CSS](https://tailwindcss.com/) for styling. The backend is implemented using Next.js API Routes, and it connects to a [Neon](https://neon.tech/) serverless Postgres database.

## 2. Directory Structure

The project follows a standard Next.js App Router structure, with some additional directories for project-specific organization.

```
/
├── app/                  # Application pages, layouts, and API routes
├── components/           # Reusable React components
├── lib/                  # Core application logic and database access
├── public/               # Static assets (images, fonts, etc.)
├── scripts/              # Database setup and seeding scripts
├── styles/               # Global stylesheets
└── ...                   # Configuration files
```

### `app/`

This directory is the core of the Next.js application.

-   `app/page.tsx`: The main entry point and home page for the application. It's a client component that fetches and displays property listings.
-   `app/layout.tsx`: The root layout of the application. It applies global styles.
-   `app/globals.css`: The main global stylesheet for the application.
-   `app/api/`: Contains all the backend API endpoints.
    -   `app/api/properties/route.ts`: API endpoint to list properties with filtering and sorting.
    -   `app/api/properties/[id]/route.ts`: API endpoint to get a single property by its ID.
    -   `app/api/properties/map/route.ts`: API endpoint to fetch property data optimized for the map view.
    -   `app/api/properties/stats/route.ts`: API endpoint for property statistics.
    -   `app/api/properties/filters/route.ts`: API endpoint to get unique values for filter controls.

### `components/`

This directory houses all the React components used throughout the application.

-   `components/ui/`: Contains a collection of generic, reusable UI components (e.g., `Button`, `Card`, `Dialog`). These are based on [shadcn/ui](https://ui.shadcn.com/).
-   Application-specific components: These components are built using the base UI components and are tailored for the application's domain.
    -   `property-card.tsx`: Displays a single property in a list or grid view.
    -   `property-filters.tsx`: Renders the filtering controls for properties.
    -   `property-map.tsx`: Displays properties on an interactive map.
    -   `market-analytics.tsx`: Shows charts and statistics about the real estate market.
    -   `property-detail-modal.tsx`: A modal dialog to show detailed information about a property.

### `lib/`

Contains the core business logic, database interactions, and utility functions.

-   `lib/database.ts`: This is a crucial file that handles all communication with the Postgres database. It uses the `@neondatabase/serverless` driver to execute raw SQL queries. It defines the main data types and includes functions for fetching, filtering, and sorting properties.
-   `lib/utils.ts`: Contains utility functions used across the application, provided by `shadcn/ui`.

### `public/`

This directory stores all static assets that are publicly accessible, such as images, logos, and placeholder content.

### `scripts/`

Contains SQL scripts for managing the database.

-   `setup-database.sql`: A script to create the database schema (tables, columns, etc.).
-   `seed-sample-data.sql`: A script to populate the database with initial sample data for development and testing.

### `styles/`

The `styles/globals.css` file exists but is not imported. The primary global stylesheet is `app/globals.css`.

### `hooks/`

This directory contains custom React hooks. Note that some hooks like `use-toast` and `use-mobile` are also present in `components/ui/`. The versions in `components/ui/` are likely the ones in use, as they are part of the `shadcn/ui` ecosystem.

## 3. Key Configuration Files

-   `package.json`: Defines project metadata, dependencies (`next`, `react`, `tailwindcss`, `@neondatabase/serverless`, etc.), and scripts (`dev`, `build`, `start`).
-   `next.config.mjs`: Configuration file for Next.js.
-   `tailwind.config.ts`: Configuration file for Tailwind CSS, where the design system (colors, spacing, fonts) is defined.
-   `tsconfig.json`: TypeScript compiler options.

## 4. Technology Stack

-   **Framework**: Next.js 14+ (App Router)
-   **Language**: TypeScript
-   **UI**: React, Tailwind CSS, shadcn/ui, Recharts (for charts)
-   **Backend**: Next.js API Routes
-   **Database**: Neon (Serverless Postgres)
-   **Forms**: React Hook Form
-   **Package Manager**: pnpm 