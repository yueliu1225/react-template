import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoFollow } from '@/types/mo_follow'

export const moFollowApi = createApi({
  reducerPath: 'moFollowApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoFollow'],
  endpoints: (builder) => ({
    getAll: builder.query<MoFollow[], void>({
      query: () => '/mo_follow',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoFollow' as const, id: item.id })),
              { type: 'MoFollow' as const, id: 'LIST' },
            ]
          : [{ type: 'MoFollow' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoFollow, number>({
      query: (id) => `/mo_follow/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoFollow' as const, id }],
    }),
    create: builder.mutation<MoFollow, Partial<MoFollow>>({
      query: (body) => ({
        url: '/mo_follow',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoFollow' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoFollow, Partial<MoFollow> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_follow/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoFollow' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_follow/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoFollow' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moFollowApi