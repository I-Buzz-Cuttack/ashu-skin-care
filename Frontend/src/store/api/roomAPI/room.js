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

export const roomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: (params = {}) => ({
        url: "/rooms",
        params,
      }),
      transformResponse: normalizeListResponse,
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({ type: "Room", id })),
              { type: "Room", id: "LIST" },
            ]
          : [{ type: "Room", id: "LIST" }],
    }),

    getRoomById: builder.query({
      query: (id) => `/rooms/${id}`,
      transformResponse: (response) => response?.result ?? response,
      providesTags: (result, error, id) => [{ type: "Room", id }],
    }),

    getRoomsByWard: builder.query({
      query: (wardId) => `/wards/${wardId}/rooms`,
      transformResponse: (response) => response?.data ?? response?.result ?? [],
      providesTags: [{ type: "Room", id: "LIST" }],
    }),

    createRoom: builder.mutation({
      query: (body) => ({
        url: "/rooms",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Room", id: "LIST" },
        { type: "Ward", id: "LIST" },
      ],
    }),

    updateRoom: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/rooms/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Room", id },
        { type: "Room", id: "LIST" },
        { type: "Ward", id: "LIST" },
      ],
    }),

    patchRoom: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/rooms/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Room", id },
        { type: "Room", id: "LIST" },
        { type: "Ward", id: "LIST" },
      ],
    }),

    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Room", id: "LIST" },
        { type: "Bed", id: "LIST" },
        { type: "Ward", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useGetRoomsByWardQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  usePatchRoomMutation,
  useDeleteRoomMutation,
} = roomApi;
