/**
 * Axios sets error.message to "Request failed with status code 400", so a
 * validation rejection reaches the UI with no clue about which field failed.
 * The API does send the detail — in two shapes: the tour controller forwards
 * raw zod issues ({ path: [...] }) while the global error middleware maps them
 * to ({ field }) — so normalize both and hand back something readable.
 */
interface ApiErrorDetail {
  field?: string;
  path?: (string | number)[];
  message?: string;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
  details?: ApiErrorDetail[];
}

const detailLine = (detail: ApiErrorDetail) => {
  const field = detail.field ?? detail.path?.filter((p) => p !== "body").join(".");
  const message = detail.message ?? "is invalid";
  return field ? `${field}: ${message}` : message;
};

export const getApiErrorDetails = (error: unknown): string[] => {
  const body = (error as { response?: { data?: ApiErrorBody } })?.response?.data;
  return Array.isArray(body?.details) ? body.details.map(detailLine) : [];
};

export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
  const details = getApiErrorDetails(error);
  if (details.length > 0) return details.join(" · ");

  const body = (error as { response?: { data?: ApiErrorBody } })?.response?.data;
  return body?.message || body?.error || (error as Error)?.message || fallback;
};
