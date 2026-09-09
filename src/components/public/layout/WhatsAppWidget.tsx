"use client";

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = "254742060624";
  const agentName = "Footloose Adventures";
  const agentRole = "Safari Booking Assistant";
  const greeting = "Hi there 👋\nHow can we help you plan your perfect safari?";

  const handleChat = () => {
    const message = "Hi! I'm interested in booking a safari tour.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Popup Widget */}
      {isOpen && (
        <div className="bg-surface-container-lowest shadow-elevated fixed right-6 bottom-24 z-50 w-80 overflow-hidden rounded-none">
          {/* Header */}
          <div className="bg-primary text-on-primary p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0">
                  <Image
                    src="/leopard-paw.webp"
                    alt={agentName}
                    fill
                    sizes="48px"
                    className="rounded-full object-cover"
                  />
                  <span className="border-primary absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 bg-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{agentName}</p>
                  <p className="label-caps text-on-primary/80">{agentRole}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-on-primary/80 hover:text-on-primary"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-surface p-4">
            <div className="border-outline-variant bg-surface-container-lowest rounded-none border p-3">
              <p className="text-on-surface text-sm whitespace-pre-line">{greeting}</p>
              <p className="text-on-surface-variant mt-2 text-xs">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface-container-lowest border-outline-variant border-t p-4">
            <button
              onClick={handleChat}
              className="w-full rounded-none bg-[#25D366] py-3 font-semibold text-white transition-colors hover:bg-[#20BA5A]"
            >
              Start Chat
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="shadow-elevated fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] transition-transform hover:scale-110 md:h-16 md:w-16"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white md:h-8 md:w-8" />
        ) : (
          <MessageCircle className="h-7 w-7 text-white md:h-8 md:w-8" />
        )}
      </button>
    </>
  );
}
