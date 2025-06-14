
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import ListingDetail from '@/pages/ListingDetail';
import CreateListing from '@/pages/CreateListing';
import Profile from '@/pages/Profile';
import Messages from '@/pages/Messages';
import Listing from '@/pages/Listing';
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
import Terms from '@/pages/Terms';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
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
            <Route path="/b2b-dashboard" element={<B2BDashboard />} />
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
