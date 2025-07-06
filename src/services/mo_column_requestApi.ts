import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoColumnRequest } from '@/types/mo_column_request'

export const moColumnRequestApi = createApi({
  reducerPath: 'moColumnRequestApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoColumnRequest'],
  endpoints: (builder) => ({
    getAll: builder.query<MoColumnRequest[], void>({
      query: () => '/mo_column_request',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoColumnRequest' as const, id: item.id })),
              { type: 'MoColumnRequest' as const, id: 'LIST' },
            ]
          : [{ type: 'MoColumnRequest' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoColumnRequest, number>({
      query: (id) => `/mo_column_request/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoColumnRequest' as const, id }],
    }),
    create: builder.mutation<MoColumnRequest, Partial<MoColumnRequest>>({
      query: (body) => ({
        url: '/mo_column_request',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoColumnRequest' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoColumnRequest, Partial<MoColumnRequest> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_column_request/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoColumnRequest' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_column_request/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoColumnRequest' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moColumnRequestApi