import { baseApi } from '../baseApi';

export const pathologyMasterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // -- GET ALL ----------------------------------------------------------------
    // GET /pathology-master
    // Supports: search, page, limit, isActive, categoryId, testType, sampleType, performedAt
    getPathologyMasters: builder.query({
      query: (params = {}) => ({
        url: '/pathology-master',
        params,
      }),
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map(({ id }) => ({ type: 'PathologyMaster', id })),
              { type: 'PathologyMaster', id: 'LIST' },
            ]
          : [{ type: 'PathologyMaster', id: 'LIST' }],
    }),

    // -- SEARCH -----------------------------------------------------------------
    searchPathologyMasters: builder.query({
      query: (params = {}) => ({
        url: '/pathology-master/search',
        params,
      }),
      providesTags: [{ type: 'PathologyMaster', id: 'LIST' }],
    }),

    // -- GET BY ID ---------------------------------------------------------------
    getPathologyMasterById: builder.query({
      query: (id) => `/pathology-master/${id}`,
      providesTags: (_, __, id) => [{ type: 'PathologyMaster', id }],
    }),

    // -- DROPDOWN HELPERS (matching radiologyTestApi) -----------------------------
    getPathologyCategoriesForDropdown: builder.query({
      query: () => ({
        url: '/pathology-category',
        params: { limit: 1000, isActive: true },
      }),
      transformResponse: (response) =>
        response?.result?.data?.map(({ id, categoryName, name }) => ({
          value: id,
          label: categoryName || name,
        })) || [],
      providesTags: [{ type: 'PathologyCategory', id: 'DROPDOWN' }],
    }),

    getPathologyChargeNamesForDropdown: builder.query({
      query: () => ({
        url: '/pathology-charge-name',
        params: { limit: 1000, isActive: true },
      }),
      transformResponse: (response) =>
        response?.result?.data?.map(({ id, name }) => ({
          value: id,
          label: name,
        })) || [],
      providesTags: [{ type: 'PathologyChargeName', id: 'DROPDOWN' }],
    }),

    // -- CREATE ------------------------------------------------------------------
    createPathologyMaster: builder.mutation({
      query: (body) => ({
        url: '/pathology-master',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologyMaster', id: 'LIST' }],
    }),

    // -- FULL UPDATE (PUT) -------------------------------------------------------
    updatePathologyMaster: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-master/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'PathologyMaster', id: 'LIST' },
        { type: 'PathologyMaster', id },
      ],
    }),

    // -- PARTIAL UPDATE (PATCH) --------------------------------------------------
    patchPathologyMaster: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-master/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'PathologyMaster', id: 'LIST' },
        { type: 'PathologyMaster', id },
      ],
    }),

    // -- SOFT DELETE -------------------------------------------------------------
    deletePathologyMaster: builder.mutation({
      query: (id) => ({
        url: `/pathology-master/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PathologyMaster', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPathologyMastersQuery,
  useSearchPathologyMastersQuery,
  useGetPathologyMasterByIdQuery,
  useGetPathologyCategoriesForDropdownQuery,
  useGetPathologyChargeNamesForDropdownQuery,
  useCreatePathologyMasterMutation,
  useUpdatePathologyMasterMutation,
  usePatchPathologyMasterMutation,
  useDeletePathologyMasterMutation,
} = pathologyMasterApi;