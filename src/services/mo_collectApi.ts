import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoCollect } from '@/types/mo_collect'

export const moCollectApi = createApi({
  reducerPath: 'moCollectApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoCollect'],
  endpoints: (builder) => ({
    getAll: builder.query<MoCollect[], void>({
      query: () => '/mo_collect',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoCollect' as const, id: item.id })),
              { type: 'MoCollect' as const, id: 'LIST' },
            ]
          : [{ type: 'MoCollect' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoCollect, number>({
      query: (id) => `/mo_collect/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoCollect' as const, id }],
    }),
    create: builder.mutation<MoCollect, Partial<MoCollect>>({
      query: (body) => ({
        url: '/mo_collect',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoCollect' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoCollect, Partial<MoCollect> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_collect/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoCollect' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_collect/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoCollect' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moCollectApi