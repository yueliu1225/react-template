import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoApiSignature } from '@/types/mo_api_signature'

export const moApiSignatureApi = createApi({
  reducerPath: 'moApiSignatureApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoApiSignature'],
  endpoints: (builder) => ({
    getAll: builder.query<MoApiSignature[], void>({
      query: () => '/mo_api_signature',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoApiSignature' as const, id: item.id })),
              { type: 'MoApiSignature' as const, id: 'LIST' },
            ]
          : [{ type: 'MoApiSignature' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoApiSignature, number>({
      query: (id) => `/mo_api_signature/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoApiSignature' as const, id }],
    }),
    create: builder.mutation<MoApiSignature, Partial<MoApiSignature>>({
      query: (body) => ({
        url: '/mo_api_signature',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoApiSignature' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoApiSignature, Partial<MoApiSignature> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_api_signature/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoApiSignature' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_api_signature/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoApiSignature' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moApiSignatureApi