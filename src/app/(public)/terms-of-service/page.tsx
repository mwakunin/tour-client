// app/terms-of-service/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Footloose Adventures",
  description: "Terms and conditions for using Footloose Adventures services.",
};

export default function TermsOfService() {
  return (
    <div className="bg-surface min-h-screen py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-surface-container-lowest shadow-elevated rounded-none p-8 md:p-12">
          <h1 className="text-on-surface mb-4 text-4xl font-bold">Terms of Service</h1>
          <p className="text-on-surface-variant mb-8 text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <div className="max-w-none">
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              By using Footloose Adventures services, you agree to these terms and conditions.
            </p>

            {/* Add your terms content here - keep it simple for now */}
            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">
                1. Booking and Payment
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                All bookings are subject to availability. Payment terms will be communicated at the
                time of booking.
              </p>
            </section>

            {/* Add more sections as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
