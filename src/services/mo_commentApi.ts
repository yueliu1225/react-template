import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoComment } from '@/types/mo_comment'

export const moCommentApi = createApi({
  reducerPath: 'moCommentApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoComment'],
  endpoints: (builder) => ({
    getAll: builder.query<MoComment[], void>({
      query: () => '/mo_comment',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoComment' as const, id: item.id })),
              { type: 'MoComment' as const, id: 'LIST' },
            ]
          : [{ type: 'MoComment' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoComment, number>({
      query: (id) => `/mo_comment/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoComment' as const, id }],
    }),
    create: builder.mutation<MoComment, Partial<MoComment>>({
      query: (body) => ({
        url: '/mo_comment',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoComment' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoComment, Partial<MoComment> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_comment/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoComment' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_comment/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoComment' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moCommentApi