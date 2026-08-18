// import { baseApi } from '../baseApi';

// export const hospitalApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({

//     getHospitals: builder.query({
//       query: (params = {}) => ({
//         url: '/hospital',
//         params,
//       }),
//       transformResponse: (response) => {
//         const list       = response?.result?.data                   ?? [];
//         const total      = response?.result?.pagination?.total      ?? list.length;
//         const totalPages = response?.result?.pagination?.totalPages ?? Math.ceil(total / 5);
//         return { data: list, total, totalPages };
//       },
//       providesTags: (result) =>
//         result?.data?.length
//           ? [
//               ...result.data.map(({ id }) => ({ type: 'Hospital', id })),
//               { type: 'Hospital', id: 'LIST' },
//             ]
//           : [{ type: 'Hospital', id: 'LIST' }],
//     }),

//     getHospitalById: builder.query({
//       query: (id) => `/hospital/${id}`,
//       providesTags: (_, __, id) => [{ type: 'Hospital', id }],
//     }),

//     createHospital: builder.mutation({
//       query: (body) => ({
//         url: '/hospital',
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: [{ type: 'Hospital', id: 'LIST' }],
//     }),

//     updateHospital: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/hospital/${id}`,
//         method: 'PUT',
//         body,
//       }),
//       invalidatesTags: (_, __, { id }) => [
//         { type: 'Hospital', id: 'LIST' },
//         { type: 'Hospital', id },
//       ],
//     }),

//     patchHospital: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/hospital/${id}`,
//         method: 'PATCH',
//         body,
//       }),
//       invalidatesTags: (_, __, { id }) => [
//         { type: 'Hospital', id: 'LIST' },
//         { type: 'Hospital', id },
//       ],
//     }),

//     deleteHospital: builder.mutation({
//       query: (id) => ({
//         url: `/hospital/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: [{ type: 'Hospital', id: 'LIST' }],
//     }),

//   }),
//   overrideExisting: true,
// });

// export const {
//   useGetHospitalsQuery,
//   useGetHospitalByIdQuery,
//   useCreateHospitalMutation,
//   useUpdateHospitalMutation,
//   usePatchHospitalMutation,
//   useDeleteHospitalMutation,
// } = hospitalApi;






import { baseApi } from '../baseApi';

export const hospitalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL
    getHospitals: builder.query({
      query: (params = {}) => ({
        url: '/hospital',
        params,
      }),
      transformResponse: (response) => response?.result ?? response,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Hospital',
                id,
              })),
              { type: 'Hospital', id: 'LIST' },
            ]
          : [{ type: 'Hospital', id: 'LIST' }],
    }),

    // GET BY ID
    getHospitalById: builder.query({
      query: (id) => ({
        url: `/hospital/${id}`,
      }),
      transformResponse: (response) => response?.result ?? response,
      providesTags: (_, __, id) => [{ type: 'Hospital', id }],
    }),

    // CREATE
    createHospital: builder.mutation({
      query: (body) => ({
        url: '/hospital',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Hospital', id: 'LIST' }],
    }),

    // UPDATE
    updateHospital: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/hospital/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Hospital', id },
        { type: 'Hospital', id: 'LIST' },
      ],
    }),

    // DELETE
    deleteHospital: builder.mutation({
      query: (id) => ({
        url: `/hospital/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Hospital', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHospitalsQuery,
  useGetHospitalByIdQuery,
  useCreateHospitalMutation,
  useUpdateHospitalMutation,
  useDeleteHospitalMutation,
} = hospitalApi;