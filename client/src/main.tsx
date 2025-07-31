import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/lighthouse'
import { initializeSentry } from './utils/sentry'
import AnalyticsService from './utils/analytics'

// Initialize monitoring and analytics
initializeSentry();
AnalyticsService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
