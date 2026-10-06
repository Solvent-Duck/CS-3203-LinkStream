import { test } from '@japa/runner'

test.group('Health', () => {
  test('GET / responds with hello world', async ({ client }) => {
    const response = await client.get('/')
    response.assertStatus(200)
    response.assertBody({ hello: 'world' })
  })
})
