import { baseApi } from "../baseApi";

const normalizeListResponse = (response) => {
  const result = response?.result ?? response;
  const data = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(response?.data)
    ? response.data
    : Array.isArray(result)
    ? result
    : [];

  const pagination = result?.pagination ?? {};

  return {
    data,
    total: result?.total ?? pagination.total ?? response?.count ?? data.length,
    page: pagination.page ?? result?.page ?? 1,
    limit: pagination.limit ?? result?.limit ?? data.length,
    totalPages:
      pagination.totalPages ??
      result?.totalPages ??
      (data.length ? 1 : 0),
  };
};

export const bedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBeds: builder.query({
      query: (params = {}) => ({
        url: "/beds",
        params,
      }),
      transformResponse: normalizeListResponse,
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({ type: "Bed", id })),
              { type: "Bed", id: "LIST" },
            ]
          : [{ type: "Bed", id: "LIST" }],
    }),

    getAvailableBeds: builder.query({
      query: (params = {}) => ({
        url: "/beds/available",
        params,
      }),
      transformResponse: normalizeListResponse,
      providesTags: [{ type: "Bed", id: "LIST" }],
    }),

    getBedsByRoom: builder.query({
      query: (roomId) => `/rooms/${roomId}/beds`,
      transformResponse: (response) => response?.data ?? response?.result ?? [],
      providesTags: [{ type: "Bed", id: "LIST" }],
    }),

    getBedById: builder.query({
      query: (id) => `/beds/${id}`,
      transformResponse: (response) => response?.result ?? response,
      providesTags: (result, error, id) => [{ type: "Bed", id }],
    }),

    createBed: builder.mutation({
      query: (body) => ({
        url: "/beds",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Bed", id: "LIST" },
        { type: "Room", id: "LIST" },
      ],
    }),

    updateBed: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/beds/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Bed", id },
        { type: "Bed", id: "LIST" },
        { type: "Room", id: "LIST" },
      ],
    }),

    patchBed: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/beds/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Bed", id },
        { type: "Bed", id: "LIST" },
        { type: "Room", id: "LIST" },
      ],
    }),

    updateBedStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/beds/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Bed", id },
        { type: "Bed", id: "LIST" },
        { type: "Room", id: "LIST" },
      ],
    }),

    deleteBed: builder.mutation({
      query: (id) => ({
        url: `/beds/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Bed", id: "LIST" },
        { type: "Room", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBedsQuery,
  useGetAvailableBedsQuery,
  useGetBedsByRoomQuery,
  useGetBedByIdQuery,
  useCreateBedMutation,
  useUpdateBedMutation,
  usePatchBedMutation,
  useUpdateBedStatusMutation,
  useDeleteBedMutation,
} = bedApi;
