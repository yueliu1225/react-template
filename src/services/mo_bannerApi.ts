import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoBanner } from '@/types/mo_banner'

export const moBannerApi = createApi({
  reducerPath: 'moBannerApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoBanner'],
  endpoints: (builder) => ({
    getAll: builder.query<MoBanner[], void>({
      query: () => '/mo_banner',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoBanner' as const, id: item.id })),
              { type: 'MoBanner' as const, id: 'LIST' },
            ]
          : [{ type: 'MoBanner' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoBanner, number>({
      query: (id) => `/mo_banner/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoBanner' as const, id }],
    }),
    create: builder.mutation<MoBanner, Partial<MoBanner>>({
      query: (body) => ({
        url: '/mo_banner',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoBanner' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoBanner, Partial<MoBanner> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_banner/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoBanner' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_banner/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoBanner' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moBannerApi