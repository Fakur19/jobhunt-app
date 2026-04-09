# JobHunt OS

A comprehensive job search management suite built with React, Tailwind CSS, and Google Gemini AI.

## Features

- **Dashboard**: Real-time overview of application activity and key metrics.
- **My Applications**: Track every job application and generate tailored cover letters using AI.
- **Offers Received**: Manage interview invitations and offers, with AI-generated interview cheat sheets.
- **Resume Builder**: Create, edit, and refine your resume with AI assistance. Supports live preview and professional headshot integration.
- **AI Avatar**: Generate professional headshots from selfies to enhance your resume.
- **AI Job Assistant**: A context-aware chatbot that helps you prepare for interviews and analyze your job search data.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4.
- **UI Components**: shadcn/ui, Lucide React icons, Framer Motion (via `motion/react`).
- **Charts**: Recharts.
- **AI**: Google Gemini 3 Flash via `@google/genai` SDK.
- **State Management**: React Context API with LocalStorage persistence.

## Project Structure

- `src/pages/`: Individual page components for each feature.
- `src/components/layout/`: Global layout, sidebar, and topbar.
- `src/context/JobContext.tsx`: Global state management for applications, offers, and resume data.
- `src/services/ai.ts`: Integration with Gemini API for text and JSON generation.
- `src/types.ts`: TypeScript interfaces and types.

## Extensibility Hooks

- **Database**: Replace the `localStorage` logic in `src/context/JobContext.tsx` with a real database like Firebase Firestore or a custom backend API.
- **Authentication**: Add a wrapper around the `JobProvider` to handle user login (e.g., Firebase Auth or NextAuth).
- **Payments**: Integrate Stripe in the `ResumeBuilder` or `AiAvatar` pages to monetize premium AI features.
- **PDF Export**: Implement a PDF generation service (e.g., `jspdf` or a server-side solution) in the `ResumeBuilder` export action.
