import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoPage } from '@/types/mo_page'

export const moPageApi = createApi({
  reducerPath: 'moPageApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoPage'],
  endpoints: (builder) => ({
    getAll: builder.query<MoPage[], void>({
      query: () => '/mo_page',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoPage' as const, id: item.id })),
              { type: 'MoPage' as const, id: 'LIST' },
            ]
          : [{ type: 'MoPage' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoPage, number>({
      query: (id) => `/mo_page/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoPage' as const, id }],
    }),
    create: builder.mutation<MoPage, Partial<MoPage>>({
      query: (body) => ({
        url: '/mo_page',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoPage' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoPage, Partial<MoPage> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_page/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoPage' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_page/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoPage' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moPageApi