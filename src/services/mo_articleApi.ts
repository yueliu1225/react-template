import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoArticle } from '@/types/mo_article'

export const moArticleApi = createApi({
  reducerPath: 'moArticleApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoArticle'],
  endpoints: (builder) => ({
    getAll: builder.query<MoArticle[], void>({
      query: () => '/mo_article',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoArticle' as const, id: item.id })),
              { type: 'MoArticle' as const, id: 'LIST' },
            ]
          : [{ type: 'MoArticle' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoArticle, number>({
      query: (id) => `/mo_article/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoArticle' as const, id }],
    }),
    create: builder.mutation<MoArticle, Partial<MoArticle>>({
      query: (body) => ({
        url: '/mo_article',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoArticle' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoArticle, Partial<MoArticle> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_article/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoArticle' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_article/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoArticle' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moArticleApi