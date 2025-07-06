import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoUser } from '@/types/mo_user'

export const moUserApi = createApi({
  reducerPath: 'moUserApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api',
  }),
  tagTypes: ['MoUser'],
  endpoints: (builder) => ({
    getAll: builder.query<MoUser[], void>({
      query: () => '/users',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoUser' as const, id: item.id })),
              { type: 'MoUser' as const, id: 'LIST' },
            ]
          : [{ type: 'MoUser' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoUser, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoUser' as const, id }],
    }),
    create: builder.mutation<MoUser, Partial<MoUser>>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoUser' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoUser, Partial<MoUser> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoUser' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoUser' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moUserApi