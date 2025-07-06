import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoApiLimit } from '@/types/mo_api_limit'

export const moApiLimitApi = createApi({
  reducerPath: 'moApiLimitApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoApiLimit'],
  endpoints: (builder) => ({
    getAll: builder.query<MoApiLimit[], void>({
      query: () => '/mo_api_limit',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoApiLimit' as const, id: item.id })),
              { type: 'MoApiLimit' as const, id: 'LIST' },
            ]
          : [{ type: 'MoApiLimit' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoApiLimit, number>({
      query: (id) => `/mo_api_limit/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoApiLimit' as const, id }],
    }),
    create: builder.mutation<MoApiLimit, Partial<MoApiLimit>>({
      query: (body) => ({
        url: '/mo_api_limit',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoApiLimit' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoApiLimit, Partial<MoApiLimit> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_api_limit/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoApiLimit' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_api_limit/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoApiLimit' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moApiLimitApi