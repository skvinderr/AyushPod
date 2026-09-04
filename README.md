# MediKiosk (AyushPod)

An AI-powered patient case-taking platform for Indian government hospital OPDs, built for Smart India Hackathon (SIH26047 - Ministry of Ayush, category: Software, theme: MedTech/HealthTech).

## Overview

The platform consists of three main frontend applications sharing a common Express backend:
- **/patient**: Touchscreen kiosk app for patients to provide their history. Designed for accessibility with an animated avatar guide and voice prompts.
- **/doctor**: Dashboard for doctors to view structured AI-generated summaries of patient histories.
- **/admin**: Hospital staff panel for kiosk monitoring, queue management, and alerts.

## Tech Stack
- **Frontend**: Next.js, React Three Fiber (Three.js), Framer Motion, TailwindCSS.
- **Voice**: Sarvam AI (saaras:v3) + RNNoise for noise suppression.
- **Backend**: Node.js + Express (REST API).
- **Data Models**: FHIR-resource-shaped data models with Ayurvedic Dashavidha Pariksha integration.
- **Monorepo**: npm workspaces.

## Structure
```
medikiosk/
  patient/       -- patient kiosk React app
  doctor/        -- doctor dashboard React app
  admin/         -- admin/staff panel React app
  backend/       -- shared Express API
  shared/        -- shared TypeScript types
```

## Running the Project

From the root directory, run:
```bash
npm install
npm run dev:all
```
This will start all frontends and the backend concurrently.
