/**
 * The largest page the API will serve: list endpoints default to `limit: 10`
 * and reject anything above 100 (api/src/validations/common.js and the
 * per-resource schemas).
 *
 * This is a page size, not a promise of completeness. Passing it means "give me
 * as much as one request can carry", which covers today's catalogue — but a
 * caller that must see *every* record once there are more than 100 needs real
 * pagination, not a bigger number.
 */
export const MAX_PAGE_SIZE = 100;
