import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { MoSetting } from '@/types/mo_setting'

export const moSettingApi = createApi({
  reducerPath: 'moSettingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['MoSetting'],
  endpoints: (builder) => ({
    getAll: builder.query<MoSetting[], void>({
      query: () => '/mo_setting',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'MoSetting' as const, id: item.id })),
              { type: 'MoSetting' as const, id: 'LIST' },
            ]
          : [{ type: 'MoSetting' as const, id: 'LIST' }],
    }),
    getById: builder.query<MoSetting, number>({
      query: (id) => `/mo_setting/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MoSetting' as const, id }],
    }),
    create: builder.mutation<MoSetting, Partial<MoSetting>>({
      query: (body) => ({
        url: '/mo_setting',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MoSetting' as const, id: 'LIST' }],
    }),
    update: builder.mutation<MoSetting, Partial<MoSetting> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/mo_setting/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'MoSetting' as const, id: arg.id }],
    }),
    delete: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/mo_setting/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'MoSetting' as const, id }],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = moSettingApi