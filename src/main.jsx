import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SignInPage from './auth/sign-in';
import Home from './home';
import Dashboard from './dashboard';
import { ClerkProvider } from '@clerk/clerk-react';
import EditResume from './dashboard/resume/[resumeId]/edit';
import CoverLettersManager from './dashboard/resume/[resumeId]/cover-letters';
import JobApplications from './dashboard/resume/[resumeId]/job-applications';
import NewJobApplication from './dashboard/resume/[resumeId]/job-applications/new';
import JobApplicationDetail from './dashboard/resume/[resumeId]/job-applications/[applicationId]';
import EditJobApplication from './dashboard/resume/[resumeId]/job-applications/[applicationId]/edit';
import CoverLetterApplication from './dashboard/resume/[resumeId]/job-applications/[applicationId]/cover-letter';
import InterviewSimulation from './dashboard/resume/[resumeId]/job-applications/[applicationId]/interview-simulation';
import MyResume from './my-resume/[resumeId]/view';
import { initializeDatabase } from './services/IndexedDBService';
import './index.css';

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/dashboard/resume/:resumeId/edit',
        element: <EditResume />,
      },
      {
        path: '/dashboard/resume/:resumeId/cover-letters',
        element: <CoverLettersManager />,
      },
      {
        path: '/dashboard/resume/:resumeId/job-applications',
        element: <JobApplications />,
      },
      {
        path: '/dashboard/resume/:resumeId/job-applications/new',
        element: <NewJobApplication />,
      },
      {
        path: '/dashboard/resume/:resumeId/job-applications/:applicationId',
        element: <JobApplicationDetail />,
      },
      {
        path: '/dashboard/resume/:resumeId/job-applications/:applicationId/edit',
        element: <EditJobApplication />,
      },
      {
        path: '/dashboard/resume/:resumeId/job-applications/:applicationId/cover-letter',
        element: <CoverLetterApplication />,
      },
      {
        path: '/dashboard/resume/:resumeId/job-applications/:applicationId/interview-simulation',
        element: <InterviewSimulation />,
      },
    ],
  },
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/auth/sign-in',
    element: <SignInPage />,
  },

  {
    path: '/my-resume/:resumeId/view',
    element: <MyResume />,
  },
]);

// Inicializar IndexedDB al cargar la aplicación
initializeDatabase()
  .then(() => {
    console.log('✅ Base de datos local inicializada correctamente');
  })
  .catch((error) => {
    console.error('❌ Error inicializando base de datos local:', error);
  });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);
