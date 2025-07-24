import { lazy } from 'react';

// Lazy load major page components for code splitting
export const LazyExplore = lazy(() => import('../Explore'));
export const LazyMessages = lazy(() => import('../Messages'));
export const LazyNotifications = lazy(() => import('../Notifications'));
export const LazyProfile = lazy(() => import('../Profile'));