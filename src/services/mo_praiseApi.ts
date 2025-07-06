import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoPraise } from '@/types/mo_praise'

export const moPraiseApi = createApi({
  reducerPath: 'moPraiseApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoPraise'],
  endpoints: (builder) => ({
    getAll: builder.query<MoPraise[], void>({
      query: () => '/mo_praise',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoPraise' as const, id: item.id })),
              { type: 'MoPraise' as const, id: 'LIST' },
            ]
          : [{ type: 'MoPraise' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoPraise, number>({
      query: (id) => `/mo_praise/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoPraise' as const, id }],
    }),
    create: builder.mutation<MoPraise, Partial<MoPraise>>({
      query: (body) => ({
        url: '/mo_praise',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoPraise' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoPraise, Partial<MoPraise> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_praise/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoPraise' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_praise/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoPraise' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moPraiseApi