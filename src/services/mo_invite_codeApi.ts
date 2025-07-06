import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoInviteCode } from '@/types/mo_invite_code'

export const moInviteCodeApi = createApi({
  reducerPath: 'moInviteCodeApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoInviteCode'],
  endpoints: (builder) => ({
    getAll: builder.query<MoInviteCode[], void>({
      query: () => '/mo_invite_code',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoInviteCode' as const, id: item.id })),
              { type: 'MoInviteCode' as const, id: 'LIST' },
            ]
          : [{ type: 'MoInviteCode' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoInviteCode, number>({
      query: (id) => `/mo_invite_code/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoInviteCode' as const, id }],
    }),
    create: builder.mutation<MoInviteCode, Partial<MoInviteCode>>({
      query: (body) => ({
        url: '/mo_invite_code',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoInviteCode' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoInviteCode, Partial<MoInviteCode> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_invite_code/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoInviteCode' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_invite_code/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoInviteCode' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moInviteCodeApi