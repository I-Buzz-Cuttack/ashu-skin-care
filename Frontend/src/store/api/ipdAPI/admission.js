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

export const admissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveAdmissions: builder.query({
      query: (params = {}) => ({
        url: "/ipd/admissions/active",
        params,
      }),
      transformResponse: normalizeListResponse,
      providesTags: [{ type: "Bed", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetActiveAdmissionsQuery } = admissionApi;
