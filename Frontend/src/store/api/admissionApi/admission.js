import { baseApi } from "../baseApi";

/* ─────────────────────────────────────────────────────────────
   Normalise paginated list responses coming from the backend.
   Handles both { result: { data, pagination } } and flat shapes.
───────────────────────────────────────────────────────────── */
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
    total:      result?.total      ?? pagination.total      ?? response?.count ?? data.length,
    page:       pagination.page    ?? result?.page          ?? 1,
    limit:      pagination.limit   ?? result?.limit         ?? data.length,
    totalPages: pagination.totalPages ?? result?.totalPages ?? (data.length ? 1 : 0),
  };
};

/* ─────────────────────────────────────────────────────────────
   Tag helper — builds providesTags for a list + individual items
───────────────────────────────────────────────────────────── */
const listTags = (type) => (result) =>
  result?.data?.length
    ? [
        ...result.data.map(({ id }) => ({ type, id })),
        { type, id: "LIST" },
      ]
    : [{ type, id: "LIST" }];

/* ─────────────────────────────────────────────────────────────
   ADMISSION API
   Base URL segments match routes/ipd/admission.routes.js:
     POST   /ipd/admissions
     GET    /ipd/admissions              (all, paginated + filters)
     GET    /ipd/admissions/active       (admitted only)
     GET    /ipd/admissions/search       (?q=)
     GET    /ipd/admissions/:id
     GET    /ipd/admissions/by-patient/:patientId
     PUT    /ipd/admissions/:id
     PATCH  /ipd/admissions/:id
     DELETE /ipd/admissions/:id
───────────────────────────────────────────────────────────── */
export const admissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ── LIST (all admissions, supports pagination + filter params) ── */
    getAdmissions: builder.query({
      query: (params = {}) => ({
        url: "/ipd/admissions",
        params,
      }),
      transformResponse: normalizeListResponse,
      providesTags: listTags("Admission"),
    }),

    /* ── ACTIVE admissions only ── */
    getActiveAdmissions: builder.query({
      query: (params = {}) => ({
        url: "/ipd/admissions/active",
        params,
      }),
      transformResponse: normalizeListResponse,
      providesTags: listTags("Admission"),
    }),

    /* ── SEARCH  (/ipd/admissions/search?q=…) ── */
    searchAdmissions: builder.query({
      query: (q = "") => ({
        url: "/ipd/admissions/search",
        params: { q },
      }),
      transformResponse: (response) =>
        Array.isArray(response?.data) ? response.data : [],
      providesTags: [{ type: "Admission", id: "LIST" }],
    }),

    /* ── SINGLE by ID ── */
    getAdmissionById: builder.query({
      query: (id) => `/ipd/admissions/${id}`,
      transformResponse: (response) => response?.result ?? response?.data ?? response,
      providesTags: (result, error, id) => [{ type: "Admission", id }],
    }),

    /* ── BY PATIENT ── */
    getAdmissionsByPatient: builder.query({
      query: ({ patientId, ...params }) => ({
        url: `/ipd/admissions/by-patient/${patientId}`,
        params,
      }),
      transformResponse: normalizeListResponse,
      providesTags: [{ type: "Admission", id: "LIST" }],
    }),

    /* ── CREATE ── */
    createAdmission: builder.mutation({
      query: (body) => ({
        url: "/ipd/admissions",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Admission", id: "LIST" },
        { type: "Bed",       id: "LIST" },
      ],
    }),

    /* ── UPDATE (full replace) ── */
    updateAdmission: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/ipd/admissions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Admission", id },
        { type: "Admission", id: "LIST" },
        { type: "Bed",       id: "LIST" },
      ],
    }),

    /* ── PATCH (partial update, e.g. status change) ── */
    patchAdmission: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/ipd/admissions/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Admission", id },
        { type: "Admission", id: "LIST" },
      ],
    }),

    /* ── CANCEL / DELETE ── */
    cancelAdmission: builder.mutation({
      query: (id) => ({
        url: `/ipd/admissions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Admission", id },
        { type: "Admission", id: "LIST" },
        { type: "Bed",       id: "LIST" },
      ],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetAdmissionsQuery,
  useGetActiveAdmissionsQuery,
  useSearchAdmissionsQuery,
  useGetAdmissionByIdQuery,
  useGetAdmissionsByPatientQuery,
  useCreateAdmissionMutation,
  useUpdateAdmissionMutation,
  usePatchAdmissionMutation,
  useCancelAdmissionMutation,
} = admissionApi;