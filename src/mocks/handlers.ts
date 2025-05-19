import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/profile', () => {
    return HttpResponse.json({
      nickname: 'Yue',
      summary: '测试用户，从 mock API 返回',
    })
  }),
]
