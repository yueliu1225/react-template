import { vi } from 'vitest'

type DelegateMethod = 'findMany' | 'count' | 'create' | 'findUnique' | 'update' | 'delete'

const methods: DelegateMethod[] = ['findMany', 'count', 'create', 'findUnique', 'update', 'delete']

export type PrismaDelegateMock = Record<DelegateMethod, ReturnType<typeof vi.fn>>

export const createPrismaDelegateMock = () => {
  const delegate = {} as PrismaDelegateMock

  methods.forEach((method) => {
    delegate[method] = vi.fn()
  })

  const reset = () => {
    methods.forEach((method) => {
      delegate[method].mockReset()
    })
  }

  return { delegate, reset }
}
