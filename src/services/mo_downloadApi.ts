import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoDownload } from '@/types/mo_download'

export const moDownloadApi = createApi({
  reducerPath: 'moDownloadApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoDownload'],
  endpoints: (builder) => ({
    getAll: builder.query<MoDownload[], void>({
      query: () => '/mo_download',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoDownload' as const, id: item.id })),
              { type: 'MoDownload' as const, id: 'LIST' },
            ]
          : [{ type: 'MoDownload' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoDownload, number>({
      query: (id) => `/mo_download/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoDownload' as const, id }],
    }),
    create: builder.mutation<MoDownload, Partial<MoDownload>>({
      query: (body) => ({
        url: '/mo_download',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoDownload' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoDownload, Partial<MoDownload> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_download/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoDownload' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_download/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoDownload' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moDownloadApi