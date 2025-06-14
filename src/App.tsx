
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import HomeFeed from '@/pages/HomeFeed';
import Explore from '@/pages/Explore';
import ListingDetail from '@/pages/ListingDetail';
import CreateListing from '@/pages/CreateListing';
import Profile from '@/pages/Profile';
import Messages from '@/pages/Messages';
import Auth from '@/pages/Auth';
import VerifyEmail from '@/pages/VerifyEmail';
import Education from '@/pages/Education';
import Services from '@/pages/Services';
import CustomerReviews from '@/pages/CustomerReviews';
import Monetization from '@/pages/Monetization';
import Legal from '@/pages/Legal';
import HelpCenter from '@/pages/HelpCenter';
import TrustSafety from '@/pages/TrustSafety';
import Contact from '@/pages/Contact';
import B2BDashboard from '@/pages/B2BDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Terms from '@/pages/Terms';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <HomeFeed />
              </ProtectedRoute>
            } />
            <Route path="/explore" element={<Explore />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/create-listing" element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/education" element={<Education />} />
            <Route path="/services" element={<Services />} />
            <Route path="/customer-reviews" element={<CustomerReviews />} />
            <Route path="/monetization" element={<Monetization />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/trust-safety" element={<TrustSafety />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/b2b-dashboard" element={
              <ProtectedRoute>
                <B2BDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
