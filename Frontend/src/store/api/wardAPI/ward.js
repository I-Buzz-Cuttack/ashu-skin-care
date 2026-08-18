// src/redux/api/ward.js

import { baseApi } from "../baseApi";

export const wardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // ================= GET ALL WARDS =================
    getWards: builder.query({
      query: (params = {}) => ({
        url: "/wards",
        params,
      }),

      transformResponse: (response) => {
        // transformResponse for wards

        // Handle backend structure
        if (response?.result?.data) {
          return {
            data: response.result.data,
            total: response.result.pagination?.total || 0,
            page: response.result.pagination?.page || 1,
            limit: response.result.pagination?.limit || 10,
            totalPages:
              response.result.pagination?.totalPages || 0,
          };
        }

        // Fallback array response
        if (Array.isArray(response)) {
          return {
            data: response,
            total: response.length,
            page: 1,
            limit: response.length,
            totalPages: 1,
          };
        }

        return {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        };
      },

      providesTags: (result) => {
        if (result?.data && Array.isArray(result.data)) {
          return [
            ...result.data.map(({ id }) => ({
              type: "Ward",
              id,
            })),
            { type: "Ward", id: "LIST" },
          ];
        }

        return [{ type: "Ward", id: "LIST" }];
      },
    }),

    // ================= GET WARD BY ID =================
    getWardById: builder.query({
      query: (id) => `/wards/${id}`,

      transformResponse: (response) => {
        if (response?.result) return response.result;
        return response;
      },

      providesTags: (result, error, id) => [
        { type: "Ward", id },
      ],
    }),

    // ================= CREATE WARD =================
    createWard: builder.mutation({
      query: (body) => ({
        url: "/wards",
        method: "POST",
        body,
      }),

      invalidatesTags: [
        { type: "Ward", id: "LIST" },
      ],
    }),

    // ================= UPDATE WARD =================
    updateWard: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/wards/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "Ward", id },
        { type: "Ward", id: "LIST" },
      ],
    }),

    // ================= PATCH WARD =================
    patchWard: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/wards/${id}`,
        method: "PATCH",
        body,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "Ward", id },
        { type: "Ward", id: "LIST" },
      ],
    }),

    // ================= DELETE WARD =================
    deleteWard: builder.mutation({
      query: (id) => ({
        url: `/wards/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        { type: "Ward", id: "LIST" },
      ],
    }),

    // ================= SEARCH WARDS =================
    searchWards: builder.query({
      query: (search) => ({
        url: "/wards/search",
        params: { search },
      }),

      transformResponse: (response) => {
        if (response?.data) return response.data;
        return response || [];
      },

      providesTags: [{ type: "Ward", id: "LIST" }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetWardsQuery,
  useGetWardByIdQuery,
  useCreateWardMutation,
  useUpdateWardMutation,
  usePatchWardMutation,
  useDeleteWardMutation,
  useSearchWardsQuery,
} = wardApi;