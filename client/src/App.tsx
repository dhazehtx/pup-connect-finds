
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { CartFab } from './components/ui/cart-fab';
import { CartProvider } from './components/CartProvider';
import Layout from './components/Layout';
import AdminNavigationTracker from './components/admin/AdminNavigationTracker';
import CookieConsentBanner from '@/components/privacy/CookieConsentBanner';
import { FloatingBugReportButton } from '@/components/FloatingBugReportButton';
import Analytics from './components/Analytics';
import SessionExpiredModal from '@/components/auth/SessionExpiredModal';
import OnboardingHydrator from './components/OnboardingHydrator';
import { Toaster } from '@/components/ui/toaster';
import { GlobalToastBridge } from '@/components/GlobalToastBridge';

import { PageTransition } from './components/ui/transitions';
import Home from './pages/Home';
import HomeFeedPage from './pages/HomeFeed';
import Auth from './pages/Auth';
import { LoadingPage } from './components/ui/loading';

// Lazy load heavy components for performance
const LazyMarketplace = lazy(() => import('./pages/Marketplace'));
const LazyCart = lazy(() => import('./pages/Cart'));
const LazyCheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const LazyCheckoutCancel = lazy(() => import('./pages/CheckoutCancel'));
const LazyListingDetail = lazy(() => import('./pages/ListingDetail'));
const LazyCreateListing = lazy(() => import('./pages/CreateListing'));
const LazyPost = lazy(() => import('./pages/Post'));
const LazyMessageThread = lazy(() => import('./components/messaging/MessageThread'));
const LazyProviderOnboardingPage = lazy(() => import('./pages/ProviderOnboarding'));
const LazyHelpCenter = lazy(() => import('./pages/HelpCenter'));
const LazyContact = lazy(() => import('./pages/Contact'));
const LazyLegalGuide = lazy(() => import('./pages/LegalGuide'));
const LazyAccountSettingsPage = lazy(() => import('./pages/AccountSettings'));
const LazySettingsHubPage = lazy(() => import('./pages/SettingsHubPage'));
const LazyNotificationPreferencesPage = lazy(() => import('./pages/NotificationPreferencesPage'));
const LazyFraudDetectionDemo = lazy(() =>
  import('./components/security/FraudDetectionDemo').then((m) => ({ default: m.FraudDetectionDemo }))
);
const LazyRefundManagement = lazy(() =>
  import('./pages/RefundManagement').then((m) => ({ default: m.RefundManagement }))
);
const LazyCommissionCenter = lazy(() =>
  import('./pages/CommissionCenter').then((m) => ({ default: m.CommissionCenter }))
);
const LazyOrderHistory = lazy(() => import('./pages/OrderHistory'));

const LazyExplore = lazy(() => import('./pages/ExploreRouter'));
const LazyProfile = lazy(() => import('./pages/Profile'));
const LazyMessages = lazy(() => import('./pages/Messages'));
const LazyNotifications = lazy(() => import('./pages/Notifications'));
const LazyEducation = lazy(() => import('./pages/Education'));
const LazyServices = lazy(() => import('./pages/Services'));
const LazyServiceProviderDetail = lazy(() => import('./pages/ServiceProviderDetailPage'));
const LazyNetwork = lazy(() => import('./pages/Network'));
import ProtectedRoute from './components/ProtectedRoute';
import RequireAuth from './components/RequireAuth';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load rate limit demo
const RateLimitDemo = lazy(() => import('./pages/RateLimitDemo'));

// Lazy load error monitoring panel
const ErrorMonitoringPanel = lazy(() => import('./components/admin/ErrorMonitoringPanel'));
const ErrorTestPage = lazy(() => import('./pages/ErrorTestPage'));
const AdminModerationPage = lazy(() => import('./pages/AdminModerationPage'));
const AdminConsolePage = lazy(() => import('./pages/AdminConsolePage'));
const AdminLogsPage = lazy(() => import('./pages/AdminLogsPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminStore = lazy(() => import('./pages/admin/AdminStore'));
const ReportsTestPage = import.meta.env.DEV ? lazy(() => import('./pages/ReportsTestPage')) : () => null;
const NavigationTestPage = import.meta.env.DEV ? lazy(() => import('./pages/NavigationTestPage')) : () => null;
const AdminActionTestPage = import.meta.env.DEV ? lazy(() => import('./pages/AdminActionTestPage')) : () => null;
const ReportActionTestPage = import.meta.env.DEV ? lazy(() => import('./pages/ReportActionTestPage')) : () => null;
const AdminPageTrackingTestPage = import.meta.env.DEV ? lazy(() => import('./pages/AdminPageTrackingTestPage')) : () => null;
const AdminLogFilterTestPage = import.meta.env.DEV ? lazy(() => import('./pages/AdminLogFilterTestPage')) : () => null;
const RealtimeLogTestPage = import.meta.env.DEV ? lazy(() => import('./pages/RealtimeLogTestPage')) : () => null;
const ReelsPage = lazy(() => import('./pages/ReelsPage'));
const CommentsTestPage = import.meta.env.DEV ? lazy(() => import('./pages/CommentsTestPage')) : () => null;
const HashtagTestPage = import.meta.env.DEV ? lazy(() => import('./pages/HashtagTestPage')) : () => null;
const SavedPostsPage = lazy(() => import('./pages/SavedPostsPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const ProfilesTestPage = import.meta.env.DEV ? lazy(() => import('./pages/ProfilesTestPage')) : () => null;
const NotificationTestPage = import.meta.env.DEV ? lazy(() => import('./pages/NotificationTestPage')) : () => null;
const EnhancedExplorePage = lazy(() => import('./pages/EnhancedExplorePage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const GroupDetailPage = lazy(() => import('./pages/GroupDetailPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AdminSupportPage = lazy(() => import('./pages/AdminSupportPage'));
const AdminBugsPage = lazy(() => import('./pages/AdminBugsPage'));
const ServiceProviderApplications = lazy(() => import('./pages/admin/ServiceProviderApplications'));
const ServiceVerificationAdminPage = lazy(() => import('./pages/admin/ServiceVerificationAdminPage'));
const WhelpingWaitlistAdminPage = lazy(() => import('./pages/admin/WhelpingWaitlistAdminPage'));
const ProviderDashboard = lazy(() => import('./pages/dashboard/ProviderDashboard'));
const UserBookings = lazy(() => import('./pages/dashboard/UserBookings'));
const TestChecklist = import.meta.env.DEV ? lazy(() => import('./pages/dashboard/TestChecklist')) : () => null;
const BugReports = lazy(() => import('./pages/admin/BugReports'));
const QADashboard = import.meta.env.DEV ? lazy(() => import('./pages/QADashboard')) : () => null;
const BugTestPage = import.meta.env.DEV ? lazy(() => import('./pages/BugTestPage')) : () => null;
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const CommunityGuidelines = lazy(() => import('./pages/legal/CommunityGuidelines'));
const AccountDataRequests = lazy(() => import('./pages/legal/AccountDataRequests'));
const ShippingPolicy = lazy(() => import('./pages/legal/ShippingPolicy'));
const ReturnsPolicy = lazy(() => import('./pages/legal/ReturnsPolicy'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const PrivacySettingsPage = lazy(() => import('./pages/PrivacySettingsPage'));
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'));
const SubscriptionCancelled = lazy(() => import('./pages/SubscriptionCancelled'));
const SessionTestPage = import.meta.env.DEV ? lazy(() => import('./pages/SessionTestPage')) : () => null;
const MyListingsPage = lazy(() => import('./pages/MyListingsPage'));
const AdminApplicationsPage = lazy(() => import('./pages/AdminApplications').then(module => ({ default: module.default })));
const AdminStripeEventsPage = lazy(() => import('./pages/AdminStripeEvents'));
const AdminPayoutsTestPage = import.meta.env.DEV ? lazy(() => import('./pages/AdminPayoutsTest')) : () => null;

// Import new notification component
import NotificationButton from './components/notifications/NotificationButton';

const SHOW_TEST_ROUTES = import.meta.env.DEV;



function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <AuthProvider>
            <RealtimeProvider>
              <ThemeProvider>
              <CartProvider>
                <OnboardingHydrator />
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
                  <Route path="/marketplace" element={
                    <Suspense fallback={<LoadingPage message="Loading Marketplace..." />}>
                      <LazyMarketplace />
                    </Suspense>
                  } />
                  <Route path="/shop" element={<Navigate to="/marketplace?tab=store" replace />} />
                  <Route path="/services/provider/:id" element={
                    <Suspense fallback={<LoadingPage message="Loading provider..." />}>
                      <LazyServiceProviderDetail />
                    </Suspense>
                  } />
                  <Route path="/cart" element={
                    <Suspense fallback={<LoadingPage message="Loading Cart..." />}>
                      <LazyCart />
                    </Suspense>
                  } />
                  <Route path="/checkout/success" element={
                    <Suspense fallback={<LoadingPage message="Loading..." />}>
                      <LazyCheckoutSuccess />
                    </Suspense>
                  } />
                  <Route path="/checkout/cancel" element={
                    <Suspense fallback={<LoadingPage message="Loading..." />}>
                      <LazyCheckoutCancel />
                    </Suspense>
                  } />
                  <Route path="/success" element={
                    <Suspense fallback={<LoadingPage message="Loading..." />}>
                      <LazyCheckoutSuccess />
                    </Suspense>
                  } />
                  <Route path="/cancel" element={
                    <Suspense fallback={<LoadingPage message="Loading..." />}>
                      <LazyCheckoutCancel />
                    </Suspense>
                  } />
                  <Route path="/orders" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading Orders..." />}>
                        <LazyOrderHistory />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/post" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading..." />}>
                        <LazyPost />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/profile/:userId" element={
                    <Suspense fallback={<LoadingPage message="Loading Profile..." />}>
                      <LazyProfile />
                    </Suspense>
                  } />
                  <Route path="/profile" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading Profile..." />}>
                        <LazyProfile />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/create-listing" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading..." />}>
                        <LazyCreateListing />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/my-listings" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading My Listings..." />}>
                        <MyListingsPage />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/listing/:id" element={
                    <Suspense fallback={<LoadingPage message="Loading Listing..." />}>
                      <LazyListingDetail />
                    </Suspense>
                  } />
                  <Route path="/messages" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading Messages..." />}>
                        <LazyMessages />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/messages/:conversationId" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading conversation..." />}>
                        <LazyMessageThread />
                      </Suspense>
                    </RequireAuth>
                  } />
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
                  <Route path="/help-center" element={
                    <Suspense fallback={<LoadingPage message="Loading Help..." />}>
                      <LazyHelpCenter />
                    </Suspense>
                  } />
                  <Route path="/help" element={
                    <Suspense fallback={<LoadingPage message="Loading Help..." />}>
                      <LazyHelpCenter />
                    </Suspense>
                  } />
                  <Route path="/contact" element={
                    <Suspense fallback={<LoadingPage message="Loading..." />}>
                      <LazyContact />
                    </Suspense>
                  } />
                  <Route path="/services" element={
                    <Suspense fallback={<LoadingPage message="Loading Services..." />}>
                      <LazyServices />
                    </Suspense>
                  } />
                  <Route path="/network" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading Network..." />}>
                        <LazyNetwork />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/services/onboarding" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading..." />}>
                        <LazyProviderOnboardingPage />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/provider-onboarding" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading..." />}>
                        <LazyProviderOnboardingPage />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/legal" element={
                    <Suspense fallback={<LoadingPage message="Loading..." />}>
                      <LazyLegalGuide />
                    </Suspense>
                  } />
                  <Route path="/account-settings" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading Settings..." />}>
                        <LazyAccountSettingsPage />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/settings" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading settings..." />}>
                        <LazySettingsHubPage />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/settings/notifications" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading notifications..." />}>
                        <LazyNotificationPreferencesPage />
                      </Suspense>
                    </RequireAuth>
                  } />
                  {import.meta.env.DEV && (
                  <Route path="/fraud-demo" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading..." />}>
                        <LazyFraudDetectionDemo />
                      </Suspense>
                    </RequireAuth>
                  } />
                  )}
                  <Route path="/refund-center" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading..." />}>
                        <LazyRefundManagement />
                      </Suspense>
                    </RequireAuth>
                  } />
                  <Route path="/commission-center" element={
                    <RequireAuth>
                      <Suspense fallback={<LoadingPage message="Loading..." />}>
                        <LazyCommissionCenter />
                      </Suspense>
                    </RequireAuth>
                  } />
                  {import.meta.env.DEV && (
                  <Route path="/rate-limit-demo" element={
                    <Suspense fallback={<LoadingPage message="Loading Rate Limit Demo..." />}>
                      <RateLimitDemo />
                    </Suspense>
                  } />
                  )}
                  <Route path="/admin/errors" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Error Monitoring..." />}>
                        <ErrorMonitoringPanel />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  {SHOW_TEST_ROUTES && (
                  <Route path="/error-test" element={
                    <Suspense fallback={<LoadingPage message="Loading Error Test..." />}>
                      <ErrorTestPage />
                    </Suspense>
                  } />
                  )}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Admin Dashboard..." />}>
                        <AdminDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/store" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Admin Store..." />}>
                        <AdminStore />
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
                  <Route path="/admin/console" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Admin Console..." />}>
                        <AdminConsolePage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/moderation" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Moderation Panel..." />}>
                        <AdminModerationPage />
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
                  <Route path="/admin/applications" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Provider Applications..." />}>
                        <AdminApplicationsPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/stripe-events" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Stripe Events..." />}>
                        <AdminStripeEventsPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  {SHOW_TEST_ROUTES && (
                    <>
                      <Route path="/admin/payouts-test" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingPage message="Loading Payouts Test..." />}>
                            <AdminPayoutsTestPage />
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
                    </>
                  )}
                  <Route path="/reels" element={
                    <Suspense fallback={<LoadingPage message="Loading Reels..." />}>
                      <ReelsPage />
                    </Suspense>
                  } />
                  {SHOW_TEST_ROUTES && (
                    <>
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
                    </>
                  )}
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
                  {SHOW_TEST_ROUTES && (
                    <>
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
                    </>
                  )}
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
                  <Route path="/admin/service-applications" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Service Applications..." />}>
                        <ServiceProviderApplications />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/service-verification" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Service Verification..." />}>
                        <ServiceVerificationAdminPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/whelping-waitlist" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Whelping Waitlist..." />}>
                        <WhelpingWaitlistAdminPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/provider" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Provider Dashboard..." />}>
                        <ProviderDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/bookings" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Your Bookings..." />}>
                        <UserBookings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  {SHOW_TEST_ROUTES && (
                    <>
                      <Route path="/dashboard/test-checklist" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingPage message="Loading Testing Dashboard..." />}>
                            <TestChecklist />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="/qa" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingPage message="Loading QA Dashboard..." />}>
                            <QADashboard />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                    </>
                  )}
                  <Route path="/admin/bug-reports" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage message="Loading Bug Reports..." />}>
                        <BugReports />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  {SHOW_TEST_ROUTES && (
                    <Route path="/bug-test" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingPage message="Loading Bug Test..." />}>
                          <BugTestPage />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                  )}
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
                  {SHOW_TEST_ROUTES && (
                    <Route path="/session-test" element={
                      <Suspense fallback={<LoadingPage message="Loading Session Test..." />}>
                        <SessionTestPage />
                      </Suspense>
                    } />
                  )}
                  <Route path="/legal/terms" element={
                    <Suspense fallback={<LoadingPage message="Loading Terms..." />}>
                      <TermsOfService />
                    </Suspense>
                  } />
                  <Route path="/legal/privacy" element={
                    <Suspense fallback={<LoadingPage message="Loading Privacy Policy..." />}>
                      <PrivacyPolicy />
                    </Suspense>
                  } />
                  <Route path="/legal/guidelines" element={
                    <Suspense fallback={<LoadingPage message="Loading Guidelines..." />}>
                      <CommunityGuidelines />
                    </Suspense>
                  } />
                  <Route path="/legal/shipping" element={
                    <Suspense fallback={<LoadingPage message="Loading Shipping Policy..." />}>
                      <ShippingPolicy />
                    </Suspense>
                  } />
                  <Route path="/legal/returns" element={
                    <Suspense fallback={<LoadingPage message="Loading Returns Policy..." />}>
                      <ReturnsPolicy />
                    </Suspense>
                  } />
                  <Route path="/account-data" element={
                    <Suspense fallback={<LoadingPage message="Loading..." />}>
                      <AccountDataRequests />
                    </Suspense>
                  } />
                  </Routes>
                </PageTransition>
              </Layout>
              <Analytics />
              <Toaster />
              <GlobalToastBridge />
              <CookieConsentBanner />
              <SessionExpiredModal />
              <CartFab />
              <FloatingBugReportButton />
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
