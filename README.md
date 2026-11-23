# Moulay Travel — Clean Source Code

This repository contains the clean, unbloated source code for **Moulay Travel** (https://moulay-travel.vercel.app/).

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Internationalization:** next-intl (Arabic, French, English)
- **Styling:** Tailwind CSS + Framer Motion
- **Database & Auth:** Firebase Firestore + Firebase Auth
- **Icons:** Lucide React

## Goals for Optimization & Cloudflare Deployment
1. Fix security vulnerabilities in `/admin` authentication and `middleware.ts`.
2. Adapt routing, server logic, and API routes for Cloudflare Pages (`@cloudflare/next-on-pages` or OpenNext).
3. Eliminate redundant server dependencies (like heavy Google APIs if handled via client/webhooks).
4. Resolve all TypeScript and build warnings.
