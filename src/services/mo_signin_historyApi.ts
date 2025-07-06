import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoSigninHistory } from '@/types/mo_signin_history'

export const moSigninHistoryApi = createApi({
  reducerPath: 'moSigninHistoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoSigninHistory'],
  endpoints: (builder) => ({
    getAll: builder.query<MoSigninHistory[], void>({
      query: () => '/mo_signin_history',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoSigninHistory' as const, id: item.id })),
              { type: 'MoSigninHistory' as const, id: 'LIST' },
            ]
          : [{ type: 'MoSigninHistory' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoSigninHistory, number>({
      query: (id) => `/mo_signin_history/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoSigninHistory' as const, id }],
    }),
    create: builder.mutation<MoSigninHistory, Partial<MoSigninHistory>>({
      query: (body) => ({
        url: '/mo_signin_history',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoSigninHistory' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoSigninHistory, Partial<MoSigninHistory> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_signin_history/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoSigninHistory' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_signin_history/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoSigninHistory' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moSigninHistoryApi