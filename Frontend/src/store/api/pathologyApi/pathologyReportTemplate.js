import { baseApi } from '../baseApi';

export const pathologyReportTemplateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create report template
    createReportTemplate: builder.mutation({
      query: (data) => ({
        url: '/report-templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'ReportTemplate', id: 'LIST' }],
    }),

    // Get all report templates with filters
    getReportTemplates: builder.query({
      query: (params) => ({
        url: '/report-templates',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'ReportTemplate', id: 'LIST' }],
    }),

    // Get template by pathology master id
    getTemplateByPathologyMasterId: builder.query({
      query: (pathologyMasterId) => ({
        url: '/report-templates/test',
        method: 'GET',
        params: { pathologyMasterId },
      }),
      providesTags: (_, __, pathologyMasterId) => [
        { type: 'ReportTemplate', id: `MASTER_${pathologyMasterId}` },
      ],
    }),

    // Get single template by id
    getReportTemplateById: builder.query({
      query: (id) => ({
        url: `/report-templates/${id}`,
        method: 'GET',
      }),
      providesTags: (_, __, id) => [{ type: 'ReportTemplate', id }],
    }),

    // Update report template
    updateReportTemplate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/report-templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'ReportTemplate', id },
        { type: 'ReportTemplate', id: 'LIST' },
      ],
    }),

    // Delete report template
    deleteReportTemplate: builder.mutation({
      query: (id) => ({
        url: `/report-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ReportTemplate', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateReportTemplateMutation,
  useGetReportTemplatesQuery,
  useGetTemplateByPathologyMasterIdQuery,
  useGetReportTemplateByIdQuery,
  useUpdateReportTemplateMutation,
  useDeleteReportTemplateMutation,
} = pathologyReportTemplateApi;

export default pathologyReportTemplateApi;
