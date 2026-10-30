import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { tagNameSchema, MIN_TAG_LENGTH, MAX_TAG_LENGTH } from '../../app/validators/tag.js'

// Helper: runs a value through the tag name schema.
// if valid: resolves cleaned value
// if invalid: throws a validation error assert.rejects
const validate = (value: unknown) => vine.compile(tagNameSchema()).validate(value)

test.group('Tag name validation', () => {
  // Valid Input
  test('accepts a valid tag', async ({ assert }) => {
    assert.equal(await validate('tech'), 'tech')
  })

  // Boundary: accepts exactly minimum length of 2
  test('accepts the minimum length', async ({ assert }) => {
    assert.equal(await validate('a'.repeat(MIN_TAG_LENGTH)), 'aa')
  })

  // Boundary: accepts exactly maximum length of 15
  test('accepts the maximum length', async ({ assert }) => {
    const tag = 'a'.repeat(MAX_TAG_LENGTH)
    assert.equal(await validate(tag), tag)
  })

  // Validator cleans up value so a saved tag is consistent
  test('trims and lowercases', async ({ assert }) => {
    assert.equal(await validate('  DevOps '), 'devops')
  })

  // Invalid Input
  // Boundaries for length
  test('rejects one character below the minimum', async ({ assert }) => {
    await assert.rejects(() => validate('a'.repeat(MIN_TAG_LENGTH - 1)))
  })

  test('rejects one character above the maximum', async ({ assert }) => {
    await assert.rejects(() => validate('a'.repeat(MAX_TAG_LENGTH + 1)))
  })

  test('rejects empty and whitespace-only names', async ({ assert }) => {
    await assert.rejects(() => validate(''))
    await assert.rejects(() => validate('     '))
  })

  test('measures length after trimming', async ({ assert }) => {
    await assert.rejects(() => validate(' a '))
  })

  test('rejects non-string values')
    .with([12345, null, undefined, true, [], {}, ['tech']])
    .run(async ({ assert }, value) => {
      await assert.rejects(() => validate(value))
    })
})
