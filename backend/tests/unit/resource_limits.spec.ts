import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { tagListSchema, MAX_TAGS_PER_LINK } from '../../app/validators/tag.js'
import { hit, resetThrottle } from '../../app/middleware/tag_throttle_middleware.js'

// CWE-770: Allocation of Resources Without Limits or Throttling

const validateTags = (value: unknown) => vine.compile(tagListSchema()).validate(value)
const tagNames = (count: number) => Array.from({ length: count }, (_, i) => `tag${i}`)

test.group('Tag list limits (CWE-770)', () => {
  test('accepts up to the maximum number of tags', async ({ assert }) => {
    const tags = tagNames(MAX_TAGS_PER_LINK)
    assert.deepEqual(await validateTags(tags), tags)
  })

  test('rejects one tag over the maximum', async ({ assert }) => {
    await assert.rejects(() => validateTags(tagNames(MAX_TAGS_PER_LINK + 1)))
  })

  test('rejects a very large tag list', async ({ assert }) => {
    await assert.rejects(() => validateTags(tagNames(5000)))
  })

  test('rejects duplicate tags', async ({ assert }) => {
    await assert.rejects(() => validateTags(['devops', 'devops']))
  })
})

test.group('Request throttling (CWE-770)', (group) => {
  group.each.setup(() => resetThrottle())

  const options = { max: 3, windowMs: 60_000 }

  test('allows requests up to the limit', ({ assert }) => {
    for (let i = 0; i < options.max; i++) {
      assert.isTrue(hit('client-a', options, 0).allowed)
    }
  })

  test('blocks requests over the limit and reports retry time', ({ assert }) => {
    for (let i = 0; i < options.max; i++) hit('client-a', options, 0)
    const blocked = hit('client-a', options, 1_000)
    assert.isFalse(blocked.allowed)
    assert.equal(blocked.remaining, 0)
    assert.equal(blocked.retryAfterSeconds, 59)
  })

  test('counts each client separately', ({ assert }) => {
    for (let i = 0; i < options.max; i++) hit('client-a', options, 0)
    assert.isTrue(hit('client-b', options, 0).allowed)
  })

  test('allows requests again after the window ends', ({ assert }) => {
    for (let i = 0; i <= options.max; i++) hit('client-a', options, 0)
    assert.isTrue(hit('client-a', options, options.windowMs).allowed)
  })
})
