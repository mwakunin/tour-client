"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Card from "@/components/ui/card";
import PageHero from "@/components/public/layout/PageHero";
import { contactApi } from "@/lib/api/contact";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: contactApi.send,
    onSuccess: () => {
      setFormData({ name: "", email: "", phone: "", message: "" });
    },
    onError: (error: any) => {
      console.error("Contact form error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        title="Get in Touch"
        description="Have questions about our tours? We're here to help you plan your perfect African adventure."
        image={{ src: "/bgcon.webp", alt: "Giraffe at sunset on the Kenyan savannah" }}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="space-y-6 lg:col-span-1">
            <Card title="Contact Information">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <Mail className="text-on-primary" size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-on-surface font-semibold">Email</div>
                    <a
                      href="mailto:info@footlooseadventures.co.ke"
                      className="text-primary block break-words hover:underline"
                    >
                      info@footlooseadventures.co.ke
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <Phone className="text-on-primary" size={20} />
                  </div>
                  <div>
                    <div className="text-on-surface font-semibold">Phone</div>
                    <a href="tel:+254742060624" className="text-primary hover:underline">
                      +254 742 060 624
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <MapPin className="text-on-primary" size={20} />
                  </div>
                  <div>
                    <div className="text-on-surface font-semibold">Address</div>
                    <p className="text-on-surface-variant">Nairobi, Kenya</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <Clock className="text-on-primary" size={20} />
                  </div>
                  <div>
                    <div className="text-on-surface font-semibold">Business Hours</div>
                    <p className="text-on-surface-variant">
                      Mon - Fri: 8:00 AM - 6:00 PM
                      <br />
                      Sat: 9:00 AM - 4:00 PM
                      <br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Social Links */}
            <Card title="Follow Us">
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/share/1H7injwZNh/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary/90 flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* <a
                  href="https://twitter.com/footloose_adv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary/90 flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a> */}
                <a
                  href="https://www.instagram.com/footloose_adventureske?igsh=aTljbWRmb214MXJy&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary/90 flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.threads.com/@footloose_adventureske?igshid=NTc4MTIwNjQ2YQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Threads"
                  className="bg-primary hover:bg-primary/90 flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221Z" />
                  </svg>
                </a>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card title="Send Us a Message">
              {/* Success Message */}
              {mutation.isSuccess && (
                <div className="border-secondary-container bg-secondary-container mb-6 rounded-none border p-4">
                  <p className="text-on-secondary-container font-medium">
                    ✓ Message sent successfully! We'll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {mutation.isError && (
                <div className="border-error-container bg-error-container mb-6 rounded-none border p-4">
                  <p className="text-on-error-container font-medium">
                    ✗ Failed to send message. Please try again or contact us directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    type="text"
                    name="name"
                    label="Full Name *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                  <Input
                    type="email"
                    name="email"
                    label="Email Address *"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <Input
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+254 700 000 000"
                />

                <Textarea
                  name="message"
                  label="Message *"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your travel plans or ask any questions..."
                />

                <Button
                  type="submit"
                  isLoading={mutation.isPending}
                  disabled={mutation.isPending}
                  className="flex w-full items-center justify-center gap-2 md:w-auto"
                >
                  {mutation.isPending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
