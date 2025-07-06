import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoReport } from '@/types/mo_report'

export const moReportApi = createApi({
  reducerPath: 'moReportApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoReport'],
  endpoints: (builder) => ({
    getAll: builder.query<MoReport[], void>({
      query: () => '/mo_report',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoReport' as const, id: item.id })),
              { type: 'MoReport' as const, id: 'LIST' },
            ]
          : [{ type: 'MoReport' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoReport, number>({
      query: (id) => `/mo_report/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoReport' as const, id }],
    }),
    create: builder.mutation<MoReport, Partial<MoReport>>({
      query: (body) => ({
        url: '/mo_report',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoReport' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoReport, Partial<MoReport> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_report/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoReport' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_report/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoReport' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moReportApi