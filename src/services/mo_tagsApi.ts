import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoTags } from '@/types/mo_tags'

export const moTagsApi = createApi({
  reducerPath: 'moTagsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoTags'],
  endpoints: (builder) => ({
    getAll: builder.query<MoTags[], void>({
      query: () => '/mo_tags',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoTags' as const, id: item.id })),
              { type: 'MoTags' as const, id: 'LIST' },
            ]
          : [{ type: 'MoTags' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoTags, number>({
      query: (id) => `/mo_tags/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoTags' as const, id }],
    }),
    create: builder.mutation<MoTags, Partial<MoTags>>({
      query: (body) => ({
        url: '/mo_tags',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoTags' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoTags, Partial<MoTags> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_tags/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoTags' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_tags/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoTags' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moTagsApi