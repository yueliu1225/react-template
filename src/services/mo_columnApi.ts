import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoColumn } from '@/types/mo_column'

export const moColumnApi = createApi({
  reducerPath: 'moColumnApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoColumn'],
  endpoints: (builder) => ({
    getAll: builder.query<MoColumn[], void>({
      query: () => '/mo_column',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoColumn' as const, id: item.id })),
              { type: 'MoColumn' as const, id: 'LIST' },
            ]
          : [{ type: 'MoColumn' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoColumn, number>({
      query: (id) => `/mo_column/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoColumn' as const, id }],
    }),
    create: builder.mutation<MoColumn, Partial<MoColumn>>({
      query: (body) => ({
        url: '/mo_column',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoColumn' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoColumn, Partial<MoColumn> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_column/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoColumn' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_column/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoColumn' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moColumnApi