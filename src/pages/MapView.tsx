
import React from 'react';
import { Navigate } from 'react-router-dom';
import LocationExplorer from './LocationExplorer';

const MapView = () => {
  // Redirect to the new LocationExplorer page which includes the enhanced map view
  return <LocationExplorer />;
};

export default MapView;
