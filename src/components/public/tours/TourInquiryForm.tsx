"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, Send } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { inquiriesApi } from "@/lib/api/inquiries";
import countryList from "react-select-country-list";

const inquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  contact: z.string().min(10, "Contact number is required"),
  adults: z.number().min(1, "At least 1 adult required").max(50),
  children: z.number().min(0).max(50),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface TourInquiryFormProps {
  tourId?: string;
  tourTitle?: string;
}

export default function TourInquiryForm({ tourId, tourTitle }: TourInquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const countries = useMemo(() => countryList().getData(), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      adults: 2,
      children: 0,
      subject: tourTitle ? `Inquiry about: ${tourTitle}` : "",
    },
  });

  const mutation = useMutation({
    mutationFn: inquiriesApi.create,
    onSuccess: () => {
      setSubmitted(true);
      reset();
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: (error: any) => {
      console.error("Inquiry error:", error);
      alert(error.response?.data?.error || "Failed to send inquiry. Please try again.");
    },
  });

  const onSubmit = (data: InquiryFormData) => {
    mutation.mutate({
      ...data,
      tour_id: tourId,
      tour_title: tourTitle,
    });
  };

  return (
    <Card>
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="text-primary" size={24} />
        <h3 className="text-on-surface font-serif text-2xl font-bold">Have Questions?</h3>
      </div>

      {submitted && (
        <div className="border-secondary-container bg-secondary-container mb-6 rounded-none border p-4">
          <p className="text-on-secondary-container font-medium">
            ✓ Thank you! Your inquiry has been sent. We'll get back to you within 24 hours.
          </p>
        </div>
      )}

      {mutation.isError && (
        <div className="border-error-container bg-error-container mb-6 rounded-none border p-4">
          <p className="text-on-error-container font-medium">
            ✗ Failed to send inquiry. Please try again or contact us directly.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            type="text"
            label="Full Name *"
            {...register("name")}
            error={errors.name?.message}
            placeholder="John Doe"
          />

          <Input
            type="email"
            label="Email Address *"
            {...register("email")}
            error={errors.email?.message}
            placeholder="john@example.com"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Country *"
            {...register("country")}
            error={errors.country?.message}
            options={[{ value: "", label: "Select your country" }, ...countries]}
          />

          <Input
            type="tel"
            label="Contact Number *"
            {...register("contact")}
            error={errors.contact?.message}
            placeholder="+254700000000"
          />
        </div>

        {/* Group Size */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Number of Adults *"
            {...register("adults", { valueAsNumber: true })}
            error={errors.adults?.message}
            min={1}
            max={50}
          />

          <Input
            type="number"
            label="Number of Children"
            {...register("children", { valueAsNumber: true })}
            error={errors.children?.message}
            min={0}
            max={50}
          />
        </div>

        {/* Subject */}
        <Input
          type="text"
          label="Subject *"
          {...register("subject")}
          error={errors.subject?.message}
          placeholder="What would you like to know?"
        />

        {/* Message */}
        <Textarea
          label="Your Message *"
          {...register("message")}
          error={errors.message?.message}
          rows={5}
          placeholder="Tell us about your travel plans, dates you're considering, any special requirements, or questions you have..."
        />

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={mutation.isPending}
          disabled={mutation.isPending}
          className="flex w-full items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            "Sending..."
          ) : (
            <>
              <Send size={18} />
              Send Inquiry
            </>
          )}
        </Button>

        <p className="text-on-surface-variant text-center text-xs">
          We typically respond within 24 hours. For urgent inquiries, please call us directly.
        </p>
      </form>
    </Card>
  );
}
