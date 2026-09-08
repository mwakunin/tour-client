import posthog from "posthog-js";

/**
 * Safely capture PostHog events
 * Works even if PostHog isn't initialized yet
 */
export const captureEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture(eventName, properties);
    }
  } catch (error) {
    console.warn("[PostHog] Failed to capture event:", error);
  }
};

/**
 * Safely identify user
 */
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  try {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.identify(userId, properties);
    }
  } catch (error) {
    console.warn("[PostHog] Failed to identify user:", error);
  }
};

/**
 * Safely reset PostHog
 */
export const resetPostHog = () => {
  try {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.reset();
    }
  } catch (error) {
    console.warn("[PostHog] Failed to reset:", error);
  }
};

/**
 * Check if PostHog is loaded
 */
export const isPostHogLoaded = () => {
  return typeof window !== "undefined" && posthog.__loaded;
};
