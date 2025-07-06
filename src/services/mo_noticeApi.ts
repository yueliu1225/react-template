import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoNotice } from '@/types/mo_notice'

export const moNoticeApi = createApi({
  reducerPath: 'moNoticeApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoNotice'],
  endpoints: (builder) => ({
    getAll: builder.query<MoNotice[], void>({
      query: () => '/mo_notice',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoNotice' as const, id: item.id })),
              { type: 'MoNotice' as const, id: 'LIST' },
            ]
          : [{ type: 'MoNotice' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoNotice, number>({
      query: (id) => `/mo_notice/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoNotice' as const, id }],
    }),
    create: builder.mutation<MoNotice, Partial<MoNotice>>({
      query: (body) => ({
        url: '/mo_notice',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoNotice' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoNotice, Partial<MoNotice> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_notice/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoNotice' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_notice/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoNotice' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moNoticeApi