import { logToSupabase } from './logToSupabase';
import { logAdminAction } from './logger';

const DEBUG = import.meta.env.DEV && false;

/**
 * Comprehensive admin panel navigation and page view tracking
 * Tracks detailed admin navigation patterns, section visits, and time spent
 */

export interface AdminPageViewPayload {
  route: string;
  section: string;
  subsection?: string;
  previousRoute?: string;
  timeSpent?: number;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  referrer: string;
  sessionId: string;
}

export interface AdminSectionMetrics {
  totalViews: number;
  uniqueSessions: number;
  averageTimeSpent: number;
  bounceRate: number;
  commonPaths: string[];
}

/**
 * Get section name from route path
 */
export const getSectionFromRoute = (route: string): string => {
  const routeMap: Record<string, string> = {
    '/admin': 'Admin Dashboard',
    '/admin/reports': 'Reports & Moderation',
    '/admin/logs': 'System Logs & Analytics',
    '/admin/settings': 'Platform Settings',
    '/admin/users': 'User Management',
    '/admin/listings': 'Listing Management',
    '/admin/analytics': 'Analytics & Insights',
    '/admin/security': 'Security & Fraud Detection',
    '/admin/notifications': 'Notification Management',
    '/admin/backup': 'Backup & Recovery'
  };

  // Check for exact matches first
  if (routeMap[route]) {
    return routeMap[route];
  }

  // Check for partial matches for dynamic routes
  for (const [routePattern, sectionName] of Object.entries(routeMap)) {
    if (route.startsWith(routePattern)) {
      return sectionName;
    }
  }

  return 'Unknown Admin Section';
};

/**
 * Get subsection from route path
 */
export const getSubsectionFromRoute = (route: string): string | undefined => {
  const subsectionMap: Record<string, string> = {
    '/admin/reports/user': 'User Reports',
    '/admin/reports/listing': 'Listing Reports',
    '/admin/reports/resolved': 'Resolved Reports',
    '/admin/logs/system': 'System Logs',
    '/admin/logs/admin': 'Admin Activity',
    '/admin/logs/api': 'API Logs',
    '/admin/settings/general': 'General Settings',
    '/admin/settings/security': 'Security Settings',
    '/admin/settings/notifications': 'Notification Settings'
  };

  return subsectionMap[route];
};

/**
 * Generate unique session ID for tracking navigation patterns
 */
export const getAdminSessionId = (): string => {
  let sessionId = sessionStorage.getItem('admin_session_id');
  if (!sessionId) {
    sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('admin_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Log admin page view with comprehensive metadata
 */
export const logAdminPageView = async (payload: Partial<AdminPageViewPayload> & { route: string }): Promise<void> => {
  try {
    const section = payload.section || getSectionFromRoute(payload.route);
    const subsection = payload.subsection || getSubsectionFromRoute(payload.route);
    
    const fullPayload: AdminPageViewPayload = {
      route: payload.route,
      section: section,
      subsection: subsection,
      previousRoute: payload.previousRoute,
      timeSpent: payload.timeSpent,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      referrer: document.referrer || 'direct',
      sessionId: getAdminSessionId()
    };

    const eventDetail = `Admin visited ${section}${subsection ? ` → ${subsection}` : ''} at ${payload.route}`;
    
    await logToSupabase(`Admin page view: ${section}`, {
      event_type: 'ADMIN_PAGE_VIEW',
      event_detail: eventDetail,
      route: fullPayload.route,
      section: fullPayload.section,
      subsection: fullPayload.subsection,
      previous_route: fullPayload.previousRoute,
      time_spent: fullPayload.timeSpent,
      user_agent: fullPayload.userAgent,
      viewport_width: fullPayload.viewport.width,
      viewport_height: fullPayload.viewport.height,
      referrer: fullPayload.referrer,
      session_id: fullPayload.sessionId,
      view_timestamp: new Date().toISOString()
    });

    logAdminAction(`Page view: ${section}`, {
      event_type: 'ADMIN_PAGE_VIEW',
      ...fullPayload
    });

    if (DEBUG) console.debug(`[Admin Page View] ${eventDetail}`, fullPayload);
  } catch (error) {
    console.error('Failed to log admin page view:', error);
  }
};

/**
 * Track time spent on admin pages
 */
export class AdminPageTimeTracker {
  private static instance: AdminPageTimeTracker;
  private startTime: number = 0;
  private currentRoute: string = '';
  private isTracking: boolean = false;

  static getInstance(): AdminPageTimeTracker {
    if (!AdminPageTimeTracker.instance) {
      AdminPageTimeTracker.instance = new AdminPageTimeTracker();
    }
    return AdminPageTimeTracker.instance;
  }

  startTracking(route: string): void {
    this.currentRoute = route;
    this.startTime = Date.now();
    this.isTracking = true;
  }

  stopTracking(): number {
    if (!this.isTracking) return 0;
    
    const timeSpent = Date.now() - this.startTime;
    this.isTracking = false;
    return Math.round(timeSpent / 1000); // Return time in seconds
  }

  getCurrentTimeSpent(): number {
    if (!this.isTracking) return 0;
    return Math.round((Date.now() - this.startTime) / 1000);
  }
}

/**
 * Log admin section switching with time tracking
 */
export const logAdminSectionSwitch = async (
  fromRoute: string,
  toRoute: string,
  timeSpentOnPrevious: number
): Promise<void> => {
  try {
    const fromSection = getSectionFromRoute(fromRoute);
    const toSection = getSectionFromRoute(toRoute);
    
    const eventDetail = `Admin switched from ${fromSection} to ${toSection} (spent ${timeSpentOnPrevious}s)`;
    
    await logToSupabase(`Admin section switch: ${fromSection} → ${toSection}`, {
      event_type: 'ADMIN_SECTION_SWITCH',
      event_detail: eventDetail,
      from_route: fromRoute,
      to_route: toRoute,
      from_section: fromSection,
      to_section: toSection,
      time_spent_previous: timeSpentOnPrevious,
      session_id: getAdminSessionId(),
      switch_timestamp: new Date().toISOString()
    });

    logAdminAction(`Section switch: ${fromSection} → ${toSection}`, {
      event_type: 'ADMIN_SECTION_SWITCH',
      from_route: fromRoute,
      to_route: toRoute,
      time_spent_previous: timeSpentOnPrevious
    });

    if (DEBUG) console.debug(`[Admin Section Switch] ${eventDetail}`);
  } catch (error) {
    console.error('Failed to log admin section switch:', error);
  }
};

/**
 * Log admin dashboard metrics access
 */
export const logAdminMetricsAccess = async (
  metricsType: string,
  filters?: Record<string, any>,
  dataRange?: string
): Promise<void> => {
  try {
    const eventDetail = `Admin accessed ${metricsType} metrics${dataRange ? ` for ${dataRange}` : ''}`;
    
    await logToSupabase(`Admin metrics access: ${metricsType}`, {
      event_type: 'ADMIN_METRICS_ACCESS',
      event_detail: eventDetail,
      metrics_type: metricsType,
      filters: filters,
      data_range: dataRange,
      session_id: getAdminSessionId(),
      access_timestamp: new Date().toISOString()
    });

    logAdminAction(`Metrics access: ${metricsType}`, {
      event_type: 'ADMIN_METRICS_ACCESS',
      metrics_type: metricsType,
      filters: filters,
      data_range: dataRange
    });

    if (DEBUG) console.debug(`[Admin Metrics] ${eventDetail}`);
  } catch (error) {
    console.error('Failed to log admin metrics access:', error);
  }
};