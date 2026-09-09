// lib/analytics.ts

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "set",
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const analytics = {
  // Track page views (automatic with GoogleAnalytics component)

  // Track events
  event: (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    }
  },

  // Track WhatsApp interactions
  whatsapp: {
    buttonClick: () => {
      analytics.event("whatsapp_button_click", {
        event_category: "engagement",
        event_label: "whatsapp_chat_open",
      });
    },

    conversationStart: () => {
      analytics.event("whatsapp_conversation_start", {
        event_category: "engagement",
        event_label: "whatsapp_conversation",
      });
    },
  },

  // Track AI Chat
  aiChat: {
    open: () => {
      analytics.event("ai_chat_opened", {
        event_category: "ai_chat",
        event_label: "widget_opened",
      });
    },

    close: (messageCount: number) => {
      analytics.event("ai_chat_closed", {
        event_category: "ai_chat",
        event_label: "widget_closed",
        value: messageCount,
      });
    },

    messageSent: (count: number) => {
      analytics.event("ai_chat_message_sent", {
        event_category: "ai_chat",
        event_label: "user_message",
        value: count,
      });
    },

    handover: () => {
      analytics.event("ai_chat_handover", {
        event_category: "ai_chat",
        event_label: "handover_triggered",
      });
    },
  },

  // Track Tours
  tours: {
    view: (tourSlug: string) => {
      analytics.event("view_tour", {
        event_category: "tours",
        event_label: tourSlug,
      });
    },

    compare: (tourSlugs: string[]) => {
      analytics.event("compare_tours", {
        event_category: "tours",
        event_label: tourSlugs.join(","),
      });
    },
  },

  // Track Bookings
  bookings: {
    start: (tourName: string, price: number) => {
      analytics.event("begin_checkout", {
        event_category: "ecommerce",
        event_label: tourName,
        value: price,
        currency: "KES",
      });
    },

    complete: (bookingData: {
      referenceNumber: string;
      tourName: string;
      totalPrice: number;
      numberOfPeople: number;
    }) => {
      analytics.event("purchase", {
        transaction_id: bookingData.referenceNumber,
        value: bookingData.totalPrice,
        currency: "KES",
        items: [
          {
            item_name: bookingData.tourName,
            price: bookingData.totalPrice / bookingData.numberOfPeople,
            quantity: bookingData.numberOfPeople,
          },
        ],
      });
    },
  },

  // Track Form Submissions
  forms: {
    contact: () => {
      analytics.event("generate_lead", {
        event_category: "engagement",
        event_label: "contact_form",
      });
    },

    quote: (tourName: string) => {
      analytics.event("request_quote", {
        event_category: "engagement",
        event_label: tourName,
      });
    },
  },
};
