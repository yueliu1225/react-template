import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoBadgeHistory } from '@/types/mo_badge_history'

export const moBadgeHistoryApi = createApi({
  reducerPath: 'moBadgeHistoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoBadgeHistory'],
  endpoints: (builder) => ({
    getAll: builder.query<MoBadgeHistory[], void>({
      query: () => '/mo_badge_history',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoBadgeHistory' as const, id: item.id })),
              { type: 'MoBadgeHistory' as const, id: 'LIST' },
            ]
          : [{ type: 'MoBadgeHistory' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoBadgeHistory, number>({
      query: (id) => `/mo_badge_history/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoBadgeHistory' as const, id }],
    }),
    create: builder.mutation<MoBadgeHistory, Partial<MoBadgeHistory>>({
      query: (body) => ({
        url: '/mo_badge_history',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoBadgeHistory' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoBadgeHistory, Partial<MoBadgeHistory> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_badge_history/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoBadgeHistory' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_badge_history/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoBadgeHistory' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moBadgeHistoryApi