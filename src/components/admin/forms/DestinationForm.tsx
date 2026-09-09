import { usePostHog } from "posthog-js/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import ImageUploader from "@/components/admin/forms/ImageUploader";

const destinationFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  image: z.string().url("Must be a valid image URL"),
  country: z.string().min(1, "Country is required"),
  region: z.string().optional(),
  featured: z.boolean(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
});

type DestinationFormValues = z.infer<typeof destinationFormSchema>;

interface DestinationFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function DestinationForm({
  initialData,
  onSubmit,
  isSubmitting,
}: DestinationFormProps) {
  const [image, setImage] = useState<string>(initialData?.image || "");
  const [showImageUploader, setShowImageUploader] = useState(false);
  const posthog = usePostHog();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      description: "",
      image: "",
      country: "",
      region: "",
      featured: false,
    },
  });

  // Auto-generate slug from title
  const title = watch("title");
  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug);
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setImage(urls[0]);
      setValue("image", urls[0]);
      setShowImageUploader(false);
    }
  };

  const removeImage = () => {
    // ✅ Use hook with optional chaining
    posthog?.capture("admin_destination_image_removed", {
      image_url: image,
    });
    setImage("");
    setValue("image", "");
  };

  const handleFormSubmit = (data: DestinationFormValues) => {
    posthog.capture("admin_destination_form_submitted", {
      is_new_destination: !initialData,
      title_length: data.title.length,
      description_length: data.description.length,
      is_featured: data.featured,
    });
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card title="Basic Information">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Destination Name *"
                {...register("title")}
                error={errors.title?.message}
                onBlur={generateSlug}
                placeholder="Maasai Mara National Reserve"
              />
            </div>
            <div>
              <Input
                label="URL Slug *"
                {...register("slug")}
                error={errors.slug?.message}
                placeholder="maasai-mara-national-reserve"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              {...register("description")}
              rows={6}
              className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2"
              placeholder="Describe the destination, its unique features, wildlife, and attractions..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Country *"
                {...register("country")}
                error={errors.country?.message}
                placeholder="Kenya"
              />
            </div>
            <div>
              <Input
                label="Region"
                {...register("region")}
                error={errors.region?.message}
                placeholder="Rift Valley"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("featured")}
              className="text-primary focus:ring-primary mr-2 h-4 w-4 rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">
              Feature this destination on the homepage
            </label>
          </div>
        </div>
      </Card>

      {/* Image */}
      <Card title="Featured Image">
        <div className="space-y-4">
          {image ? (
            <div className="relative inline-block">
              <img
                src={image}
                alt="Destination"
                className="h-64 w-full max-w-md rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
              >
                <X size={18} />
              </button>
            </div>
          ) : showImageUploader ? (
            <ImageUploader onUploadComplete={handleImageUpload} folder="destinations" />
          ) : (
            <Button type="button" variant="secondary" onClick={() => setShowImageUploader(true)}>
              Upload Image
            </Button>
          )}
          {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
        </div>
      </Card>

      {/* SEO */}
      <Card title="SEO (Optional)">
        <div className="space-y-4">
          <Input
            label="Meta Title"
            {...register("meta_title")}
            error={errors.meta_title?.message}
            maxLength={60}
            placeholder="Maasai Mara Safari Tours | Best Wildlife Experience"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea
              {...register("meta_description")}
              rows={2}
              maxLength={160}
              className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2"
              placeholder="Experience the great wildebeest migration and big cat sightings..."
            />
            {errors.meta_description && (
              <p className="mt-1 text-sm text-red-600">{errors.meta_description.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Destination" : "Create Destination"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
