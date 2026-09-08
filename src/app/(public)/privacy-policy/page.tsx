// app/privacy-policy/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Footloose Adventures",
  description:
    "Privacy policy for Footloose Adventures - How we collect, use, and protect your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="bg-surface min-h-screen py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-surface-container-lowest shadow-elevated rounded-none p-8 md:p-12">
          <h1 className="text-on-surface mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-on-surface-variant mb-8 text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <div className="max-w-none">
            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">1. Introduction</h2>
              <p className="text-on-surface-variant mb-4 leading-relaxed">
                Welcome to Footloose Adventures. We respect your privacy and are committed to
                protecting your personal data. This privacy policy explains how we collect, use, and
                safeguard your information when you use our services, including our website and
                WhatsApp communication channels.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">
                2. Information We Collect
              </h2>
              <p className="text-on-surface-variant mb-3 leading-relaxed">
                When you contact us via WhatsApp, our website, or through other channels, we may
                collect:
              </p>
              <ul className="text-on-surface-variant mb-4 list-disc space-y-2 pl-6">
                <li>Your name and contact details (phone number, email address)</li>
                <li>Messages and conversation history with our team</li>
                <li>Tour preferences and booking information</li>
                <li>Travel dates, group size, and special requirements</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Website usage data through cookies and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">
                3. How We Use Your Information
              </h2>
              <p className="text-on-surface-variant mb-3 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="text-on-surface-variant mb-4 list-disc space-y-2 pl-6">
                <li>Respond to your inquiries about safari tour packages and services</li>
                <li>Process and confirm your tour bookings</li>
                <li>Provide customer support and assistance</li>
                <li>Send booking confirmations, updates, and important travel information</li>
                <li>Improve our services and customer experience</li>
                <li>Comply with legal obligations and resolve disputes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">
                4. WhatsApp Communications
              </h2>
              <p className="text-on-surface-variant mb-4 leading-relaxed">
                When you contact us via WhatsApp, your messages and phone number are processed
                according to both our privacy policy and WhatsApp's terms of service. We use
                automated systems (chatbots) to respond to common inquiries and provide quick
                assistance. These systems:
              </p>
              <ul className="text-on-surface-variant mb-4 list-disc space-y-2 pl-6">
                <li>Store your conversation history to provide personalized service</li>
                <li>Can escalate conversations to human agents when needed</li>
                <li>Process your messages to understand your safari tour interests and needs</li>
                <li>
                  Only send you messages in response to your inquiries or with your explicit consent
                </li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                You can request to speak with a human agent at any time by typing "agent" or "human"
                in the chat.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">
                5. Data Storage and Security
              </h2>
              <p className="text-on-surface-variant mb-4 leading-relaxed">
                We take the security of your personal information seriously. Your data is:
              </p>
              <ul className="text-on-surface-variant mb-4 list-disc space-y-2 pl-6">
                <li>Stored securely using industry-standard encryption and security measures</li>
                <li>Accessible only to authorized personnel who need it to provide services</li>
                <li>Backed up regularly to prevent data loss</li>
                <li>
                  Retained only as long as necessary to fulfill the purposes outlined in this policy
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">
                6. Sharing Your Information
              </h2>
              <p className="text-on-surface-variant mb-4 leading-relaxed">
                We do not sell your personal information to third parties. We may share your
                information with:
              </p>
              <ul className="text-on-surface-variant mb-4 list-disc space-y-2 pl-6">
                <li>
                  <strong>Service providers:</strong> Payment processors, tour operators,
                  accommodation providers, and other partners necessary to deliver our safari tours
                </li>
                <li>
                  <strong>Technology partners:</strong> Twilio (for WhatsApp services), Google (for
                  analytics), and other platforms that help us operate our business
                </li>
                <li>
                  <strong>Legal authorities:</strong> When required by law or to protect our rights
                  and safety
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">7. Your Rights</h2>
              <p className="text-on-surface-variant mb-3 leading-relaxed">You have the right to:</p>
              <ul className="text-on-surface-variant mb-4 list-disc space-y-2 pl-6">
                <li>
                  <strong>Access:</strong> Request a copy of the personal data we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate or incomplete
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal data (subject to
                  legal obligations)
                </li>
                <li>
                  <strong>Opt-out:</strong> Unsubscribe from marketing communications at any time
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your data to another service
                  provider
                </li>
                <li>
                  <strong>Object:</strong> Object to certain types of processing of your data
                </li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                To exercise any of these rights, please contact us using the information provided at
                the end of this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">
                8. Cookies and Tracking
              </h2>
              <p className="text-on-surface-variant mb-4 leading-relaxed">
                Our website uses cookies and similar tracking technologies to improve your browsing
                experience. These help us understand how visitors use our site and identify areas
                for improvement. You can control cookies through your browser settings, though
                disabling them may affect website functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">9. Children's Privacy</h2>
              <p className="text-on-surface-variant mb-4 leading-relaxed">
                Our services are not directed to children under the age of 18. We do not knowingly
                collect personal information from children. If you believe we have collected
                information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">
                10. International Data Transfers
              </h2>
              <p className="text-on-surface-variant mb-4 leading-relaxed">
                Your information may be transferred to and processed in countries outside of Kenya,
                including the United States where some of our service providers (such as Twilio) are
                located. We ensure appropriate safeguards are in place to protect your data in
                accordance with this privacy policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">
                11. Changes to This Policy
              </h2>
              <p className="text-on-surface-variant mb-4 leading-relaxed">
                We may update this privacy policy from time to time to reflect changes in our
                practices or legal requirements. We will notify you of significant changes by
                posting the updated policy on this page and updating the "Last updated" date. We
                encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-on-surface mb-4 text-2xl font-semibold">12. Contact Us</h2>
              <p className="text-on-surface-variant mb-4 leading-relaxed">
                If you have questions about this privacy policy, want to exercise your rights, or
                have concerns about how we handle your personal data, please contact us:
              </p>
              <div className="bg-surface-container-low rounded-none p-6">
                <p className="text-on-surface-variant mb-2">
                  <strong>Footloose Adventures</strong>
                </p>
                <p className="text-on-surface-variant mb-2">
                  📧 Email: info@footlooseadventures.co.ke
                </p>
                <p className="text-on-surface-variant mb-2">📞 Phone: +254 742 060 624</p>
                <p className="text-on-surface-variant">📍 Address: Nairobi, Kenya</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
