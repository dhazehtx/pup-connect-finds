
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from './Home';
import Explore from './Explore';
import Messages from './Messages';
import Notifications from './Notifications';
import Settings from './Settings';
import Profile from './Profile';
import Verification from './Verification';
import MapView from './MapView';
import Education from './Education';

const Index = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/education" element={<Education />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </Layout>
  );
};

export default Index;
