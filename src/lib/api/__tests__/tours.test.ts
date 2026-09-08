import { toursApi } from "../tours";
import { apiClient } from "../client";

// Mock the API client
jest.mock("../client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("toursApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    // it("should fetch all tours without filters", async () => {
    //   const mockData = {
    //     data: [
    //       { id: "1", title: "Safari Tour 1" },
    //       { id: "2", title: "Safari Tour 2" },
    //     ],
    //   };

    //   (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    //   const result = await toursApi.getAll();

    //   expect(apiClient.get).toHaveBeenCalledWith("/tours", { params: undefined });
    //   expect(result).toEqual(mockData);
    // });
    it("should fetch all tours without filters", async () => {
      const mockData = {
        data: [
          {
            id: "1",
            title: "Safari Tour 1",
            images: [],
            includes: [],
            excludes: [],
            pricing_periods: [], itinerary: [], destinations: [],
          },
          {
            id: "2",
            title: "Safari Tour 2",
            images: [],
            includes: [],
            excludes: [],
            pricing_periods: [], itinerary: [], destinations: [],
          },
        ],
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
      const result = await toursApi.getAll();
      expect(apiClient.get).toHaveBeenCalledWith("/tours", { params: undefined });
      expect(result).toEqual(mockData);
    });

    // it("should fetch tours with filters", async () => {
    //   const filters = {
    //     category: "safari",
    //     min_price: 1000,
    //     max_price: 5000,
    //     page: 1,
    //     limit: 10,
    //   };

    //   const mockData = {
    //     data: [{ id: "1", title: "Filtered Tour" }],
    //   };

    //   (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    //   const result = await toursApi.getAll(filters);

    //   expect(apiClient.get).toHaveBeenCalledWith("/tours", { params: filters });
    //   expect(result).toEqual(mockData);
    // });
    it("should fetch tours with filters", async () => {
      const filters = {
        category: "safari",
        min_price: 1000,
        max_price: 5000,
      };
      const mockData = {
        data: [
          {
            id: "1",
            title: "Filtered Tour",
            images: [],
            includes: [],
            excludes: [],
            pricing_periods: [], itinerary: [], destinations: [],
          },
        ],
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
      const result = await toursApi.getAll(filters);
      expect(apiClient.get).toHaveBeenCalledWith("/tours", { params: filters });
      expect(result).toEqual(mockData);
    });
  });

  describe("getFeatured", () => {
    // it("should fetch featured tours with default limit", async () => {
    //   const mockData = {
    //     data: [{ id: "1", title: "Featured Tour", featured: true }],
    //   };

    //   (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    //   const result = await toursApi.getFeatured();

    //   expect(apiClient.get).toHaveBeenCalledWith("/tours/featured", {
    //     params: { limit: 6 },
    //   });
    //   expect(result).toEqual(mockData);
    // });
    it("should fetch featured tours with default limit", async () => {
      const mockData = {
        data: [
          {
            id: "1",
            title: "Featured Tour",
            featured: true,
            images: [],
            includes: [],
            excludes: [],
            pricing_periods: [], itinerary: [], destinations: [],
          },
        ],
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
      const result = await toursApi.getFeatured();
      expect(apiClient.get).toHaveBeenCalledWith("/tours/featured", {
        params: { limit: 6 },
      });
      expect(result).toEqual(mockData);
    });

    // it("should fetch featured tours with custom limit", async () => {
    //   const mockData = {
    //     data: [{ id: "1", title: "Featured Tour" }],
    //   };

    //   (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    //   const result = await toursApi.getFeatured(3);

    //   expect(apiClient.get).toHaveBeenCalledWith("/tours/featured", {
    //     params: { limit: 3 },
    //   });
    //   expect(result).toEqual(mockData);
    // });
    it("should fetch featured tours with custom limit", async () => {
      const mockData = {
        data: [
          {
            id: "1",
            title: "Featured Tour",
            images: [],
            includes: [],
            excludes: [],
            pricing_periods: [], itinerary: [], destinations: [],
          },
        ],
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
      const result = await toursApi.getFeatured(3);
      expect(apiClient.get).toHaveBeenCalledWith("/tours/featured", {
        params: { limit: 3 },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("getDeals", () => {
    // it("should fetch deal tours", async () => {
    //   const mockData = {
    //     data: [{ id: "1", title: "Deal Tour", is_deal: true }],
    //   };

    //   (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    //   const result = await toursApi.getDeals(10);

    //   expect(apiClient.get).toHaveBeenCalledWith("/tours/deals", {
    //     params: { limit: 10 },
    //   });
    //   expect(result).toEqual(mockData);
    // });
    it("should fetch deal tours", async () => {
      const mockData = {
        data: [
          {
            id: "1",
            title: "Deal Tour",
            is_deal: true,
            images: [],
            includes: [],
            excludes: [],
            pricing_periods: [], itinerary: [], destinations: [],
          },
        ],
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
      const result = await toursApi.getDeals(10);
      expect(apiClient.get).toHaveBeenCalledWith("/tours/deals", {
        params: { limit: 10 },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("search", () => {
    // it("should search tours by query", async () => {
    //   const mockData = {
    //     data: [{ id: "1", title: "Safari Adventure" }],
    //   };

    //   (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    //   const result = await toursApi.search("safari");

    //   expect(apiClient.get).toHaveBeenCalledWith("/tours/search", {
    //     params: { q: "safari" },
    //   });
    //   expect(result).toEqual(mockData);
    // });
    it("should search tours by query", async () => {
      const mockData = {
        data: [
          {
            id: "1",
            title: "Safari Adventure",
            images: [],
            includes: [],
            excludes: [],
            pricing_periods: [], itinerary: [], destinations: [],
          },
        ],
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
      const result = await toursApi.search("safari");
      expect(apiClient.get).toHaveBeenCalledWith("/tours/search", {
        params: { q: "safari" },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("getById", () => {
    // it("should fetch a tour by ID", async () => {
    //   const mockData = {
    //     data: { id: "123", title: "Specific Tour" },
    //   };

    //   (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    //   const result = await toursApi.getById("123");

    //   expect(apiClient.get).toHaveBeenCalledWith("/tours/123");
    //   expect(result).toEqual(mockData);
    // });
    it("should fetch a tour by ID", async () => {
      const mockData = {
        data: {
          id: "123",
          title: "Specific Tour",
          images: [],
          includes: [],
          excludes: [],
          pricing_periods: [], itinerary: [], destinations: [],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
      const result = await toursApi.getById("123");
      expect(apiClient.get).toHaveBeenCalledWith("/tours/123");
      expect(result).toEqual(mockData);
    });
  });

  describe("getBySlug", () => {
    // it("should fetch a tour by slug", async () => {
    //   const mockData = {
    //     data: { id: "1", slug: "safari-adventure", title: "Safari Adventure" },
    //   };

    //   (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    //   const result = await toursApi.getBySlug("safari-adventure");

    //   expect(apiClient.get).toHaveBeenCalledWith("/tours/slug/safari-adventure");
    //   expect(result).toEqual(mockData);
    // });
    it("should fetch a tour by slug", async () => {
      const mockData = {
        data: {
          id: "1",
          slug: "safari-adventure",
          title: "Safari Adventure",
          images: [],
          includes: [],
          excludes: [],
          pricing_periods: [], itinerary: [], destinations: [],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
      const result = await toursApi.getBySlug("safari-adventure");
      expect(apiClient.get).toHaveBeenCalledWith("/tours/slug/safari-adventure");
      expect(result).toEqual(mockData);
    });
  });

  describe("getStats", () => {
    it("should fetch tour statistics", async () => {
      const mockData = {
        data: { bookings: 50, revenue: 100000 },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const result = await toursApi.getStats("123");

      expect(apiClient.get).toHaveBeenCalledWith("/tours/123/stats");
      expect(result).toEqual(mockData);
    });
  });

  describe("create", () => {
    // it("should create a new tour", async () => {
    //   const tourData = {
    //     title: "New Safari Tour",
    //     description: "Amazing safari experience",
    //     price: 2000,
    //   };

    //   const mockResponse = {
    //     data: { id: "456", ...tourData },
    //   };

    //   (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

    //   const result = await toursApi.create(tourData);

    //   expect(apiClient.post).toHaveBeenCalledWith("/tours", tourData);
    //   expect(result).toEqual(mockResponse);
    // });
    it("should create a new tour", async () => {
      const tourData = {
        title: "New Safari Tour",
        description: "Amazing safari experience",
        price: 2000,
      };
      const mockResponse = {
        data: {
          id: "456",
          title: "New Safari Tour",
          description: "Amazing safari experience",
          price: 2000,
          images: [],
          includes: [],
          excludes: [],
          pricing_periods: [], itinerary: [], destinations: [],
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      const result = await toursApi.create(tourData);
      expect(apiClient.post).toHaveBeenCalledWith("/tours", tourData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("update", () => {
    // it("should update an existing tour", async () => {
    //   const tourData = {
    //     title: "Updated Tour Title",
    //     price: 2500,
    //   };

    //   const mockResponse = {
    //     data: { id: "123", ...tourData },
    //   };

    //   (apiClient.patch as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

    //   const result = await toursApi.update("123", tourData);

    //   expect(apiClient.patch).toHaveBeenCalledWith("/tours/123", tourData);
    //   expect(result).toEqual(mockResponse);
    // });
    it("should update an existing tour", async () => {
      const tourData = { title: "Updated Tour Title", price: 2500 };
      const mockResponse = {
        data: {
          id: "123",
          title: "Updated Tour Title",
          price: 2500,
          images: [],
          includes: [],
          excludes: [],
          pricing_periods: [], itinerary: [], destinations: [],
        },
      };
      (apiClient.patch as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      const result = await toursApi.update("123", tourData);
      expect(apiClient.patch).toHaveBeenCalledWith("/tours/123", tourData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("delete", () => {
    it("should delete a tour", async () => {
      const mockResponse = {
        data: { message: "Tour deleted successfully" },
      };

      (apiClient.delete as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await toursApi.delete("123");

      expect(apiClient.delete).toHaveBeenCalledWith("/tours/123");
      expect(result).toEqual(mockResponse);
    });
  });

  // describe('getTopPerforming', () => {
  //   it('should fetch top performing tours by bookings', async () => {
  //     const mockData = [
  //       { id: '1', title: 'Top Tour 1', bookings: 100 },
  //       { id: '2', title: 'Top Tour 2', bookings: 80 },
  //     ];

  //     (apiClient.get as jest.Mock).mockResolvedValueOnce({
  //       data: { success: true, data: mockData },
  //     });

  //     const result = await toursApi.getTopPerforming('bookings');

  //     expect(apiClient.get).toHaveBeenCalledWith(
  //       '/tours/stats/top-performing?metric=bookings',
  //     );
  //     expect(result).toEqual(mockData);
  //   });
  describe("getTopPerforming", () => {
    it("should fetch top performing tours by bookings", async () => {
      const mockData = {
        tours: [
          { id: "1", title: "Top Tour 1", bookings: 100 },
          { id: "2", title: "Top Tour 2", bookings: 80 },
        ],
        top_tour: { title: "Top Tour 1", value: 100 },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { success: true, data: mockData },
      });
      const result = await toursApi.getTopPerforming("bookings");
      expect(apiClient.get).toHaveBeenCalledWith("/tours/stats/top-performing?metric=bookings");
      expect(result).toEqual({
        tours: mockData.tours.map((t) => ({
          ...t,
          images: [],
          includes: [],
          excludes: [],
          pricing_periods: [], itinerary: [], destinations: [],
        })),
        top_tour: mockData.top_tour,
      });
    });

    // it("should fetch top performing tours by revenue", async () => {
    //   const mockData = [
    //     { id: "1", title: "Top Tour 1", revenue: 50000 },
    //     { id: "2", title: "Top Tour 2", revenue: 40000 },
    //   ];

    //   (apiClient.get as jest.Mock).mockResolvedValueOnce({
    //     data: { success: true, data: mockData },
    //   });

    //   const result = await toursApi.getTopPerforming("revenue");

    //   expect(apiClient.get).toHaveBeenCalledWith("/tours/stats/top-performing?metric=revenue");
    //   expect(result).toEqual(mockData);
    // });
    it("should fetch top performing tours by revenue", async () => {
      const mockData = {
        tours: [
          { id: "1", title: "Top Tour 1", revenue: 50000 },
          { id: "2", title: "Top Tour 2", revenue: 40000 },
        ],
        top_tour: { title: "Top Tour 1", value: 50000 },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { success: true, data: mockData },
      });
      const result = await toursApi.getTopPerforming("revenue");
      expect(apiClient.get).toHaveBeenCalledWith("/tours/stats/top-performing?metric=revenue");
      expect(result).toEqual({
        tours: mockData.tours.map((t) => ({
          ...t,
          images: [],
          includes: [],
          excludes: [],
          pricing_periods: [], itinerary: [], destinations: [],
        })),
        top_tour: mockData.top_tour,
      });
    });
  });
});
