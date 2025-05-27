
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from './Home';
import Explore from './Explore';
import Post from './Post';
import Messages from './Messages';
import Notifications from './Notifications';
import Settings from './Settings';
import Profile from './Profile';
import Verification from './Verification';
import MapView from './MapView';
import Education from './Education';
import Monetization from './Monetization';
import Partnerships from './Partnerships';
import TermsOfService from './TermsOfService';
import Help from './Help';

const Index = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/post" element={<Post />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/education" element={<Education />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/monetization" element={<Monetization />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </Layout>
  );
};

export default Index;
