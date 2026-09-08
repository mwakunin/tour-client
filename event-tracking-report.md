# Event tracking report

This document lists all PostHog events that have been automatically added to your Next.js application.

## Events by File

### src/app/providers.tsx

- **query-failed**: Tracks a failed data fetching attempt handled by react-query's global retry logic. This event captures details about the failure before a retry decision is made.

### src/app/auth/login/page.tsx

- **login_button_clicked**: Fired when the user clicks the 'Sign In' button on the login page.
- **login_page_back_to_website_clicked**: Fired when the user clicks the '← Back to website' link on the login page.

### src/contexts/AuthContext.tsx

- **user-logged-out**: Tracks when a user successfully logs out of their account.

### src/components/admin/forms/TourForm.tsx

- **tour_form_submission_failed**: Fired when a user attempts to submit the tour creation/update form but it fails client-side validation.
- **tour_form_submitted**: Fired when a user successfully submits the form to create or update a tour.

### src/components/admin/forms/DestinationForm.tsx

- **admin_destination_form_submitted**: Fired when an admin creates or updates a destination using the form.
- **admin_destination_image_removed**: Fired when an admin removes the featured image from a destination form.

### src/components/admin/forms/ImageUploader.tsx

- **image-upload-successful**: Fired when a user successfully uploads one or more images.
- **image-upload-failed**: Fired when an image upload fails for any reason.
- **image-preview-removed**: Fired when a user removes an image from the preview list before uploading.

### src/components/admin/forms/ItineraryBuilder.tsx

- **itinerary_day_added**: Fired when a user clicks one of the 'Add Day' buttons in the itinerary builder.
- **itinerary_day_removed**: Fired when a user clicks the trash icon to remove a day from the itinerary.

### src/components/admin/tables/ToursTable.tsx

- **admin_tour_deleted**: Fired when an admin confirms the deletion of a tour from the tours table.
- **admin_create_first_tour_clicked**: Fired when the 'Create Your First Tour' button is clicked from the empty state view.
- **admin_view_tour_clicked**: Fired when an admin clicks the 'View' icon for a tour in the table.
- **admin_edit_tour_clicked**: Fired when an admin clicks the 'Edit' icon for a tour in the table.


## Events still awaiting implementation
- (human: you can fill these in)
---

## Next Steps

1. Review the changes made to your files
2. Test that events are being captured correctly
3. Create insights and dashboards in PostHog
4. Make a list of events we missed above. Knock them out yourself, or give this file to an agent.

Learn more about what to measure with PostHog and why: https://posthog.com/docs/new-to-posthog/getting-hogpilled
