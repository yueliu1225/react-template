import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoTopic } from '@/types/mo_topic'

export const moTopicApi = createApi({
  reducerPath: 'moTopicApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoTopic'],
  endpoints: (builder) => ({
    getAll: builder.query<MoTopic[], void>({
      query: () => '/mo_topic',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoTopic' as const, id: item.id })),
              { type: 'MoTopic' as const, id: 'LIST' },
            ]
          : [{ type: 'MoTopic' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoTopic, number>({
      query: (id) => `/mo_topic/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoTopic' as const, id }],
    }),
    create: builder.mutation<MoTopic, Partial<MoTopic>>({
      query: (body) => ({
        url: '/mo_topic',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoTopic' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoTopic, Partial<MoTopic> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_topic/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoTopic' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_topic/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoTopic' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moTopicApi