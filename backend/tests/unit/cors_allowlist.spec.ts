import { test } from '@japa/runner'
import { isAllowedProductionOrigin } from '#services/cors_allowlist'

// Edge cases for the production CORS allowlist that production_config.spec.ts
// does not cover: protocol checks, malformed input, and CORS_ORIGIN parsing.

test.group('CORS allowlist / edge cases', () => {
  test('rejects Vercel hosts served over plain http', ({ assert }) => {
    assert.isFalse(isAllowedProductionOrigin('http://project-wwc99.vercel.app', undefined))
    assert.isFalse(
      isAllowedProductionOrigin('http://project-wwc99-git-main-team.vercel.app', undefined)
    )
  })

  test('rejects lookalike Vercel hosts')
    .with([
      'https://project-wwc99.vercel.app.evil.com',
      'https://evil-project-wwc99-git-main.vercel.app',
      'https://project-wwc99-a.b.vercel.app',
      'https://project-wwc99vercel.app',
    ])
    .run(({ assert }, origin) => {
      assert.isFalse(isAllowedProductionOrigin(origin, undefined))
    })

  test('rejects empty, malformed, and non-web origins')
    .with(['', 'not a url', 'null', 'file:///etc/passwd', 'javascript:alert(1)'])
    .run(({ assert }, origin) => {
      assert.isFalse(isAllowedProductionOrigin(origin, 'https://links.example.com'))
    })

  test('matches CORS_ORIGIN entries by origin, ignoring paths and trailing slashes', ({
    assert,
  }) => {
    const env = 'https://links.example.com/, https://docs.example.com/app'
    assert.isTrue(isAllowedProductionOrigin('https://links.example.com', env))
    assert.isTrue(isAllowedProductionOrigin('https://docs.example.com', env))
  })

  test('requires an exact scheme and port match for CORS_ORIGIN entries', ({ assert }) => {
    const env = 'https://links.example.com'
    assert.isFalse(isAllowedProductionOrigin('http://links.example.com', env))
    assert.isFalse(isAllowedProductionOrigin('https://links.example.com:8443', env))
  })

  test('skips blank and invalid CORS_ORIGIN entries', ({ assert }) => {
    const env = ' , not a url, ftp://files.example.com, https://links.example.com'
    assert.isTrue(isAllowedProductionOrigin('https://links.example.com', env))
    assert.isFalse(isAllowedProductionOrigin('ftp://files.example.com', env))
  })
})
