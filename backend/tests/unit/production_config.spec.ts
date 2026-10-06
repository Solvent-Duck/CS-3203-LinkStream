import { test } from '@japa/runner'
import { isAllowedProductionOrigin } from '#services/cors_allowlist'
import { resolvePostgresSsl } from '#services/postgres_ssl'

test.group('Production CORS allowlist', () => {
  test('allows the Vercel production origin', ({ assert }) => {
    assert.isTrue(isAllowedProductionOrigin('https://project-wwc99.vercel.app', undefined))
  })

  test('allows this project preview hosts only', ({ assert }) => {
    assert.isTrue(
      isAllowedProductionOrigin('https://project-wwc99-git-main-team.vercel.app', undefined)
    )
    assert.isFalse(isAllowedProductionOrigin('https://other-app.vercel.app', undefined))
    assert.isFalse(isAllowedProductionOrigin('https://project-wwc99.evil.vercel.app', undefined))
  })

  test('allows exact origins from CORS_ORIGIN', ({ assert }) => {
    assert.isTrue(
      isAllowedProductionOrigin(
        'https://links.example.com',
        'https://links.example.com, http://localhost:3000'
      )
    )
    assert.isTrue(
      isAllowedProductionOrigin(
        'http://localhost:3000',
        'https://links.example.com, http://localhost:3000'
      )
    )
    assert.isFalse(isAllowedProductionOrigin('https://evil.example', 'https://links.example.com'))
  })
})

test.group('Postgres SSL', () => {
  test('keeps TLS off for Railway private networking and localhost', ({ assert }) => {
    assert.isFalse(
      resolvePostgresSsl(
        'postgresql://postgres:pw@postgres.railway.internal:5432/railway',
        undefined
      )
    )
    assert.isFalse(
      resolvePostgresSsl('postgresql://postgres:pw@127.0.0.1:5432/linkstream', undefined)
    )
  })

  test('turns TLS on for public hosts and sslmode=require', ({ assert }) => {
    assert.deepEqual(
      resolvePostgresSsl(
        'postgresql://postgres:pw@monorail.proxy.rlwy.net:12345/railway',
        undefined
      ),
      { rejectUnauthorized: false }
    )
    assert.deepEqual(
      resolvePostgresSsl(
        'postgresql://postgres:pw@postgres.railway.internal:5432/railway?sslmode=require',
        undefined
      ),
      { rejectUnauthorized: false }
    )
  })

  test('DB_SSL overrides detection', ({ assert }) => {
    assert.isFalse(resolvePostgresSsl('postgresql://postgres:pw@example.com:5432/railway', false))
    assert.deepEqual(
      resolvePostgresSsl('postgresql://postgres:pw@127.0.0.1:5432/linkstream', true),
      {
        rejectUnauthorized: false,
      }
    )
  })
})
