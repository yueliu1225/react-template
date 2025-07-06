import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoAttachments } from '@/types/mo_attachments'

export const moAttachmentsApi = createApi({
  reducerPath: 'moAttachmentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoAttachments'],
  endpoints: (builder) => ({
    getAll: builder.query<MoAttachments[], void>({
      query: () => '/mo_attachments',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoAttachments' as const, id: item.id })),
              { type: 'MoAttachments' as const, id: 'LIST' },
            ]
          : [{ type: 'MoAttachments' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoAttachments, number>({
      query: (id) => `/mo_attachments/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoAttachments' as const, id }],
    }),
    create: builder.mutation<MoAttachments, Partial<MoAttachments>>({
      query: (body) => ({
        url: '/mo_attachments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoAttachments' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoAttachments, Partial<MoAttachments> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_attachments/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoAttachments' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_attachments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoAttachments' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moAttachmentsApi