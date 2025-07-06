import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoBadge } from '@/types/mo_badge'

export const moBadgeApi = createApi({
  reducerPath: 'moBadgeApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoBadge'],
  endpoints: (builder) => ({
    getAll: builder.query<MoBadge[], void>({
      query: () => '/mo_badge',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoBadge' as const, id: item.id })),
              { type: 'MoBadge' as const, id: 'LIST' },
            ]
          : [{ type: 'MoBadge' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoBadge, number>({
      query: (id) => `/mo_badge/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoBadge' as const, id }],
    }),
    create: builder.mutation<MoBadge, Partial<MoBadge>>({
      query: (body) => ({
        url: '/mo_badge',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoBadge' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoBadge, Partial<MoBadge> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_badge/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoBadge' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_badge/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoBadge' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moBadgeApi