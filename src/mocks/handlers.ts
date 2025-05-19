import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/profile', () => {
    return HttpResponse.json({
      nickname: 'Yue',
      summary: 'Test user，from mock API',
    })
  }),
]
