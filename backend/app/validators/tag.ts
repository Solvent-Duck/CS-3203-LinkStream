import vine from '@vinejs/vine'

// Naming rules for tags defined so the controller and tests share them.
// Changing the values here updates the app and the tests automatically.
export const MIN_TAG_LENGTH = 2
export const MAX_TAG_LENGTH = 15

/* VineJS schema for a single tag name.
 The procedure:
 1. string is cleaned (trimmed and lowercase)
 2. length rules checked on cleaned value
    Ex: DevOps->devops & a->a and FAILS

A function so each caller gets a fresh schema object
Used in LinksController (Store and update) via vine.array(tagNameSchema())
*/

export const tagNameSchema = () =>
  vine
    .string()
    .trim()
    .toLowerCase()
    .minLength(MIN_TAG_LENGTH)
    .maxLength(MAX_TAG_LENGTH)