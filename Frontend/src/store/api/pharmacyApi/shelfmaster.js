import { baseApi } from "../baseApi";

export const shelfMasterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShelves: builder.query({
      query: (params = {}) => ({
        url: "/shelf-master",
        params,
      }),
      providesTags: [{ type: "ShelfMaster", id: "LIST" }],
    }),

    getShelfById: builder.query({
      query: (id) => `/shelf-master/${id}`,
      providesTags: (result, error, id) => [{ type: "ShelfMaster", id }],
    }),

    createShelf: builder.mutation({
      query: (body) => ({
        url: "/shelf-master",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ShelfMaster", id: "LIST" }],
    }),

    updateShelf: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/shelf-master/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "ShelfMaster", id: "LIST" }],
    }),

    patchShelf: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/shelf-master/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "ShelfMaster", id: "LIST" }],
    }),

    deleteShelf: builder.mutation({
      query: (id) => ({
        url: `/shelf-master/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ShelfMaster", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShelvesQuery,
  useGetShelfByIdQuery,
  useCreateShelfMutation,
  useUpdateShelfMutation,
  usePatchShelfMutation,
  useDeleteShelfMutation,
} = shelfMasterApi;