import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoDownloadRate } from '@/types/mo_download_rate'

export const moDownloadRateApi = createApi({
  reducerPath: 'moDownloadRateApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoDownloadRate'],
  endpoints: (builder) => ({
    getAll: builder.query<MoDownloadRate[], void>({
      query: () => '/mo_download_rate',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoDownloadRate' as const, id: item.id })),
              { type: 'MoDownloadRate' as const, id: 'LIST' },
            ]
          : [{ type: 'MoDownloadRate' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoDownloadRate, number>({
      query: (id) => `/mo_download_rate/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoDownloadRate' as const, id }],
    }),
    create: builder.mutation<MoDownloadRate, Partial<MoDownloadRate>>({
      query: (body) => ({
        url: '/mo_download_rate',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoDownloadRate' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoDownloadRate, Partial<MoDownloadRate> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_download_rate/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoDownloadRate' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_download_rate/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoDownloadRate' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moDownloadRateApi