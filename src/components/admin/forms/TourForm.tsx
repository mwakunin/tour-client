"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import ImageUploader from "@/components/admin/forms/ImageUploader";
import MediaPicker from "@/components/admin/forms/MediaPicker";
import PricingPeriodsField from "@/components/admin/forms/PricingPeriodsField";
import { destinationsApi } from "@/lib/api/destinations";
import { queryKeys } from "@/lib/api/queryKeys";
import { MAX_PAGE_SIZE } from "@/lib/api/constants";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { hasLiveOffer, type PricingPeriod } from "@/lib/utils/pricing";
import CharCount from "@/components/ui/char-count";

/**
 * react-hook-form's `valueAsNumber` yields NaN for an empty number input, and
 * z.number() rejects NaN — so a blank optional field would fail validation
 * with "expected number, received NaN". Normalize blanks to undefined first.
 */
const optionalNumber = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (v) => (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
    schema.optional()
  ) as unknown as z.ZodType<z.infer<T> | undefined>;

/**
 * Mirrors the API's own caps (api/src/validations/tour.validation.js) plus the
 * slug column width. Anything longer is rejected server-side with a 400 whose
 * detail never reached the form — so guard, count, and explain it here instead.
 * Keep these in step with the API schema.
 */
const LIMITS = {
  title: 200,
  slug: 250, // tours.slug is varchar(250)
  overviewMin: 100,
  overview: 5000,
  item: 500, // one includes/excludes entry
  requirements: 2000,
  tag: 50,
  itineraryTitle: 200,
  periodLabel: 100,
  metaTitle: 60,
  metaDescription: 160,
  destinations: 10,
  images: 10,
  categories: 5,
} as const;

/**
 * Length complaints are raised as you type. Waiting for submit is what made an
 * over-long field feel like a save that failed for no reason.
 */
const overBy = (value: string | undefined | null, max: number, label: string) => {
  const length = value?.length ?? 0;
  if (length <= max) return undefined;
  const excess = length - max;
  return `${label} is ${excess} character${excess === 1 ? "" : "s"} over the ${max} limit`;
};

/** Falls back to the first image when the stored cover is no longer one of them. */
const normalizeCover = (cover: string | undefined, images: string[] = []) =>
  cover && images.includes(cover) ? cover : images[0];

const overCount = (count: number, max: number, noun: string) =>
  count > max ? `Maximum ${max} ${noun} — remove ${count - max}` : undefined;

/** Shared classes for the raw inputs/textareas, with the red danger state. */
const fieldClass = (hasError: boolean, extra?: string) =>
  cn(
    "w-full rounded-lg border px-3 py-2 transition-colors focus:ring-2",
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
      : "focus:ring-primary border-gray-300",
    extra
  );

const FIELD_LABELS: Record<string, string> = {
  title: "Tour Title",
  slug: "URL Slug",
  overview: "Overview",
  destination_ids: "Destinations",
  duration: "Duration",
  pricing: "Base Pricing",
  "pricing.amount": "Base Price",
  "pricing.compare_at_amount": "Was price",
  pricing_periods: "Seasonal pricing",
  images: "Images",
  cover_image: "Cover Image",
  includes: "What's Included",
  excludes: "What's Not Included",
  requirements: "Requirements",
  categories: "Categories",
  tags: "Tags",
  itinerary: "Itinerary",
  meta_title: "Meta Title",
  meta_description: "Meta Description",
};

const labelForPath = (path: string[]) => {
  const key = path.filter((p) => !/^\d+$/.test(p) && p !== "root" && p !== "value").join(".");
  const row = path.find((p) => /^\d+$/.test(p));
  const base = FIELD_LABELS[key] ?? FIELD_LABELS[path[0]] ?? key.replace(/_/g, " ");
  return row === undefined ? base : `${base} (row ${Number(row) + 1})`;
};

/**
 * react-hook-form nests array and object errors, so the top-level entry often
 * has no `message` at all — the old submit handler printed those as
 * "includes: undefined". Walk the tree so every failure surfaces as a sentence.
 */
const flattenErrors = (node: any, path: string[] = []): string[] => {
  if (!node || typeof node !== "object") return [];
  if (typeof node.message === "string" && node.message.length > 0) {
    return [`${labelForPath(path)}: ${node.message}`];
  }
  return Object.entries(node).flatMap(([key, child]) =>
    key === "ref" || key === "type" ? [] : flattenErrors(child, [...path, key])
  );
};

const pricingTierSchema = z
  .object({
    pax: z.number().int().min(1).max(20),
    // The price actually charged — nothing multiplies it
    price_per_person: z.number().positive("Price per person must be positive"),
    // Optional struck-through "was" price, display only
    compare_at_price: optionalNumber(z.number().positive()),
    currency: z.enum(["USD", "KES"]),
  })
  .refine((t) => t.compare_at_price === undefined || t.compare_at_price > t.price_per_person, {
    message: "Was-price must be higher than the price you charge",
    path: ["compare_at_price"],
  });

const pricingPeriodSchema = z
  .object({
    label: z
      .string()
      .max(LIMITS.periodLabel, `Label must be ${LIMITS.periodLabel} characters or less`)
      .optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    pricing_tiers: z.array(pricingTierSchema).min(1, "Each period needs at least one tier"),
  })
  .refine((p) => p.end_date >= p.start_date, {
    message: "End date must be on or after start date",
    path: ["end_date"],
  });

const tourFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(LIMITS.title, `Title must be ${LIMITS.title} characters or less`),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(LIMITS.slug, `Slug must be ${LIMITS.slug} characters or less`)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
    overview: z
      .string()
      .min(LIMITS.overviewMin, `Overview must be at least ${LIMITS.overviewMin} characters`)
      .max(LIMITS.overview, `Overview must be ${LIMITS.overview} characters or less`),
    destination_ids: z
      .array(z.string())
      .min(1, "At least one destination required")
      .max(LIMITS.destinations, `Maximum ${LIMITS.destinations} destinations allowed`),
    duration: z.number().int().positive("Duration must be positive"),
    duration_unit: z.enum(["hours", "days", "weeks"]),

    // Flat base price — left blank for tours priced by seasonal periods, so
    // amount is optional here and the "one or the other" rule is enforced by
    // the cross-field refine below.
    // discount_percentage is derived server-side from the compare-at prices
    // and is never sent from here.
    pricing: z
      .object({
        amount: optionalNumber(z.number().positive("Base price must be positive")),
        currency: z.enum(["USD", "KES"]),
        compare_at_amount: optionalNumber(z.number().positive()),
      })
      .refine(
        (p) =>
          p.compare_at_amount === undefined ||
          p.amount === undefined ||
          p.compare_at_amount > p.amount,
        {
          message: "Was-price must be higher than the price you charge",
          path: ["compare_at_amount"],
        }
      ),

    // Seasonal pricing; empty for flat-priced products (transfers, day trips)
    pricing_periods: z
      .array(pricingPeriodSchema)
      .default([])
      .refine(
        (periods) => {
          // Both ends inclusive, so seasons cannot share even a single day
          const sorted = [...periods]
            .filter((p) => p.start_date && p.end_date)
            .sort((a, b) => a.start_date.localeCompare(b.start_date));
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].start_date <= sorted[i - 1].end_date) return false;
          }
          return true;
        },
        { message: "Pricing periods must not overlap" }
      ),

    featured: z.boolean(),
    is_deal: z.boolean(),
    images: z
      .array(z.string().url())
      .min(1, "At least one image required")
      .max(LIMITS.images, `Maximum ${LIMITS.images} images allowed`),
    // The cards and the detail gallery render cover_image, so it has to stay
    // one of the tour's images — see the cross-field rule below.
    cover_image: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: "Must be a valid URL",
      }),
    includes: z
      .array(
        z.object({
          value: z.string().max(LIMITS.item, `Item must be ${LIMITS.item} characters or less`),
        })
      )
      .default([]),
    excludes: z
      .array(
        z.object({
          value: z.string().max(LIMITS.item, `Item must be ${LIMITS.item} characters or less`),
        })
      )
      .default([]),
    requirements: z
      .string()
      .max(LIMITS.requirements, `Requirements must be ${LIMITS.requirements} characters or less`)
      .optional(),
    categories: z
      .array(
        z.enum([
          "adventure",
          "cultural",
          "wildlife",
          "beach",
          "luxury",
          "budget",
          "family",
          "honeymoon",
          "group",
          "private",
        ])
      )
      .max(LIMITS.categories, `Maximum ${LIMITS.categories} categories allowed`)
      .default([]),
    tags: z
      .array(z.string().max(LIMITS.tag, `Each tag must be ${LIMITS.tag} characters or less`))
      .default([]),
    status: z.enum(["draft", "published", "archived"]),
    itinerary: z
      .array(
        z.object({
          day: z.string().min(1, "Day label is required"),
          title: z
            .string()
            .min(1, "Title is required")
            .max(
              LIMITS.itineraryTitle,
              `Title must be ${LIMITS.itineraryTitle} characters or less`
            ),
          activities: z.string().min(1, "Activities are required"),
          accommodation: z.string().optional(),
          meals: z.string().optional(),
        })
      )
      .default([]),
    meta_title: z
      .string()
      .max(LIMITS.metaTitle, `Meta title must be ${LIMITS.metaTitle} characters or less`)
      .optional(),
    meta_description: z
      .string()
      .max(
        LIMITS.metaDescription,
        `Meta description must be ${LIMITS.metaDescription} characters or less`
      )
      .optional(),
  })
  .refine(
    (data) => {
      const hasPeriods = (data.pricing_periods?.length ?? 0) > 0;
      const hasFlatPrice = typeof data.pricing?.amount === "number" && data.pricing.amount > 0;
      return hasPeriods || hasFlatPrice;
    },
    {
      message: "Set a base price, or add at least one seasonal pricing period",
      path: ["pricing", "amount"],
    }
  )
  .refine((data) => !data.cover_image || data.images.includes(data.cover_image), {
    // A cover left pointing at a removed image keeps that photo on the cards and
    // at the front of the detail gallery, even though it is gone from the tour.
    message: "Cover image must be one of the images above",
    path: ["cover_image"],
  });

interface TourFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

type TourFormValues = z.infer<typeof tourFormSchema>;

export default function TourForm({ initialData, onSubmit, isSubmitting }: TourFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const [imageNotice, setImageNotice] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const posthog = usePostHog();

  const {
    data: destinationsData,
    isLoading: destinationsLoading,
    isError: destinationsFailed,
    refetch: refetchDestinations,
  } = useQuery({
    // Keyed by the page size: without a limit the API caps the list at 10, and
    // sharing a key with a differently-sized query meant whichever ran last won
    // the cache — which is how destinations went missing from this picker.
    queryKey: queryKeys.destinations.list({ limit: MAX_PAGE_SIZE }),
    queryFn: () => destinationsApi.getAll({ limit: MAX_PAGE_SIZE }),
    // A failed fetch here leaves an empty picker, so retry once rather than
    // making the user reload to get their destinations back.
    retry: 1,
  });

  const destinations = destinationsData?.data || [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tourFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          destination_ids:
            initialData.destinations?.map((d: any) => d.id) || initialData.destination_ids || [],
          categories: initialData.categories || [],
          pricing_periods: initialData.pricing_periods || [],
          includes: initialData.includes?.map((item: string) => ({ value: item })) || [],
          excludes: initialData.excludes?.map((item: string) => ({ value: item })) || [],
          // Tours saved before the cover was kept in step can arrive pointing at
          // an image that was removed. Seed a valid one so opening and saving
          // the tour repairs it instead of failing the rule above.
          cover_image: normalizeCover(initialData.cover_image, initialData.images),
        }
      : {
          title: "",
          slug: "",
          overview: "",
          destination_ids: [],
          duration: 1,
          duration_unit: "days",
          pricing: {
            // Blank, not 0 — a seasonal tour leaves this empty, and 0 would
            // fail the "must be positive" check
            amount: undefined,
            currency: "USD",
            compare_at_amount: undefined,
          },
          pricing_periods: [],
          featured: false,
          is_deal: false,
          images: [],
          cover_image: undefined,
          includes: [],
          excludes: [],
          requirements: undefined,
          categories: [],
          itinerary: [],
          tags: [],
          status: "draft",
          meta_title: undefined,
          meta_description: undefined,
        },
  });

  const {
    fields: includesFields,
    append: appendInclude,
    remove: removeInclude,
  } = useFieldArray({
    control,
    name: "includes",
  });

  const {
    fields: excludesFields,
    append: appendExclude,
    remove: removeExclude,
  } = useFieldArray({
    control,
    name: "excludes",
  });

  const {
    fields: itineraryFields,
    append: appendItinerary,
    remove: removeItinerary,
  } = useFieldArray({
    control,
    name: "itinerary",
  });

  const title = watch("title");
  const slug = watch("slug");
  const overview = watch("overview");
  const requirements = watch("requirements");
  const metaTitle = watch("meta_title");
  const metaDescription = watch("meta_description");
  const coverImage = watch("cover_image");
  const includesValues = watch("includes") || [];
  const excludesValues = watch("excludes") || [];
  const itineraryValues = watch("itinerary") || [];
  const tags = watch("tags") || [];
  const selectedDestinations = watch("destination_ids") || [];
  const selectedCategories = watch("categories") || [];
  const baseCurrency = watch("pricing.currency");
  const pricingPeriods = watch("pricing_periods") || [];
  const hasPricingPeriods = pricingPeriods.length > 0;

  // "Special Deal" and a live discount are two independent conditions, and
  // /tours/deals requires BOTH. Neither half fails loudly on its own, so
  // surface the mismatch here rather than letting the tour quietly never show.
  const isDeal = watch("is_deal");
  const dealHasLiveOffer = hasLiveOffer({
    pricing_periods: pricingPeriods as PricingPeriod[],
    compare_at_amount: watch("pricing.compare_at_amount"),
    price_amount: watch("pricing.amount"),
  });

  // register() owns the title's onBlur, so keep a handle on it and call it
  // alongside the slug generator rather than replacing it.
  const titleField = register("title");

  // Every guard below prefers the resolver's message once a submit has run, and
  // falls back to a live length check so the field goes red while typing.
  const err = (message: unknown) => (message as string | undefined) || undefined;
  const titleError = err(errors.title?.message) ?? overBy(title, LIMITS.title, "Title");
  const slugError = err(errors.slug?.message) ?? overBy(slug, LIMITS.slug, "Slug");
  const overviewError =
    err(errors.overview?.message) ?? overBy(overview, LIMITS.overview, "Overview");
  const requirementsError =
    err(errors.requirements?.message) ?? overBy(requirements, LIMITS.requirements, "Requirements");
  const metaTitleError =
    err(errors.meta_title?.message) ?? overBy(metaTitle, LIMITS.metaTitle, "Meta title");
  const metaDescriptionError =
    err(errors.meta_description?.message) ??
    overBy(metaDescription, LIMITS.metaDescription, "Meta description");
  const destinationsError =
    err(errors.destination_ids?.message) ??
    overCount(selectedDestinations.length, LIMITS.destinations, "destinations");
  const categoriesError =
    err((errors.categories as any)?.message) ??
    overCount(selectedCategories.length, LIMITS.categories, "categories");
  const imagesError =
    err(errors.images?.message) ??
    overCount(images.length, LIMITS.images, "images") ??
    imageNotice ??
    undefined;
  const coverError = err(errors.cover_image?.message);
  const tagsError =
    err((errors.tags as any)?.message) ??
    (Array.isArray(errors.tags)
      ? err((errors.tags as any[]).find((e) => e?.message)?.message)
      : undefined);

  const itemError = (list: "includes" | "excludes", index: number, value: string) =>
    err((errors[list] as any)?.[index]?.value?.message) ?? overBy(value, LIMITS.item, "Item");

  const itineraryError = (index: number, key: "day" | "title" | "activities") =>
    err((errors.itinerary as any)?.[index]?.[key]?.message);

  // A tag is added by hand, so it can be checked before it ever enters the form
  const trimmedTag = tagInput.trim().toLowerCase();
  const tagInputError = trimmedTag
    ? (overBy(trimmedTag, LIMITS.tag, "Tag") ??
      (tags.includes(trimmedTag) ? `"${trimmedTag}" is already added` : undefined))
    : undefined;

  const addTag = () => {
    if (!trimmedTag || tagInputError) return;
    setValue("tags", [...tags, trimmedTag], { shouldValidate: true });
    setTagInput("");
  };

  const generateSlug = () => {
    const nextSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", nextSlug);
  };

  const handleImageUpload = (urls: string[]) => {
    // The uploader is told how much room is left, but it is shared — cap here
    // too so a stray extra URL can never push the form past what the API takes.
    const room = LIMITS.images - images.length;
    const accepted = urls.slice(0, Math.max(room, 0));
    const omitted = urls.length - accepted.length;

    setImageNotice(
      omitted > 0
        ? `${omitted} image${omitted === 1 ? "" : "s"} left out — ${LIMITS.images} is the maximum. Remove one to add another.`
        : null
    );

    if (accepted.length === 0) {
      setShowImageUploader(false);
      return;
    }

    const newImages = [...images, ...accepted];
    setImages(newImages);
    setValue("images", newImages, { shouldValidate: true });
    if (!watch("cover_image") && newImages.length > 0) {
      setValue("cover_image", newImages[0]);
    }
    setShowImageUploader(false);
  };

  const removeImage = (index: number) => {
    const removed = images[index];
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue("images", newImages, { shouldValidate: true });

    // The cover is what the cards and the detail gallery actually render, so
    // dropping its image without reassigning leaves the deleted photo on the
    // live site — the tour looks unchanged no matter how often you save.
    if (watch("cover_image") === removed) {
      setValue("cover_image", newImages[0], { shouldValidate: true });
    }

    // Room has been made, so the "left out" notice no longer applies
    setImageNotice(null);
  };

  const onFormError = (formErrors: any) => {
    const summary = flattenErrors(formErrors);
    setErrorSummary(summary);

    posthog?.capture("tour_form_submission_failed", {
      error_count: summary.length,
      error_fields: Object.keys(formErrors),
    });

    toast.error(
      `Cannot save — ${summary.length} ${summary.length === 1 ? "field needs" : "fields need"} fixing`,
      { description: summary.slice(0, 3).join(" · ") }
    );

    // react-hook-form focuses the first *registered* field with an error; the
    // destination/category checkboxes and the image list aren't registered
    // inputs, so when nothing took focus, bring the summary into view instead.
    // requestAnimationFrame(() => {
    //   if (document.activeElement === document.body) {
    //     summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    //   }
    // });
    requestAnimationFrame(() => {
      const active = document.activeElement;
      const isSubmitButton = active?.getAttribute("type") === "submit";
      if (active === document.body || isSubmitButton) {
        summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  const handleFormSubmit = (data: TourFormValues) => {
    setErrorSummary([]);
    const pricingPeriods = Array.isArray(data.pricing_periods)
      ? data.pricing_periods
          .filter((period) => period?.start_date && period?.end_date)
          .map((period) => ({
            // Drop a blank label rather than sending an empty string
            ...(period.label?.trim() ? { label: period.label.trim() } : {}),
            start_date: period.start_date,
            end_date: period.end_date,
            pricing_tiers: (period.pricing_tiers ?? [])
              .filter((tier) => tier?.pax > 0 && tier?.price_per_person > 0)
              .map((tier) => ({
                pax: tier.pax,
                price_per_person: tier.price_per_person,
                ...(typeof tier.compare_at_price === "number"
                  ? { compare_at_price: tier.compare_at_price }
                  : {}),
                total: tier.pax * tier.price_per_person,
                currency: tier.currency,
              })),
          }))
          .filter((period) => period.pricing_tiers.length > 0)
      : [];

    const transformedData: Record<string, any> = {
      ...data,
      includes: data.includes.map((item) => item.value).filter((v) => v.trim() !== ""),
      excludes: data.excludes.map((item) => item.value).filter((v) => v.trim() !== ""),
      pricing_periods: pricingPeriods,
    };

    // The API takes either periods or a flat base price, and rejects a
    // pricing object whose amount isn't positive — so drop it entirely when a
    // seasonal tour left the base price blank.
    const flatAmount = data.pricing?.amount;
    if (pricingPeriods.length > 0 && !(typeof flatAmount === "number" && flatAmount > 0)) {
      delete transformedData.pricing;
    }

    posthog?.capture("tour_form_submitted", {
      is_new_tour: !initialData,
      tour_title: data.title,
      tour_status: data.status,
      destination_count: data.destination_ids.length,
      category_count: data.categories.length,
      pricing_period_count: pricingPeriods.length,
      pricing_tier_count: pricingPeriods.reduce((n, p) => n + p.pricing_tiers.length, 0),
      has_itinerary: data.itinerary.length > 0,
      image_count: data.images.length,
      is_featured: data.featured,
      is_deal: data.is_deal,
    });
    onSubmit(transformedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, onFormError)} className="space-y-6">
      {errorSummary.length > 0 && (
        <div
          ref={summaryRef}
          role="alert"
          className="rounded-lg border border-red-500 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-800">
            {errorSummary.length} {errorSummary.length === 1 ? "field needs" : "fields need"} fixing
            before this tour can be saved
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {errorSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information - Same as before */}
      <Card title="Basic Information">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Tour Title *"
                {...titleField}
                onBlur={(e) => {
                  titleField.onBlur(e);
                  generateSlug();
                }}
                error={titleError}
              />
              <div className="mt-1 flex justify-end">
                <CharCount value={title} max={LIMITS.title} />
              </div>
            </div>
            <div>
              <Input
                label="URL Slug *"
                {...register("slug")}
                error={slugError}
                placeholder="maasai-mara-safari"
              />
              <div className="mt-1 flex justify-end">
                <CharCount value={slug} max={LIMITS.slug} />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700">Overview *</label>
              <CharCount value={overview} max={LIMITS.overview} min={LIMITS.overviewMin} />
            </div>
            <textarea
              {...register("overview")}
              rows={4}
              className={fieldClass(Boolean(overviewError))}
              placeholder="Describe the tour experience..."
            />
            {overviewError && <p className="mt-1 text-sm text-red-600">{overviewError}</p>}
          </div>

          {/* ✅ UPDATED: Multiple Destinations Selection */}
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Destinations * (Select one or more)
              </label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  destinationsError ? "font-medium text-red-600" : "text-gray-500"
                )}
              >
                {selectedDestinations.length}/{LIMITS.destinations} selected
              </span>
            </div>
            <div
              className={cn(
                "max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3",
                destinationsError ? "border-red-500" : "border-gray-200"
              )}
            >
              {destinationsLoading && (
                <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                  <Loading size="sm" />
                  Loading destinations…
                </div>
              )}

              {destinationsFailed && (
                <div className="flex items-center justify-between gap-2 py-2">
                  <p className="text-sm text-red-600">Could not load destinations.</p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => refetchDestinations()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {!destinationsLoading && !destinationsFailed && destinations.length === 0 && (
                <p className="py-2 text-sm text-gray-500">
                  No destinations yet —{" "}
                  <Link href="/admin/destinations/new" className="text-primary underline">
                    create one first
                  </Link>
                  .
                </p>
              )}

              {destinations.map((dest: any) => (
                <label key={dest.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={dest.id}
                    checked={selectedDestinations.includes(dest.id)}
                    disabled={
                      !selectedDestinations.includes(dest.id) &&
                      selectedDestinations.length >= LIMITS.destinations
                    }
                    // onChange={(e) => {
                    //   const currentIds = selectedDestinations;
                    //   if (e.target.checked) {
                    //     setValue("destination_ids", [...currentIds, dest.id]);
                    //   } else {
                    //     setValue(
                    //       "destination_ids",
                    //       currentIds.filter((id: string) => id !== dest.id)
                    //     );
                    //   }
                    // }}
                    onChange={(e) => {
                      const currentIds = selectedDestinations;
                      if (e.target.checked) {
                        setValue("destination_ids", [...currentIds, dest.id], {
                          shouldValidate: true,
                        });
                      } else {
                        setValue(
                          "destination_ids",
                          currentIds.filter((id: string) => id !== dest.id),
                          { shouldValidate: true }
                        );
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{dest.title}</span>
                </label>
              ))}
            </div>
            {destinationsError && <p className="mt-1 text-sm text-red-600">{destinationsError}</p>}
          </div>

          {/* ✅ UPDATED: Multiple Categories Selection */}
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Categories (Select up to {LIMITS.categories})
              </label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  categoriesError ? "font-medium text-red-600" : "text-gray-500"
                )}
              >
                {selectedCategories.length}/{LIMITS.categories} selected
              </span>
            </div>
            <div
              className={cn(
                "grid grid-cols-2 gap-2 md:grid-cols-4",
                categoriesError && "rounded-lg border border-red-500 p-3"
              )}
            >
              {[
                "adventure",
                "cultural",
                "wildlife",
                "beach",
                "luxury",
                "budget",
                "family",
                "honeymoon",
                "group",
                "private",
              ].map((cat) => (
                <label key={cat} className="flex items-center">
                  <input
                    type="checkbox"
                    value={cat}
                    checked={selectedCategories.includes(cat)}
                    disabled={
                      !selectedCategories.includes(cat) &&
                      selectedCategories.length >= LIMITS.categories
                    }
                    // onChange={(e) => {
                    //   const currentCats = selectedCategories;
                    //   if (e.target.checked) {
                    //     setValue("categories", [...currentCats, cat]);
                    //   } else {
                    //     setValue(
                    //       "categories",
                    //       currentCats.filter((c: string) => c !== cat)
                    //     );
                    //   }
                    // }}
                    onChange={(e) => {
                      const currentCats = selectedCategories;
                      if (e.target.checked) {
                        setValue("categories", [...currentCats, cat], { shouldValidate: true });
                      } else {
                        setValue(
                          "categories",
                          currentCats.filter((c: string) => c !== cat),
                          { shouldValidate: true }
                        );
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{cat}</span>
                </label>
              ))}
            </div>
            {categoriesError && <p className="mt-1 text-sm text-red-600">{categoriesError}</p>}
          </div>
          {/* ✅ NEW: Tags Section */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Tags (Optional)</label>
            <div className="space-y-2">
              {/* Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                  className={fieldClass(Boolean(tagInputError), "flex-1")}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!trimmedTag || Boolean(tagInputError)}
                  onClick={addTag}
                >
                  Add Tag
                </Button>
              </div>

              {(tagInputError || tagsError || tagInput.length > 0) && (
                <div className="flex items-baseline justify-between gap-2">
                  {tagInputError || tagsError ? (
                    <p className="text-sm text-red-600">{tagInputError ?? tagsError}</p>
                  ) : (
                    <span />
                  )}
                  {tagInput.length > 0 && <CharCount value={tagInput} max={LIMITS.tag} />}
                </div>
              )}

              {/* Display Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      title={
                        tag.length > LIMITS.tag
                          ? `${tag.length}/${LIMITS.tag} characters`
                          : undefined
                      }
                      className={cn(
                        "inline-flex max-w-full items-center gap-1 rounded-full px-3 py-1 text-sm",
                        tag.length > LIMITS.tag
                          ? "border border-red-500 bg-red-50 text-red-700"
                          : "bg-blue-100 text-blue-800"
                      )}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          setValue(
                            "tags",
                            tags.filter((_: string, i: number) => i !== index)
                          );
                        }}
                        className="hover:text-blue-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Tags help users find tours. Examples: safari, adventure, family-friendly
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status *</label>
            <select
              {...register("status")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Duration & Pricing */}
      <Card title="Duration & Base Pricing">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                type="number"
                label="Duration *"
                {...register("duration", { valueAsNumber: true })}
                error={errors.duration?.message as string | undefined}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Duration Unit *
              </label>
              <select
                {...register("duration_unit")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Input
                type="number"
                label={`Base Price${hasPricingPeriods ? "" : " *"}`}
                {...register("pricing.amount", { valueAsNumber: true })}
                error={(errors.pricing as any)?.amount?.message as string | undefined}
                placeholder={hasPricingPeriods ? "Not used" : "Flat price"}
              />
              <p className="mt-1 text-xs text-gray-500">
                {hasPricingPeriods
                  ? "Ignored — this tour is priced by its seasonal periods below."
                  : "Required for flat-priced products, or add seasonal pricing below instead."}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Currency *</label>
              <select
                {...register("pricing.currency")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="USD">USD</option>
                <option value="KES">KES</option>
              </select>
            </div>
            <div>
              <Input
                type="number"
                label="Was (optional)"
                placeholder="no offer"
                {...register("pricing.compare_at_amount", {
                  valueAsNumber: true,
                })}
                error={(errors.pricing as any)?.compare_at_amount?.message as string | undefined}
                min={0}
                step="0.01"
              />
              <p className="mt-1 text-xs text-gray-500">
                Struck-through price. The % OFF badge is worked out from this — you never enter a
                discount directly.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center">
              <input type="checkbox" {...register("featured")} className="mr-2" />
              <span className="text-sm font-medium text-gray-700">Featured Tour</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" {...register("is_deal")} className="mr-2" />
              <span className="text-sm font-medium text-gray-700">Special Deal</span>
            </label>
          </div>

          {/* Advisory only — never blocks saving. Discounting a tour without
              promoting it on the home page is a legitimate choice. */}
          {isDeal && !dealHasLiveOffer && (
            <p className="mt-2 text-xs text-amber-700">
              ⚠ &ldquo;Special Deal&rdquo; is ticked, but this tour has no current discount, so it
              won&rsquo;t appear in Current Deals. Add a &ldquo;was&rdquo; price to a season that
              hasn&rsquo;t ended yet.
            </p>
          )}
          {!isDeal && dealHasLiveOffer && (
            <p className="mt-2 text-xs text-blue-700">
              ℹ This tour is discounted. Tick &ldquo;Special Deal&rdquo; to feature it in Current
              Deals on the home page — otherwise the discount still applies, it just isn&rsquo;t
              promoted there.
            </p>
          )}
        </div>
      </Card>

      {/* Seasonal pricing periods (replaces flat tiers + validity period) */}
      <Card title="Seasonal Pricing (Optional)">
        <PricingPeriodsField
          control={control}
          register={register}
          watch={watch}
          errors={errors}
          defaultCurrency={baseCurrency || "USD"}
        />
      </Card>

      {/* Images */}
      <Card title="Images">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm text-gray-500">
              At least one image, {LIMITS.images} at most. The cover is what shows on the tour cards
              and opens the gallery.
            </p>
            <span
              className={cn(
                "text-xs tabular-nums",
                imagesError ? "font-medium text-red-600" : "text-gray-500"
              )}
            >
              {images.length}/{LIMITS.images}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map((url, index) => (
              <div
                key={index}
                className={cn(
                  "group relative rounded-lg",
                  coverImage === url && "ring-primary ring-2 ring-offset-2"
                )}
              >
                <img
                  src={url}
                  alt={`Tour image ${index + 1}`}
                  className="h-32 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
                {coverImage === url ? (
                  <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setValue("cover_image", url, { shouldValidate: true })}
                    className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  >
                    Set as cover
                  </button>
                )}
              </div>
            ))}
          </div>

          {showImageUploader ? (
            <ImageUploader
              onUploadComplete={handleImageUpload}
              multiple
              maxFiles={LIMITS.images - images.length}
              folder="tours"
            />
          ) : (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={images.length >= LIMITS.images}
                  onClick={() => setShowImageUploader(true)}
                >
                  <Plus size={20} className="mr-2" />
                  Add Images
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={images.length >= LIMITS.images}
                  onClick={() => setShowMediaPicker(true)}
                >
                  <ImageIcon size={20} className="mr-2" />
                  Choose from library
                </Button>
              </div>
              {images.length >= LIMITS.images && (
                <p className="text-sm text-amber-700">
                  {LIMITS.images} images is the maximum — remove one to add another.
                </p>
              )}
            </div>
          )}

          {/* Reuses handleImageUpload, which already caps at LIMITS.images,
              reports what it omitted and sets the cover if none is set. */}
          <MediaPicker
            open={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onSelect={(urls) => {
              handleImageUpload(urls);
              setShowMediaPicker(false);
            }}
            maxSelectable={LIMITS.images - images.length}
            excludeUrls={images}
          />
          {imagesError && <p className="text-sm text-red-600">{imagesError}</p>}
          {coverError && <p className="text-sm text-red-600">{coverError}</p>}
        </div>
      </Card>

      {/* Itinerary (Optional) */}
      <Card title="Itinerary (Optional)">
        <div className="space-y-4">
          {itineraryFields.length === 0 && (
            <p className="text-sm text-gray-500">
              No itinerary added yet. Click "Add Day" to create one.
            </p>
          )}

          {itineraryFields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Day {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeItinerary(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  label="Day Label *"
                  {...register(`itinerary.${index}.day`)}
                  error={itineraryError(index, "day")}
                  placeholder="Day 1"
                />
                <div>
                  <Input
                    label="Title *"
                    {...register(`itinerary.${index}.title`)}
                    error={
                      itineraryError(index, "title") ??
                      overBy(itineraryValues[index]?.title, LIMITS.itineraryTitle, "Title")
                    }
                    placeholder="Arrival in Nairobi"
                  />
                  <div className="mt-1 flex justify-end">
                    <CharCount value={itineraryValues[index]?.title} max={LIMITS.itineraryTitle} />
                  </div>
                </div>
                <div>
                  <textarea
                    {...register(`itinerary.${index}.activities`)}
                    rows={3}
                    className={fieldClass(Boolean(itineraryError(index, "activities")))}
                    placeholder="Activities for this day..."
                  />
                  {itineraryError(index, "activities") && (
                    <p className="mt-1 text-sm text-red-600">
                      {itineraryError(index, "activities")}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Accommodation"
                    {...register(`itinerary.${index}.accommodation`)}
                    placeholder="Hotel name"
                  />
                  <Input
                    label="Meals"
                    {...register(`itinerary.${index}.meals`)}
                    placeholder="Breakfast, Lunch, Dinner"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              appendItinerary({
                day: `Day ${itineraryFields.length + 1}`,
                title: "",
                activities: "",
                accommodation: "",
                meals: "",
              })
            }
          >
            <Plus size={20} className="mr-2" />
            Add Day
          </Button>
        </div>
      </Card>

      {/* Includes/Excludes - Same as before */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="What's Included">
          <div className="space-y-3">
            {includesFields.map((field, index) => {
              const value = includesValues[index]?.value ?? "";
              const error = itemError("includes", index, value);

              return (
                <div key={field.id} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      {...register(`includes.${index}.value`)}
                      className={fieldClass(Boolean(error), "flex-1")}
                      placeholder="e.g., Accommodation"
                    />
                    {includesFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInclude(index)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  {error ? (
                    <p className="text-sm text-red-600">{error}</p>
                  ) : (
                    value.length > LIMITS.item * 0.8 && (
                      <div className="flex justify-end">
                        <CharCount value={value} max={LIMITS.item} />
                      </div>
                    )
                  )}
                </div>
              );
            })}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => appendInclude({ value: "" })}
            >
              <Plus size={16} className="mr-1" />
              Add Item
            </Button>
          </div>
        </Card>

        <Card title="What's Not Included">
          <div className="space-y-3">
            {excludesFields.map((field, index) => {
              const value = excludesValues[index]?.value ?? "";
              const error = itemError("excludes", index, value);

              return (
                <div key={field.id} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      {...register(`excludes.${index}.value`)}
                      className={fieldClass(Boolean(error), "flex-1")}
                      placeholder="e.g., International flights"
                    />
                    {excludesFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExclude(index)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  {error ? (
                    <p className="text-sm text-red-600">{error}</p>
                  ) : (
                    value.length > LIMITS.item * 0.8 && (
                      <div className="flex justify-end">
                        <CharCount value={value} max={LIMITS.item} />
                      </div>
                    )
                  )}
                </div>
              );
            })}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => appendExclude({ value: "" })}
            >
              <Plus size={16} className="mr-1" />
              Add Item
            </Button>
          </div>
        </Card>
      </div>

      {/* Requirements */}
      <Card title="Requirements & Additional Info">
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700">Requirements</label>
              <CharCount value={requirements} max={LIMITS.requirements} />
            </div>
            <textarea
              {...register("requirements")}
              rows={3}
              className={fieldClass(Boolean(requirementsError))}
              placeholder="Any special requirements or restrictions..."
            />
            {requirementsError && <p className="mt-1 text-sm text-red-600">{requirementsError}</p>}
          </div>
        </div>
      </Card>

      {/* SEO */}
      <Card title="SEO (Optional)">
        <div className="space-y-4">
          <div>
            <Input label="Meta Title" {...register("meta_title")} error={metaTitleError} />
            <div className="mt-1 flex justify-end">
              <CharCount value={metaTitle} max={LIMITS.metaTitle} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <CharCount value={metaDescription} max={LIMITS.metaDescription} />
            </div>
            <textarea
              {...register("meta_description")}
              rows={2}
              className={fieldClass(Boolean(metaDescriptionError))}
            />
            {metaDescriptionError && (
              <p className="mt-1 text-sm text-red-600">{metaDescriptionError}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Tour" : "Create Tour"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
