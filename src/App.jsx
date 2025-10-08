import { Navigate, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { useUser } from '@clerk/clerk-react';
import Header from './components/custom/Header';
import { Toaster } from './components/ui/sonner';

function App() {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/share/'];
  const isPublicRoute = publicRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (!isSignedIn && isLoaded && !isPublicRoute) {
    return <Navigate to={'/auth/sign-in'} />;
  }

  return (
    <>
      {!isPublicRoute && <Header />}
      <Outlet />
      <Toaster />
    </>
  );
}

export default App;
