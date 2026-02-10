import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
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
