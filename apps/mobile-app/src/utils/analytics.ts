// Mock implementations for Sentry and PostHog
// In a production environment, you would use:
// import * as Sentry from 'sentry-expo';
// import PostHog from 'posthog-react-native';

export const Analytics = {
  init: () => {
    console.log('[Analytics] Initialized PostHog Mock');
    console.log('[ErrorTracking] Initialized Sentry Mock');
  },
  
  identify: (userId: string, traits: Record<string, any> = {}) => {
    console.log(`[Analytics] Identified user: ${userId}`, traits);
  },
  
  captureEvent: (eventName: string, properties: Record<string, any> = {}) => {
    console.log(`[Analytics] Event captured: ${eventName}`, properties);
  },
  
  captureError: (error: Error, context: Record<string, any> = {}) => {
    console.error(`[ErrorTracking] Error captured:`, error, context);
  }
};
