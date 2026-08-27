# DevOps Frontend

## Purpose & Technologies

A Next.js (App Router, TypeScript, Tailwind CSS) frontend built as part of a
DevOps project. It connects to a backend REST API and displays its response,
demonstrating a working frontend-backend integration deployed via CI/CD.

## Features

- Home page with a "Check Backend" action
- Fetches and displays the backend's root message
- Fetches and displays the backend's current application version

## Running Locally

1. Install dependencies: `npm install`
2. Create `.env.local` with: NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
3. Start the dev server: `npm run dev`
4. Visit `http://localhost:3000` (or the port shown in the terminal)

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` – base URL of the backend API. In production this
  will point to `https://BACKEND_DOMAIN`.

## Deployment

This application is automatically deployed via GitHub Actions on every push
to the `main` branch. The workflow (`.github/workflows/deploy.yml`):

1. Checks out the code
2. Installs dependencies
3. Builds the app as a static export (`next build` with `output: 'export'`)
4. Copies the `out/` folder contents to the server via SCP
5. Verifies the deployment by checking that Nginx serves the site

The server uses Nginx to serve the static files directly, with HTTPS handled
via Let's Encrypt (Certbot).

## Live Domain

https://muhammet-frontend.team-vit-devops.nl
