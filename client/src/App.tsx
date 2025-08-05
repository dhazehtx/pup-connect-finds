
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { CartProvider } from './lib/CartContext';
import CartFab from './components/ui/CartFab';
import Layout from './components/Layout';
import AdminNavigationTracker from './components/admin/AdminNavigationTracker';
import CookieConsentBanner from '@/components/privacy/CookieConsentBanner';
import Analytics from './components/Analytics';
import SessionExpiredModal from '@/components/auth/SessionExpiredModal';

import { PageTransition } from './components/ui/transitions';
import Home from './pages/Home';
import HomeFeedPage from './pages/HomeFeed';
import Auth from './pages/Auth';
import CreateListing from './pages/CreateListing';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import ListingDetail from './pages/ListingDetail';
import Post from './pages/Post';
import MessageThread from './components/messaging/MessageThread';
import { LoadingPage } from './components/ui/loading';

// Lazy load heavy components for performance
const LazyExplore = lazy(() => import('./pages/ExploreRouter'));
const LazyProfile = lazy(() => import('./pages/Profile'));
const LazyMessages = lazy(() => import('./pages/Messages'));
const LazyNotifications = lazy(() => import('./pages/Notifications'));
const LazyEducation = lazy(() => import('./pages/Education'));
const LazyServices = lazy(() => import('./pages/Services'));
import HelpCenter from './pages/HelpCenter';
import Contact from './pages/Contact';
import LegalGuide from './pages/LegalGuide';
import AccountSettingsPage from './pages/AccountSettings';
import ProtectedRoute from './components/ProtectedRoute';
import RequireAuth from './components/RequireAuth';
import { FraudDetectionDemo } from './components/security/FraudDetectionDemo';
import { RefundManagement } from './pages/RefundManagement';
import { CommissionCenter } from './pages/CommissionCenter';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load rate limit demo
const RateLimitDemo = lazy(() => import('./pages/RateLimitDemo'));

// Lazy load error monitoring panel
const ErrorMonitoringPanel = lazy(() => import('./components/admin/ErrorMonitoringPanel'));
const ErrorTestPage = lazy(() => import('./pages/ErrorTestPage'));
const AdminLogsPage = lazy(() => import('./pages/AdminLogsPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ReportsTestPage = lazy(() => import('./pages/ReportsTestPage'));
const NavigationTestPage = lazy(() => import('./pages/NavigationTestPage'));
const AdminActionTestPage = lazy(() => import('./pages/AdminActionTestPage'));
const ReportActionTestPage = lazy(() => import('./pages/ReportActionTestPage'));
const AdminPageTrackingTestPage = lazy(() => import('./pages/AdminPageTrackingTestPage'));
const AdminLogFilterTestPage = lazy(() => import('./pages/AdminLogFilterTestPage'));
const RealtimeLogTestPage = lazy(() => import('./pages/RealtimeLogTestPage'));
const ReelsPage = lazy(() => import('./pages/ReelsPage'));
const CommentsTestPage = lazy(() => import('./pages/CommentsTestPage'));
const HashtagTestPage = lazy(() => import('./pages/HashtagTestPage'));
const SavedPostsPage = lazy(() => import('./pages/SavedPostsPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const ProfilesTestPage = lazy(() => import('./pages/ProfilesTestPage'));
const NotificationTestPage = lazy(() => import('./pages/NotificationTestPage'));
const EnhancedExplorePage = lazy(() => import('./pages/EnhancedExplorePage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const GroupDetailPage = lazy(() => import('./pages/GroupDetailPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AdminSupportPage = lazy(() => import('./pages/AdminSupportPage'));
const AdminBugsPage = lazy(() => import('./pages/AdminBugsPage'));
const BugTestPage = lazy(() => import('./pages/BugTestPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const PrivacySettingsPage = lazy(() => import('./pages/PrivacySettingsPage'));
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'));
const SubscriptionCancelled = lazy(() => import('./pages/SubscriptionCancelled'));
const SessionTestPage = lazy(() => import('./pages/SessionTestPage'));
const MyListingsPage = lazy(() => import('./pages/MyListingsPage'));

// Import new notification component
import NotificationButton from './components/notifications/NotificationButton';



function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <RealtimeProvider>
              <ThemeProvider>
                <CartProvider>
                  <AdminNavigationTracker />
                <Layout>
                  <PageTransition>
                  <Routes>
                  <Route path="/" element={<RequireAuth><HomeFeedPage /></RequireAuth>} />
                  <Route path="/greeting" element={<Home />} />
                  <Route path="/home" element={<RequireAuth><HomeFeedPage /></RequireAuth>} />
                  <Route path="/explore" element={
                    <Suspense fallback={<LoadingPage message="Loading Explore..." />}>
                      <LazyExplore />
                    </Suspense>
                  } />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/post" element={<RequireAuth><Post /></RequireAuth>} />
                  <Route path="/profile/:userId" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading Profile..." />}>
                        <LazyProfile />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/profile" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading Profile..." />}>
                        <LazyProfile />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/create-listing" element={<RequireAuth><CreateListing /></RequireAuth>} />
                  <Route path="/my-listings" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading My Listings..." />}>
                        <MyListingsPage />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/listing/:id" element={<ListingDetail />} />
                  <Route path="/messages" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading Messages..." />}>
                        <LazyMessages />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/messages/:conversationId" element={<RequireAuth><MessageThread /></RequireAuth>} />
                  <Route path="/notifications" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading Notifications..." />}>
                        <LazyNotifications />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/education" element={
                    <Suspense fallback={<LoadingPage message="Loading Education..." />}>
                      <LazyEducation />
                    </Suspense>
                  } />
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/services" element={
                    <Suspense fallback={<LoadingPage message="Loading Services..." />}>
                      <LazyServices />
                    </Suspense>
                  } />
                  <Route path="/legal" element={<LegalGuide />} />
                  <Route path="/account-settings" element={<RequireAuth><AccountSettingsPage /></RequireAuth>} />
                  <Route path="/fraud-demo" element={<RequireAuth><FraudDetectionDemo /></RequireAuth>} />
                  <Route path="/refund-center" element={<RequireAuth><RefundManagement /></RequireAuth>} />
                  <Route path="/commission-center" element={<RequireAuth><CommissionCenter /></RequireAuth>} />
                  <Route path="/rate-limit-demo" element={
                    <Suspense fallback={<LoadingPage message="Loading Rate Limit Demo..." />}>
                      <RateLimitDemo />
                    </Suspense>
                  } />
                  <Route path="/admin/errors" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Error Monitoring..." />}>
                        <ErrorMonitoringPanel />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/error-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Error Test..." />}>
                      <ErrorTestPage />
                    </Suspense>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Admin Dashboard..." />}>
                        <AdminDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/logs" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Log Viewer..." />}>
                        <AdminLogsPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/reports" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Reports Panel..." />}>
                        <AdminReportsPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/reports-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Reports Test..." />}>
                      <ReportsTestPage />
                    </Suspense>
                  } />
                  <Route path="/navigation-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Navigation Test..." />}>
                      <NavigationTestPage />
                    </Suspense>
                  } />
                  <Route path="/admin-action-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Admin Action Test..." />}>
                      <AdminActionTestPage />
                    </Suspense>
                  } />
                  <Route path="/report-action-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Report Action Test..." />}>
                      <ReportActionTestPage />
                    </Suspense>
                  } />
                  <Route path="/admin-page-tracking-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Admin Page Tracking Test..." />}>
                      <AdminPageTrackingTestPage />
                    </Suspense>
                  } />
                  <Route path="/admin-log-filter-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Admin Log Filter Test..." />}>
                      <AdminLogFilterTestPage />
                    </Suspense>
                  } />
                  <Route path="/realtime-log-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Realtime Log Test..." />}>
                      <RealtimeLogTestPage />
                    </Suspense>
                  } />
                  <Route path="/reels" element={
                    <Suspense fallback={<LoadingPage message="Loading Reels..." />}>
                      <ReelsPage />
                    </Suspense>
                  } />
                  <Route path="/comments-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Comments Test..." />}>
                      <CommentsTestPage />
                    </Suspense>
                  } />
                  <Route path="/hashtag-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Hashtag Test..." />}>
                      <HashtagTestPage />
                    </Suspense>
                  } />
                  <Route path="/saved" element={
                    <Suspense fallback={<LoadingPage message="Loading Saved Posts..." />}>
                      <SavedPostsPage />
                    </Suspense>
                  } />
                  <Route path="/bookmarks" element={
                    <Suspense fallback={<LoadingPage message="Loading Bookmarks..." />}>
                      <BookmarksPage />
                    </Suspense>
                  } />
                  <Route path="/profiles-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Profiles Test..." />}>
                      <ProfilesTestPage />
                    </Suspense>
                  } />
                  <Route path="/notification-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Notification Test..." />}>
                      <NotificationTestPage />
                    </Suspense>
                  } />
                  <Route path="/enhanced-explore" element={
                    <Suspense fallback={<LoadingPage message="Loading Enhanced Explore..." />}>
                      <EnhancedExplorePage />
                    </Suspense>
                  } />
                  <Route path="/community" element={
                    <Suspense fallback={<LoadingPage message="Loading Community..." />}>
                      <CommunityPage />
                    </Suspense>
                  } />
                  <Route path="/community/groups/:groupId" element={
                    <Suspense fallback={<LoadingPage message="Loading Group..." />}>
                      <GroupDetailPage />
                    </Suspense>
                  } />
                  <Route path="/support" element={
                    <Suspense fallback={<LoadingPage message="Loading Support..." />}>
                      <SupportPage />
                    </Suspense>
                  } />
                  <Route path="/admin/support" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Admin Support..." />}>
                        <AdminSupportPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/bugs" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Bug Reports..." />}>
                        <AdminBugsPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/bug-test" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Bug Test..." />}>
                        <BugTestPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/privacy" element={
                    <Suspense fallback={<LoadingPage message="Loading Privacy Policy..." />}>
                      <PrivacyPolicyPage />
                    </Suspense>
                  } />
                  <Route path="/privacy-settings" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Privacy Settings..." />}>
                        <PrivacySettingsPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription-success" element={
                    <Suspense fallback={<LoadingPage message="Processing..." />}>
                      <SubscriptionSuccess />
                    </Suspense>
                  } />
                  <Route path="/subscription-cancelled" element={
                    <Suspense fallback={<LoadingPage message="Loading..." />}>
                      <SubscriptionCancelled />
                    </Suspense>
                  } />
                  <Route path="/session-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Session Test..." />}>
                      <SessionTestPage />
                    </Suspense>
                  } />
                  </Routes>
                </PageTransition>
              </Layout>
              <Analytics />
              <CookieConsentBanner />
              <SessionExpiredModal />
              <CartFab />
                </CartProvider>
              </ThemeProvider>
            </RealtimeProvider>
          </AuthProvider>
      </Router>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
