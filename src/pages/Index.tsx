
import React from 'react';
import { useRoutes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/seo/SEOHead';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load components for better performance
const Explore = React.lazy(() => import('@/pages/Explore'));
const Auth = React.lazy(() => import('@/pages/Auth'));
const Messages = React.lazy(() => import('@/pages/Messages'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Home = React.lazy(() => import('@/pages/Home'));
const Listing = React.lazy(() => import('@/pages/Listing'));

const Index = () => {
  const { user, loading, isGuest } = useAuth();

  const routes = useRoutes([
    {
      path: '/',
      element: user ? <Home /> : <Auth />
    },
    {
      path: '/explore',
      element: (
        <ProtectedRoute allowGuest={true}>
          <Explore />
        </ProtectedRoute>
      )
    },
    {
      path: '/auth',
      element: <Auth />
    },
    {
      path: '/messages',
      element: (
        <ProtectedRoute guestMessage="Sign in to access your messages and connect with other dog lovers.">
          <Messages />
        </ProtectedRoute>
      )
    },
    {
      path: '/profile',
      element: (
        <ProtectedRoute guestMessage="Create an account to build your profile and showcase your dogs.">
          <Profile />
        </ProtectedRoute>
      )
    },
    {
      path: '/listing/:id',
      element: (
        <ProtectedRoute allowGuest={true}>
          <Listing />
        </ProtectedRoute>
      )
    },
    {
      path: '*',
      element: (
        <ErrorState
          title="Page Not Found"
          message="The page you're looking for doesn't exist."
          retryText="Go Home"
          showHomeButton={true}
        />
      )
    }
  ]);

  if (loading) {
    return (
      <>
        <SEOHead />
        <LoadingState 
          message="Loading MY PUP..." 
          size="lg" 
          variant="card" 
          className="min-h-screen flex items-center justify-center"
        />
      </>
    );
  }

  return (
    <>
      <SEOHead />
      <React.Suspense 
        fallback={
          <LoadingState 
            message="Loading page..." 
            className="min-h-screen flex items-center justify-center"
          />
        }
      >
        {routes}
      </React.Suspense>
    </>
  );
};

export default Index;
