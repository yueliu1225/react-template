import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoViews } from '@/types/mo_views'

export const moViewsApi = createApi({
  reducerPath: 'moViewsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoViews'],
  endpoints: (builder) => ({
    getAll: builder.query<MoViews[], void>({
      query: () => '/mo_views',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoViews' as const, id: item.id })),
              { type: 'MoViews' as const, id: 'LIST' },
            ]
          : [{ type: 'MoViews' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoViews, number>({
      query: (id) => `/mo_views/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoViews' as const, id }],
    }),
    create: builder.mutation<MoViews, Partial<MoViews>>({
      query: (body) => ({
        url: '/mo_views',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoViews' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoViews, Partial<MoViews> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_views/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoViews' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_views/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoViews' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moViewsApi