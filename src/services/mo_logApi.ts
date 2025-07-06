import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoLog } from '@/types/mo_log'

export const moLogApi = createApi({
  reducerPath: 'moLogApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoLog'],
  endpoints: (builder) => ({
    getAll: builder.query<MoLog[], void>({
      query: () => '/mo_log',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoLog' as const, id: item.id })),
              { type: 'MoLog' as const, id: 'LIST' },
            ]
          : [{ type: 'MoLog' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoLog, number>({
      query: (id) => `/mo_log/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoLog' as const, id }],
    }),
    create: builder.mutation<MoLog, Partial<MoLog>>({
      query: (body) => ({
        url: '/mo_log',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoLog' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoLog, Partial<MoLog> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_log/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoLog' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_log/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoLog' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moLogApi