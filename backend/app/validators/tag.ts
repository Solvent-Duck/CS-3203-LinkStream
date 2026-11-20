import vine from '@vinejs/vine'

// Naming rules for tags defined so the controller and tests share them.
// Changing the values here updates the app and the tests automatically.
export const MIN_TAG_LENGTH = 2
export const MAX_TAG_LENGTH = 15

// CWE-770: cap how many tags one link can carry, so a single request
// cannot make the server create and attach an unbounded number of tags.
export const MAX_TAGS_PER_LINK = 10

/* VineJS schema for a single tag name.
 The procedure:
 1. string is cleaned (trimmed and lowercase)
 2. length rules checked on cleaned value
    Ex: DevOps->devops & a->a and FAILS

A function so each caller gets a fresh schema object
*/

export const tagNameSchema = () =>
  vine.string().trim().toLowerCase().minLength(MIN_TAG_LENGTH).maxLength(MAX_TAG_LENGTH)

/*
 VineJS schema for the list of tags sent with a link.
 Rejects duplicates and more than MAX_TAGS_PER_LINK entries.
 Used in LinksController (store and update).
*/
export const tagListSchema = () =>
  vine.array(tagNameSchema()).distinct().maxLength(MAX_TAGS_PER_LINK)
