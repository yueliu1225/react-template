import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoManagerRole } from '@/types/mo_manager_role'

export const moManagerRoleApi = createApi({
  reducerPath: 'moManagerRoleApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoManagerRole'],
  endpoints: (builder) => ({
    getAll: builder.query<MoManagerRole[], void>({
      query: () => '/mo_manager_role',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoManagerRole' as const, id: item.id })),
              { type: 'MoManagerRole' as const, id: 'LIST' },
            ]
          : [{ type: 'MoManagerRole' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoManagerRole, number>({
      query: (id) => `/mo_manager_role/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoManagerRole' as const, id }],
    }),
    create: builder.mutation<MoManagerRole, Partial<MoManagerRole>>({
      query: (body) => ({
        url: '/mo_manager_role',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoManagerRole' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoManagerRole, Partial<MoManagerRole> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_manager_role/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoManagerRole' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_manager_role/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoManagerRole' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moManagerRoleApi