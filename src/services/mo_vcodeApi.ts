import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoVcode } from '@/types/mo_vcode'

export const moVcodeApi = createApi({
  reducerPath: 'moVcodeApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoVcode'],
  endpoints: (builder) => ({
    getAll: builder.query<MoVcode[], void>({
      query: () => '/mo_vcode',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoVcode' as const, id: item.id })),
              { type: 'MoVcode' as const, id: 'LIST' },
            ]
          : [{ type: 'MoVcode' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoVcode, number>({
      query: (id) => `/mo_vcode/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoVcode' as const, id }],
    }),
    create: builder.mutation<MoVcode, Partial<MoVcode>>({
      query: (body) => ({
        url: '/mo_vcode',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoVcode' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoVcode, Partial<MoVcode> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_vcode/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoVcode' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_vcode/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoVcode' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moVcodeApi